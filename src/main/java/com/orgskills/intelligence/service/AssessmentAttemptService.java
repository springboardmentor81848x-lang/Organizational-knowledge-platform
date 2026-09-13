package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.assessment.AssessmentAttemptStatusResponse;
import com.orgskills.intelligence.dto.assessment.CreateReattemptRequest;
import com.orgskills.intelligence.dto.assessment.ReattemptRequestResponse;
import com.orgskills.intelligence.entity.AssessmentReattemptRequest;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.AssessmentScope;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.ReattemptRequestStatus;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ForbiddenException;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.AssessmentReattemptRequestRepository;
import com.orgskills.intelligence.repository.AssessmentRepository;
import com.orgskills.intelligence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * The once-only rule for the target-role assessment, and the approval that lifts it.
 *
 * <h2>Why the rule lives here rather than in {@link QuizService}</h2>
 * Two separate operations have to obey it - issuing the question paper and marking a submission -
 * and a third has to undo it exactly once, when an approved attempt is spent. Keeping those in
 * one place is what stops the three drifting apart: a paper that is issued but whose submission
 * is not checked would let anyone retake by holding a tab open, and an approval consumed at the
 * wrong moment would either be spent by a page refresh or never spent at all.
 *
 * <p>Attempts are counted from the assessments themselves rather than from a counter on the user.
 * A counter is a second source of truth for something the {@code assessments} table already
 * records, and the two would eventually disagree - an assessment deleted by an administrator
 * would leave a phantom attempt blocking the employee forever.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AssessmentAttemptService {

    /** How many times the assessment may be taken before approval is needed. */
    private static final int ATTEMPTS_WITHOUT_APPROVAL = 1;

    /**
     * Roles that may rule on a request. A manager may only rule on their own reports; the rest
     * are department- or organisation-wide, which {@link #canDecideFor} narrows.
     */
    private static final Set<Role> APPROVER_ROLES = EnumSet.of(
            Role.MANAGER, Role.DEPARTMENT_HEAD, Role.HR_SPECIALIST, Role.HR_ADMIN,
            Role.LND_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN);

    /** Where a request goes when the employee has no manager on record. */
    private static final Set<Role> FALLBACK_APPROVER_ROLES = EnumSet.of(
            Role.HR_ADMIN, Role.HR_SPECIALIST, Role.SYSTEM_ADMIN, Role.ADMIN);

    private final UserRepository userRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentReattemptRequestRepository reattemptRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final UserSkillService userSkillService;

    // -- The rule ---------------------------------------------------------------

    /**
     * Works out which paper this employee may sit, and refuses if the answer is none.
     *
     * <p>Called both when a paper is built and when answers arrive, and the caller uses the
     * returned scope to decide what goes on the paper - so the entitlement and the contents are
     * decided by the same call and cannot disagree.
     *
     * <p>The order of the checks is the rule. A first attempt, or an approved retake, is the
     * full target-role paper. Only once neither of those applies does an unassessed skill come
     * into it, and that paper covers nothing but those skills - which is what keeps "you must be
     * assessed on a skill you add" from becoming a way to re-sit a role assessment you have
     * already used your attempt on.
     */
    @Transactional(readOnly = true)
    public AssessmentScope requireAttemptAllowed(Long employeeId) {
        User employee = getUser(employeeId);
        if (!employee.getRole().hasDevelopmentTrack()) {
            throw new ValidationException("The " + label(employee.getRole()) + " role has no "
                    + "target-role assessment. This account administers the platform rather than "
                    + "being measured by it.");
        }

        long attempts = assessmentRepository.countCompletedSelfAssessments(employeeId);
        if (attempts < ATTEMPTS_WITHOUT_APPROVAL || unspentApproval(employeeId).isPresent()) {
            return AssessmentScope.TARGET_ROLE;
        }

        if (!userSkillService.getUnassessedSkillIds(employeeId).isEmpty()) {
            return AssessmentScope.NEW_SKILLS;
        }

        boolean pending = reattemptRepository
                .findFirstByEmployeeIdAndStatusOrderByCreatedAtAsc(employeeId, ReattemptRequestStatus.PENDING)
                .isPresent();

        throw new ValidationException(pending
                ? "You have already taken this assessment and your request for another attempt is "
                        + "still awaiting a decision. You can take it again once it is approved."
                : "You have already taken this assessment. Another attempt needs approval from your "
                        + "manager or an HR administrator - send a request from the assessments page.");
    }

    /**
     * Spends the approval that permitted an attempt, immediately after that attempt is recorded.
     *
     * <p>Consuming after the assessment is written, inside the same transaction, is what makes
     * this safe: if marking fails the approval is rolled back with it and the employee has not
     * lost their attempt to a server error.
     */
    @Transactional
    public void consumeApprovalIfPresent(Long employeeId, AssessmentScope scope) {
        // A new-skills paper is not a retake, so it must not eat an approval the employee is
        // holding for the role assessment. Without this, adding one skill after being granted a
        // retake would silently spend the retake on a two-question paper.
        if (scope != AssessmentScope.TARGET_ROLE) {
            return;
        }
        unspentApproval(employeeId).ifPresent(approval -> {
            approval.setConsumedAt(Instant.now());
            reattemptRepository.save(approval);
            log.debug("Consumed reattempt approval {} for employee {}", approval.getId(), employeeId);
        });
    }

    // -- The employee's side ----------------------------------------------------

    /** Where the signed-in employee stands: attempts taken, whether they may take it, and why. */
    @Transactional(readOnly = true)
    public AssessmentAttemptStatusResponse getAttemptStatus(Long employeeId) {
        User employee = getUser(employeeId);

        // An administrator account is told plainly that this is not for them, rather than being
        // shown a locked assessment as though they had used an attempt they never had.
        if (!employee.getRole().hasDevelopmentTrack()) {
            return AssessmentAttemptStatusResponse.builder()
                    .developmentTrack(false)
                    .scope(AssessmentScope.NONE)
                    .attemptsTaken(0)
                    .canTake(false)
                    .requestRequired(false)
                    .pendingSkillCount(0)
                    .message("The " + label(employee.getRole()) + " role is not measured by a "
                            + "target-role assessment. This account administers the platform "
                            + "rather than being assessed by it.")
                    .build();
        }

        long attempts = assessmentRepository.countCompletedSelfAssessments(employeeId);
        Instant lastAttemptAt = assessmentRepository.findLastCompletedSelfAssessmentAt(employeeId).orElse(null);

        Optional<AssessmentReattemptRequest> approval = unspentApproval(employeeId);
        Optional<AssessmentReattemptRequest> pending = reattemptRepository
                .findFirstByEmployeeIdAndStatusOrderByCreatedAtAsc(employeeId, ReattemptRequestStatus.PENDING);
        AssessmentReattemptRequest latest = reattemptRepository
                .findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .findFirst()
                .orElse(null);

        int pendingSkills = userSkillService.getUnassessedSkillIds(employeeId).size();
        boolean firstAttempt = attempts < ATTEMPTS_WITHOUT_APPROVAL;

        // Mirrors requireAttemptAllowed exactly, and in the same order. The two answer the same
        // question for different audiences - one for the screen, one for the request - and a
        // screen that offered something the rule then refused would be worse than no screen.
        AssessmentScope scope;
        if (firstAttempt || approval.isPresent()) {
            scope = AssessmentScope.TARGET_ROLE;
        } else if (pendingSkills > 0) {
            scope = AssessmentScope.NEW_SKILLS;
        } else {
            scope = AssessmentScope.NONE;
        }

        boolean canTake = scope != AssessmentScope.NONE;
        boolean requestRequired = !canTake && pending.isEmpty();

        String message;
        if (firstAttempt) {
            message = "You have not taken your assessment yet. It can be taken once; a further "
                    + "attempt afterwards needs approval.";
        } else if (approval.isPresent()) {
            message = "Your request for another attempt was approved. Taking the assessment now "
                    + "uses that approval, and a further attempt would need a new one.";
        } else if (scope == AssessmentScope.NEW_SKILLS) {
            message = pendingSkills + " skill" + (pendingSkills == 1 ? "" : "s")
                    + " you added are awaiting assessment. This paper covers only those, so it does "
                    + "not affect the levels you have already been measured at.";
        } else if (pending.isPresent()) {
            message = "Your request for another attempt is with your approver. You will be "
                    + "notified when it is decided.";
        } else {
            message = "You have already taken your assessment. Send a request to your manager or "
                    + "HR if you need to take it again.";
        }

        return AssessmentAttemptStatusResponse.builder()
                .developmentTrack(true)
                .scope(scope)
                .attemptsTaken((int) attempts)
                .lastAttemptAt(lastAttemptAt)
                .canTake(canTake)
                .requestRequired(requestRequired)
                .pendingSkillCount(pendingSkills)
                .message(message)
                .latestRequest(latest == null ? null : toResponse(latest))
                .activeApproval(approval.map(this::toResponse).orElse(null))
                .build();
    }

    /**
     * Raises a request for another attempt and tells the approvers about it.
     *
     * <p>Refused before the first attempt has been taken, while one is already pending, and
     * while an approval is still unspent - in each case the employee either does not need a
     * request or already has one, and a second would only give an approver the same decision to
     * make twice.
     */
    @Transactional
    public ReattemptRequestResponse requestReattempt(Long employeeId, CreateReattemptRequest request) {
        User employee = getUser(employeeId);
        if (!employee.getRole().hasDevelopmentTrack()) {
            throw new ValidationException("The " + label(employee.getRole()) + " role does not sit "
                    + "the target-role assessment, so there is no attempt to request.");
        }

        long attempts = assessmentRepository.countCompletedSelfAssessments(employeeId);
        if (attempts < ATTEMPTS_WITHOUT_APPROVAL) {
            throw new ValidationException("You have not taken the assessment yet, so there is "
                    + "nothing to request. Take it first.");
        }
        if (reattemptRepository.findFirstByEmployeeIdAndStatusOrderByCreatedAtAsc(
                employeeId, ReattemptRequestStatus.PENDING).isPresent()) {
            throw new ValidationException("You already have a request awaiting a decision.");
        }
        if (unspentApproval(employeeId).isPresent()) {
            throw new ValidationException("You already have an approved attempt waiting. Take the "
                    + "assessment before asking for another.");
        }

        AssessmentReattemptRequest saved = new AssessmentReattemptRequest();
        saved.setEmployee(employee);
        saved.setReason(request.getReason().trim());
        saved.setStatus(ReattemptRequestStatus.PENDING);
        saved.setAttemptsAtRequest((int) attempts);
        saved = reattemptRepository.save(saved);

        notifyApprovers(employee, saved);

        auditLogService.logEvent(employeeId, employee.getEmail(), "REQUEST_ASSESSMENT_REATTEMPT",
                "AssessmentReattemptRequest", saved.getId().toString(),
                "Requested attempt " + (attempts + 1) + " at the target-role assessment");

        return toResponse(saved);
    }

    /** Every request this employee has raised, newest first. */
    @Transactional(readOnly = true)
    public List<ReattemptRequestResponse> getMyRequests(Long employeeId) {
        return reattemptRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::toResponse)
                .toList();
    }

    // -- The approver's side ----------------------------------------------------

    /**
     * Requests the caller is entitled to rule on, optionally narrowed to one state.
     *
     * <p>Scope is applied here rather than in the query because it depends on the caller's role:
     * a manager sees their own reports, a department head their department, and HR, L&amp;D and
     * administrator accounts the whole organisation. Filtering in the service keeps that one
     * rule in one place, at the cost of reading rows a manager will not see - acceptable while
     * requests are rare, which a once-only assessment makes them.
     */
    @Transactional(readOnly = true)
    public List<ReattemptRequestResponse> getRequestsForApprover(Long actorId, ReattemptRequestStatus status) {
        User actor = getUser(actorId);
        requireApprover(actor);

        return reattemptRepository.findForReview(status).stream()
                .filter(request -> canDecideFor(actor, request.getEmployee()))
                .map(this::toResponse)
                .toList();
    }

    /** Approves or refuses a request, and tells the employee either way. */
    @Transactional
    public ReattemptRequestResponse decide(Long actorId, Long requestId, boolean approve, String note) {
        User actor = getUser(actorId);
        requireApprover(actor);

        AssessmentReattemptRequest request = reattemptRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Reattempt request not found for id: " + requestId));

        User employee = request.getEmployee();
        if (employee.getId().equals(actorId)) {
            throw new ValidationException("You cannot approve your own request for another attempt.");
        }
        if (!canDecideFor(actor, employee)) {
            throw new ForbiddenException("Access denied. " + employee.getFullName()
                    + " is not someone you can decide assessment attempts for.");
        }
        if (request.getStatus() != ReattemptRequestStatus.PENDING) {
            throw new ValidationException("This request was already " + request.getStatus().name().toLowerCase()
                    + " and cannot be decided again.");
        }

        request.setStatus(approve ? ReattemptRequestStatus.APPROVED : ReattemptRequestStatus.REJECTED);
        request.setDecidedBy(actor);
        request.setDecidedAt(Instant.now());
        request.setDecisionNote(note == null || note.isBlank() ? null : note.trim());
        AssessmentReattemptRequest saved = reattemptRepository.save(request);

        String title = approve ? "Another assessment attempt approved" : "Assessment retake request declined";
        String message = approve
                ? actor.getFullName() + " approved your request to take the target-role assessment again. "
                        + "It is open to you now, for one attempt."
                : actor.getFullName() + " declined your request to take the target-role assessment again."
                        + (saved.getDecisionNote() == null ? "" : " Note: " + saved.getDecisionNote());
        notificationService.createNotification(employee, title, message,
                NotificationType.ASSESSMENT_REATTEMPT_DECISION);

        auditLogService.logEvent(actorId, actor.getEmail(),
                approve ? "APPROVE_ASSESSMENT_REATTEMPT" : "REJECT_ASSESSMENT_REATTEMPT",
                "AssessmentReattemptRequest", saved.getId().toString(),
                (approve ? "Approved" : "Rejected") + " a retake request from " + employee.getEmail());

        return toResponse(saved);
    }

    /** Whether this account can see the approvals queue at all, for painting the tab. */
    @Transactional(readOnly = true)
    public boolean isApprover(Long actorId) {
        return APPROVER_ROLES.contains(getUser(actorId).getRole());
    }

    // -- Helpers ----------------------------------------------------------------

    private Optional<AssessmentReattemptRequest> unspentApproval(Long employeeId) {
        return reattemptRepository.findFirstByEmployeeIdAndStatusAndConsumedAtIsNullOrderByDecidedAtAsc(
                employeeId, ReattemptRequestStatus.APPROVED);
    }

    private void requireApprover(User actor) {
        if (!APPROVER_ROLES.contains(actor.getRole())) {
            throw new ForbiddenException("Access denied. Deciding assessment attempts is a manager, "
                    + "HR or administrator responsibility.");
        }
    }

    /**
     * Whether an approver's authority actually covers this employee. A manager's does not extend
     * past their own reports, and a department head's not past their department, so without this
     * every approver role would be an organisation-wide one.
     */
    private boolean canDecideFor(User actor, User employee) {
        return switch (actor.getRole()) {
            case MANAGER -> employee.getManager() != null
                    && employee.getManager().getId().equals(actor.getId());
            case DEPARTMENT_HEAD -> actor.getDepartment() != null
                    && actor.getDepartment().equalsIgnoreCase(employee.getDepartment());
            case HR_SPECIALIST, HR_ADMIN, LND_ADMIN, SYSTEM_ADMIN, ADMIN -> true;
            default -> false;
        };
    }

    /**
     * Notifies whoever can act. The employee's own manager is the right person; when there is
     * none on record the request would otherwise sit unseen, so it goes to HR instead.
     */
    private void notifyApprovers(User employee, AssessmentReattemptRequest request) {
        Set<User> recipients = new LinkedHashSet<>();
        if (employee.getManager() != null) {
            recipients.add(employee.getManager());
        } else {
            recipients.addAll(userRepository.findByRoleIn(FALLBACK_APPROVER_ROLES));
        }
        recipients.removeIf(recipient -> recipient.getId().equals(employee.getId()));

        String message = employee.getFullName() + " has asked to take the target-role assessment again "
                + "(attempt " + (request.getAttemptsAtRequest() + 1) + "). Reason: " + request.getReason();

        for (User recipient : recipients) {
            notificationService.createNotification(recipient, "Assessment retake requested", message,
                    NotificationType.ASSESSMENT_REATTEMPT_REQUEST);
        }
    }

    private ReattemptRequestResponse toResponse(AssessmentReattemptRequest request) {
        User employee = request.getEmployee();
        User decider = request.getDecidedBy();
        return ReattemptRequestResponse.builder()
                .requestId(request.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getFullName())
                .employeeEmail(employee.getEmail())
                .employeeJobTitle(employee.getJobTitle())
                .employeeDepartment(employee.getDepartment())
                .status(request.getStatus())
                .reason(request.getReason())
                .attemptsAtRequest(request.getAttemptsAtRequest())
                .createdAt(request.getCreatedAt())
                .decidedById(decider == null ? null : decider.getId())
                .decidedByName(decider == null ? null : decider.getFullName())
                .decisionNote(request.getDecisionNote())
                .decidedAt(request.getDecidedAt())
                .consumedAt(request.getConsumedAt())
                .build();
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));
    }

    /** SCREAMING_SNAKE role names read badly mid-sentence. */
    private String label(Role role) {
        return role.name().replace('_', ' ').toLowerCase();
    }
}
