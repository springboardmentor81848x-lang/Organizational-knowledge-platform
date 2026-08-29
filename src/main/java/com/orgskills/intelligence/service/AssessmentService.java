package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultRequest;
import com.orgskills.intelligence.dto.assessment.AssessmentResultResponse;
import com.orgskills.intelligence.dto.assessment.CreateAssessmentRequest;
import com.orgskills.intelligence.dto.assessment.SkillProgressionResponse;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.entity.Assessment;
import com.orgskills.intelligence.entity.AssessmentResult;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.AssessmentRepository;
import com.orgskills.intelligence.repository.AssessmentResultRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Assessments, and the chain they set off.
 *
 * <p>Submitting an assessment is one atomic service-layer operation: results are persisted, the
 * employee's skill levels move to the assessed levels, the improvement per skill is computed and
 * stored, gap analysis re-runs against the new levels, and the employee is notified. The frontend
 * calls {@code submit} and nothing else — there is no separate "now recalculate" step to forget.
 *
 * <p>Assessment is the only route by which proficiency rises. Course completion does not move it;
 * a level is a claim about ability, and only an assessment is evidence for that claim.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AssessmentService {

    /** Roles allowed to assess, schedule for, or inspect somebody other than themselves. */
    private static final Set<Role> ASSESSMENT_ADMIN_ROLES = EnumSet.of(
            Role.MANAGER, Role.DEPARTMENT_HEAD, Role.HR_SPECIALIST, Role.HR_ADMIN,
            Role.LND_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN);

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final GapAnalysisService gapAnalysisService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    // ── Scheduling ──────────────────────────────────────────────────────────────

    /**
     * Schedules an assessment covering the requested skills. Rejects a second pending assessment
     * of the same type by the same assessor covering a skill already awaiting judgement, which
     * would otherwise let two half-finished reviews of the same thing race each other.
     */
    @Transactional
    public AssessmentResponse createAssessment(Long actorId, CreateAssessmentRequest request) {
        User assessor = getUser(actorId);
        Long employeeId = request.getEmployeeId() != null ? request.getEmployeeId() : actorId;
        User employee = employeeId.equals(actorId) ? assessor : getUser(employeeId);

        AssessmentType type = request.getAssessmentType();
        requireAssessorIsValidFor(assessor, employee, type);

        List<Long> skillIds = distinctSkillIds(request.getSkillIds());
        List<Skill> skills = skillIds.stream().map(this::getSkill).toList();

        List<Assessment> duplicates =
                assessmentRepository.findPendingDuplicates(employeeId, actorId, type, skillIds);
        if (!duplicates.isEmpty()) {
            throw new ValidationException("A pending " + type + " assessment by this assessor already covers "
                    + "one or more of these skills for " + employee.getFullName());
        }

        Assessment assessment = new Assessment();
        assessment.setEmployee(employee);
        assessment.setAssessor(assessor);
        assessment.setAssessmentType(type);
        assessment.setStatus(AssessmentStatus.PENDING);
        assessment.setDate(request.getDate() != null ? request.getDate() : Instant.now());
        assessment.setComments(request.getComments());
        Assessment saved = assessmentRepository.save(assessment);

        // Placeholder rows declare the scope; proficiency and score stay null until submission.
        List<AssessmentResult> scope = skills.stream().map(skill -> {
            AssessmentResult result = new AssessmentResult();
            result.setAssessment(saved);
            result.setSkill(skill);
            return result;
        }).toList();
        assessmentResultRepository.saveAll(scope);

        auditLogService.logEvent(actorId, assessor.getEmail(), "CREATE_ASSESSMENT", "Assessment",
                saved.getId().toString(), "Scheduled " + type + " assessment for " + employee.getEmail());

        return toResponse(saved, scope);
    }

    // ── The chain ───────────────────────────────────────────────────────────────

    /**
     * Submits results and runs the whole chain in one transaction: persist results, raise the
     * employee's skill levels, record the improvement, recalculate gaps against the new levels,
     * and notify. Gap recalculation in turn regenerates recommendations and refreshes learning
     * paths, so those are not invoked again here.
     */
    @Transactional
    public AssessmentResponse submitAssessment(Long actorId, Long assessmentId, SubmitAssessmentRequest request) {
        User actor = getUser(actorId);
        Assessment assessment = getAssessment(assessmentId);

        if (assessment.getStatus() != AssessmentStatus.PENDING) {
            throw new ValidationException("Assessment " + assessmentId + " is already "
                    + assessment.getStatus() + " and cannot accept results again");
        }
        if (!assessment.getAssessor().getId().equals(actorId)
                && !ASSESSMENT_ADMIN_ROLES.contains(actor.getRole())) {
            throw new ValidationException("Access denied. This assessment belongs to another assessor.");
        }

        // (a) Persist the results.
        List<AssessmentResult> existing = assessmentResultRepository.findByAssessmentId(assessmentId);
        Map<Long, AssessmentResult> bySkillId = new LinkedHashMap<>();
        existing.forEach(r -> bySkillId.put(r.getSkill().getId(), r));

        User employee = assessment.getEmployee();
        List<AssessmentResult> submitted = new ArrayList<>();
        Set<Long> seen = new HashSet<>();

        for (AssessmentResultRequest line : request.getResults()) {
            if (!seen.add(line.getSkillId())) {
                throw new ValidationException("Skill " + line.getSkillId() + " appears more than once in the submission");
            }
            ProficiencyLevel awarded = resolveProficiency(line);

            AssessmentResult result = bySkillId.get(line.getSkillId());
            if (result == null) {
                result = new AssessmentResult();
                result.setAssessment(assessment);
                result.setSkill(getSkill(line.getSkillId()));
                bySkillId.put(line.getSkillId(), result);
            }

            // (b) Move the employee's skill to the assessed level, and (c) record the improvement.
            ProficiencyLevel previous = applyToEmployeeSkill(employee, result.getSkill(), awarded, line.getScore());

            result.setProficiency(awarded);
            result.setScore(line.getScore());
            result.setPreviousProficiency(previous);
            result.setImprovement(awarded.getScore() - (previous == null ? 0 : previous.getScore()));
            submitted.add(result);
        }

        // A scheduled skill nobody judged leaves no empty row behind.
        List<AssessmentResult> unjudged = existing.stream()
                .filter(r -> !seen.contains(r.getSkill().getId()))
                .toList();
        if (!unjudged.isEmpty()) {
            assessmentResultRepository.deleteAll(unjudged);
        }

        assessment.setStatus(AssessmentStatus.COMPLETED);
        assessment.setSubmittedAt(Instant.now());
        assessment.setDate(Instant.now());
        if (request.getComments() != null) {
            assessment.setComments(request.getComments());
        }
        assessmentRepository.save(assessment);
        List<AssessmentResult> savedResults = assessmentResultRepository.saveAll(submitted);

        // (d) and (e) Recalculate gaps against the new levels. calculateAndFetchUserGaps also
        // regenerates recommendations and refreshes learning paths.
        gapAnalysisService.calculateAndFetchUserGaps(employee.getId());

        // (f) Tell the employee what changed.
        notifyResult(employee, savedResults);

        auditLogService.logEvent(actorId, actor.getEmail(), "SUBMIT_ASSESSMENT", "Assessment",
                assessment.getId().toString(),
                "Submitted " + assessment.getAssessmentType() + " assessment for " + employee.getEmail()
                        + " covering " + savedResults.size() + " skill(s)");

        return toResponse(assessment, savedResults);
    }

    /** Schedules and immediately submits — the shape the self and peer endpoints need. */
    @Transactional
    public AssessmentResponse createAndSubmit(Long actorId, Long employeeId, AssessmentType type,
                                              SubmitAssessmentRequest request) {
        CreateAssessmentRequest create = new CreateAssessmentRequest();
        create.setEmployeeId(employeeId);
        create.setAssessmentType(type);
        create.setSkillIds(request.getResults().stream().map(AssessmentResultRequest::getSkillId).toList());
        create.setComments(request.getComments());

        AssessmentResponse created = createAssessment(actorId, create);
        return submitAssessment(actorId, created.getAssessmentId(), request);
    }

    /**
     * Writes the assessed level onto the employee's skill record, creating it if this is the
     * first time the skill has been assessed. Returns the level held beforehand, or null when
     * there was no record at all.
     */
    private ProficiencyLevel applyToEmployeeSkill(User employee, Skill skill, ProficiencyLevel awarded, Double score) {
        UserSkill userSkill = userSkillRepository.findByUserIdAndSkillId(employee.getId(), skill.getId())
                .orElse(null);
        ProficiencyLevel previous = userSkill == null ? null : userSkill.getProficiencyLevel();

        if (userSkill == null) {
            userSkill = new UserSkill();
            userSkill.setUser(employee);
            userSkill.setSkill(skill);
        }
        userSkill.setProficiencyLevel(awarded);
        // ratingScore mirrors the canonical level score so the two can never disagree; the raw
        // out-of-100 mark stays on the assessment result, where it belongs.
        userSkill.setRatingScore((double) awarded.getScore());
        userSkillRepository.save(userSkill);
        return previous;
    }

    /** One notification summarising the assessment, naming the skills that actually moved. */
    private void notifyResult(User employee, List<AssessmentResult> results) {
        List<AssessmentResult> improved = results.stream()
                .filter(r -> r.getImprovement() != null && r.getImprovement() > 0)
                .toList();

        String message;
        if (improved.isEmpty()) {
            message = "Your assessment has been recorded: " + results.stream()
                    .map(r -> r.getSkill().getName() + " confirmed at " + label(r.getProficiency()))
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("no skills assessed") + ".";
        } else {
            message = improved.stream()
                    .map(r -> "Your " + r.getSkill().getName() + " proficiency has improved to "
                            + label(r.getProficiency()))
                    .reduce((a, b) -> a + ". " + b)
                    .orElse("") + ".";
        }

        notificationService.createNotification(employee, "Assessment results available", message,
                NotificationType.ASSESSMENT_RESULT);
    }

    // ── Reading ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AssessmentResultResponse> getResults(Long actorId, Long assessmentId) {
        User actor = getUser(actorId);
        Assessment assessment = getAssessment(assessmentId);
        requireCanView(actor, assessment);

        return assessmentResultRepository.findByAssessmentId(assessmentId).stream()
                .map(this::toResultResponse)
                .toList();
    }

    /** Full assessment history for an employee, newest first, for before/after comparison. */
    @Transactional(readOnly = true)
    public List<AssessmentResponse> getAssessments(Long actorId, Long employeeId) {
        User actor = getUser(actorId);
        Long target = employeeId != null ? employeeId : actorId;
        requireCanActFor(actor, target);

        return assessmentRepository.findByEmployeeIdOrderByDateDesc(target).stream()
                .map(a -> toResponse(a, assessmentResultRepository.findByAssessmentId(a.getId())))
                .toList();
    }

    /** Assessments the actor has carried out on others. */
    @Transactional(readOnly = true)
    public List<AssessmentResponse> getAssessmentsByAssessor(Long actorId) {
        return assessmentRepository.findByAssessorIdOrderByDateDesc(actorId).stream()
                .map(a -> toResponse(a, assessmentResultRepository.findByAssessmentId(a.getId())))
                .toList();
    }

    /**
     * Previous versus current proficiency per skill, with the improvement delta, drawn from the
     * two most recent submitted assessments of each skill.
     */
    @Transactional(readOnly = true)
    public List<SkillProgressionResponse> getHistory(Long actorId, Long employeeId) {
        User actor = getUser(actorId);
        requireCanActFor(actor, employeeId);
        if (!userRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("User not found for id: " + employeeId);
        }

        // Results arrive newest first, so the first two entries per skill are the ones we want.
        Map<Long, List<AssessmentResult>> bySkill = new LinkedHashMap<>();
        for (AssessmentResult result : assessmentResultRepository.findSubmittedResultsForEmployee(employeeId)) {
            bySkill.computeIfAbsent(result.getSkill().getId(), k -> new ArrayList<>()).add(result);
        }

        List<SkillProgressionResponse> progression = new ArrayList<>();
        for (List<AssessmentResult> history : bySkill.values()) {
            AssessmentResult current = history.get(0);
            AssessmentResult previous = history.size() > 1 ? history.get(1) : null;

            ProficiencyLevel previousLevel = previous != null
                    ? previous.getProficiency()
                    : current.getPreviousProficiency();

            progression.add(SkillProgressionResponse.builder()
                    .skillId(current.getSkill().getId())
                    .skillName(current.getSkill().getName())
                    .previousProficiency(previousLevel)
                    .previousScore(previousLevel == null ? null : previousLevel.getScore())
                    .previousAssessedAt(previous == null ? null : previous.getAssessment().getDate())
                    .currentProficiency(current.getProficiency())
                    .currentScore(current.getProficiency().getScore())
                    .currentAssessedAt(current.getAssessment().getDate())
                    .improvement(current.getProficiency().getScore()
                            - (previousLevel == null ? 0 : previousLevel.getScore()))
                    .assessmentCount(history.size())
                    .build());
        }

        progression.sort(Comparator.comparing(SkillProgressionResponse::getSkillName));
        return progression;
    }

    // ── Validation helpers ──────────────────────────────────────────────────────

    /**
     * Resolves the awarded level from either the enum name or the canonical 0-4 score, rejecting
     * a missing value, a contradiction between the two, or a score outside the scale.
     */
    private ProficiencyLevel resolveProficiency(AssessmentResultRequest line) {
        if (line.getProficiency() == null && line.getProficiencyScore() == null) {
            throw new ValidationException("Skill " + line.getSkillId()
                    + ": either proficiency or proficiencyScore (" + ProficiencyLevel.MIN_SCORE + "-"
                    + ProficiencyLevel.MAX_SCORE + ") is required");
        }

        ProficiencyLevel fromScore = null;
        if (line.getProficiencyScore() != null) {
            try {
                fromScore = ProficiencyLevel.fromScore(line.getProficiencyScore().intValue());
            } catch (IllegalArgumentException ex) {
                throw new ValidationException("Skill " + line.getSkillId() + ": " + ex.getMessage());
            }
        }

        if (line.getProficiency() != null && fromScore != null && line.getProficiency() != fromScore) {
            throw new ValidationException("Skill " + line.getSkillId() + ": proficiency "
                    + line.getProficiency() + " does not match proficiencyScore " + line.getProficiencyScore()
                    + " (" + fromScore + ")");
        }
        return line.getProficiency() != null ? line.getProficiency() : fromScore;
    }

    private List<Long> distinctSkillIds(List<Long> skillIds) {
        List<Long> distinct = skillIds.stream().distinct().toList();
        if (distinct.size() != skillIds.size()) {
            throw new ValidationException("The same skill cannot be listed twice on one assessment");
        }
        return distinct;
    }

    /** A SELF assessment must be self-authored; PEER and MANAGER must not be. */
    private void requireAssessorIsValidFor(User assessor, User employee, AssessmentType type) {
        boolean self = assessor.getId().equals(employee.getId());
        if (type == AssessmentType.SELF && !self) {
            throw new ValidationException("A SELF assessment must be submitted by the employee themselves");
        }
        if (type != AssessmentType.SELF && self) {
            throw new ValidationException("A " + type + " assessment cannot be submitted for yourself");
        }
        if (type == AssessmentType.MANAGER && !ASSESSMENT_ADMIN_ROLES.contains(assessor.getRole())) {
            throw new ValidationException("Only a manager, HR or L&D role can submit a MANAGER assessment");
        }
    }

    private void requireCanActFor(User actor, Long employeeId) {
        if (!actor.getId().equals(employeeId) && !ASSESSMENT_ADMIN_ROLES.contains(actor.getRole())) {
            throw new ValidationException("Access denied. These assessments belong to another employee.");
        }
    }

    private void requireCanView(User actor, Assessment assessment) {
        if (actor.getId().equals(assessment.getEmployee().getId())
                || actor.getId().equals(assessment.getAssessor().getId())
                || ASSESSMENT_ADMIN_ROLES.contains(actor.getRole())) {
            return;
        }
        throw new ValidationException("Access denied. This assessment belongs to another employee.");
    }

    // ── Mapping ─────────────────────────────────────────────────────────────────

    private AssessmentResponse toResponse(Assessment assessment, List<AssessmentResult> results) {
        return AssessmentResponse.builder()
                .assessmentId(assessment.getId())
                .employeeId(assessment.getEmployee().getId())
                .employeeName(assessment.getEmployee().getFullName())
                .assessorId(assessment.getAssessor().getId())
                .assessorName(assessment.getAssessor().getFullName())
                .assessmentType(assessment.getAssessmentType())
                .status(assessment.getStatus())
                .date(assessment.getDate())
                .submittedAt(assessment.getSubmittedAt())
                .comments(assessment.getComments())
                .results(results == null ? List.of() : results.stream().map(this::toResultResponse).toList())
                .build();
    }

    private AssessmentResultResponse toResultResponse(AssessmentResult result) {
        return AssessmentResultResponse.builder()
                .resultId(result.getResultId())
                .assessmentId(result.getAssessment().getId())
                .skillId(result.getSkill().getId())
                .skillName(result.getSkill().getName())
                .proficiency(result.getProficiency())
                .proficiencyScore(result.getProficiency() == null ? null : result.getProficiency().getScore())
                .score(result.getScore())
                .previousProficiency(result.getPreviousProficiency())
                .improvement(result.getImprovement())
                .build();
    }

    /** "ADVANCED" reads poorly in a sentence; notifications use "Advanced". */
    private String label(ProficiencyLevel level) {
        String name = level.name();
        return name.charAt(0) + name.substring(1).toLowerCase();
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));
    }

    private Skill getSkill(Long skillId) {
        return skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + skillId));
    }

    private Assessment getAssessment(Long assessmentId) {
        return assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found for id: " + assessmentId));
    }
}
