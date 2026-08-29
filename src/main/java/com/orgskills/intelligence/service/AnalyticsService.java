package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.analytics.DepartmentAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.EmployeeAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.ImprovedAfterTraining;
import com.orgskills.intelligence.dto.analytics.LearningPathSummary;
import com.orgskills.intelligence.dto.analytics.OrganizationAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.RecentAssessmentResultSummary;
import com.orgskills.intelligence.dto.analytics.SkillGapFrequency;
import com.orgskills.intelligence.dto.analytics.TeamAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.TrainingProgramUptake;
import com.orgskills.intelligence.dto.analytics.UpcomingSessionSummary;
import com.orgskills.intelligence.dto.employee.AchievementResponse;
import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.entity.Achievement;
import com.orgskills.intelligence.entity.AssessmentResult;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.KnowledgeSession;
import com.orgskills.intelligence.entity.LearningPath;
import com.orgskills.intelligence.entity.MentorshipMatch;
import com.orgskills.intelligence.entity.SessionRegistration;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.entity.enums.SessionStatus;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.repository.AchievementRepository;
import com.orgskills.intelligence.repository.AssessmentResultRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.LearningPathRepository;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
import com.orgskills.intelligence.repository.SessionRegistrationRepository;
import com.orgskills.intelligence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Read-only dashboards over everything the platform records.
 *
 * <p>Every figure here is computed from the underlying tables on each request. Nothing is cached
 * or precomputed, so a dashboard can never disagree with the assessment, enrolment or gap rows it
 * is describing — a stale number on a skills dashboard is worse than a slow one.
 *
 * <p>Scoping is enforced here rather than by annotation, because who may see what depends on the
 * relationship between the caller and the subject: a manager sees their own reports, a department
 * head their own department.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    /** Roles that may read any employee, team or department. */
    private static final Set<Role> ORG_WIDE_ROLES = EnumSet.of(
            Role.HR_SPECIALIST, Role.HR_ADMIN, Role.LND_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN);

    /** How many recent assessment results an employee dashboard carries. */
    private static final int RECENT_ASSESSMENT_LIMIT = 10;

    /** How many courses the "highest enrolment" list carries. */
    private static final int TOP_PROGRAM_LIMIT = 5;

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GapAnalysisRepository gapAnalysisRepository;
    private final LearningPathRepository learningPathRepository;
    private final AchievementRepository achievementRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final MentorshipMatchRepository mentorshipMatchRepository;
    private final SessionRegistrationRepository sessionRegistrationRepository;
    private final UserSkillService userSkillService;
    private final GapAnalysisService gapAnalysisService;
    private final ManagerService managerService;
    private final HrIntelligenceService hrIntelligenceService;

    // ── Employee dashboard ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public EmployeeAnalyticsResponse getEmployeeAnalytics(Long actorId, Long employeeId) {
        User actor = getUser(actorId);
        User employee = getUser(employeeId);
        requireCanViewEmployee(actor, employee);

        List<Enrollment> enrollments = enrollmentRepository.findByEmployeeId(employeeId);
        double averageProgress = enrollments.stream()
                .mapToDouble(e -> e.getProgress() == null ? 0.0 : e.getProgress())
                .average()
                .orElse(0.0);

        return EmployeeAnalyticsResponse.builder()
                .employeeId(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .jobTitle(employee.getJobTitle())
                .department(employee.getDepartment())
                .skillProfile(userSkillService.getUserSkills(employeeId))
                .gapSummary(gapAnalysisService.getUserGapSummary(employeeId))
                .activeLearningPaths(activeLearningPaths(employeeId))
                .learningProgressPercent(round(averageProgress))
                .activeEnrollments(enrollments.stream()
                        .filter(e -> e.getStatus() == EnrollmentStatus.NOT_STARTED
                                || e.getStatus() == EnrollmentStatus.IN_PROGRESS)
                        .count())
                .completedEnrollments(enrollments.stream()
                        .filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED
                                || e.getStatus() == EnrollmentStatus.CERTIFIED)
                        .count())
                .achievements(achievementRepository.findByEmployeeIdOrderByEarnedAtDesc(employeeId).stream()
                        .map(this::toAchievementResponse)
                        .toList())
                .upcomingSessions(upcomingSessions(employeeId))
                .activeMentor(activeMentor(employeeId))
                .recentAssessmentResults(recentAssessmentResults(employeeId))
                .generatedAt(Instant.now())
                .build();
    }

    private List<LearningPathSummary> activeLearningPaths(Long employeeId) {
        return learningPathRepository.findByEmployeeIdOrderByGeneratedAtDesc(employeeId).stream()
                .filter(p -> !"COMPLETED".equalsIgnoreCase(p.getStatus())
                        && !"OBSOLETE".equalsIgnoreCase(p.getStatus()))
                .map(this::toLearningPathSummary)
                .toList();
    }

    /** Sessions the employee is registered for that have not yet taken place. */
    private List<UpcomingSessionSummary> upcomingSessions(Long employeeId) {
        Instant now = Instant.now();
        return sessionRegistrationRepository.findByEmployeeId(employeeId).stream()
                .map(SessionRegistration::getSession)
                .filter(s -> s.getStatus() == SessionStatus.SCHEDULED)
                .filter(s -> s.getSessionDate() != null && s.getSessionDate().isAfter(now))
                .sorted(Comparator.comparing(KnowledgeSession::getSessionDate))
                .map(s -> UpcomingSessionSummary.builder()
                        .sessionId(s.getId())
                        .title(s.getTitle())
                        .mentorName(s.getMentor().getFullName())
                        .sessionDate(s.getSessionDate())
                        .durationMinutes(s.getDurationMinutes())
                        .build())
                .toList();
    }

    /** The employee's current mentorship as mentee; null when they are not being mentored. */
    private MentorshipResponse activeMentor(Long employeeId) {
        return mentorshipMatchRepository
                .findByMenteeIdAndStatusOrderByCreatedAtDesc(employeeId, MentorshipStatus.ACTIVE).stream()
                .findFirst()
                .map(this::toMentorshipResponse)
                .orElse(null);
    }

    private List<RecentAssessmentResultSummary> recentAssessmentResults(Long employeeId) {
        return assessmentResultRepository.findSubmittedResultsForEmployee(employeeId).stream()
                .limit(RECENT_ASSESSMENT_LIMIT)
                .map(r -> RecentAssessmentResultSummary.builder()
                        .assessmentId(r.getAssessment().getId())
                        .assessmentType(r.getAssessment().getAssessmentType())
                        .skillId(r.getSkill().getId())
                        .skillName(r.getSkill().getName())
                        .previousProficiency(r.getPreviousProficiency())
                        .proficiency(r.getProficiency())
                        .improvement(r.getImprovement())
                        .assessedAt(r.getAssessment().getDate())
                        .build())
                .toList();
    }

    // ── Team dashboard ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public TeamAnalyticsResponse getTeamAnalytics(Long actorId, Long managerId) {
        User actor = getUser(actorId);
        User manager = getUser(managerId);
        requireCanViewTeam(actor, manager);

        List<User> team = managerService.getTeamMembers(managerId);
        List<Long> teamIds = team.stream().map(User::getId).toList();

        return TeamAnalyticsResponse.builder()
                .managerId(manager.getId())
                .managerName(manager.getFullName())
                .teamSize(team.size())
                .gapHeatmap(managerService.getGapHeatmap(team, "TEAM", manager.getFullName()))
                .highRiskGapAlerts(highSeverityAlerts(teamIds))
                .memberSnapshots(managerService.getMemberSummaries(team))
                .trainingAdoption(managerService.getTrainingAdoption(team))
                .improvedAfterTraining(improvedAfterTraining(teamIds))
                .topTrainingPrograms(topTrainingPrograms(teamIds))
                .generatedAt(Instant.now())
                .build();
    }

    /**
     * Gaps at severity HIGH. CRITICAL gaps are deliberately excluded: they already raise their own
     * alert when gap analysis runs, and the team dashboard exists to surface what is not yet
     * screaming.
     */
    private List<GapAnalysisResponse> highSeverityAlerts(List<Long> employeeIds) {
        if (employeeIds.isEmpty()) {
            return List.of();
        }
        return gapAnalysisRepository.findByUserIdIn(employeeIds).stream()
                .filter(g -> g.getRiskSeverity() == RiskSeverity.HIGH)
                .sorted(Comparator.comparing(GapAnalysis::getGapScore).reversed())
                .map(gapAnalysisService::toResponse)
                .toList();
    }

    /**
     * Employees whose assessed level for a skill rose after they completed a course covering it.
     * Only assessments dated after the completion count, so an improvement recorded before the
     * training is not credited to it.
     */
    private List<ImprovedAfterTraining> improvedAfterTraining(List<Long> employeeIds) {
        if (employeeIds.isEmpty()) {
            return List.of();
        }

        List<Enrollment> completed = enrollmentRepository
                .findByEmployeeIdInAndStatus(employeeIds, EnrollmentStatus.COMPLETED);
        if (completed.isEmpty()) {
            return List.of();
        }

        List<AssessmentResult> results = assessmentResultRepository
                .findSubmittedResultsForEmployees(employeeIds);
        if (results.isEmpty()) {
            return List.of();
        }

        List<ImprovedAfterTraining> improved = new ArrayList<>();
        for (Enrollment enrollment : completed) {
            if (enrollment.getCourse().getSkillCovered() == null || enrollment.getCompletionDate() == null) {
                continue;
            }
            Long employeeId = enrollment.getEmployee().getId();
            Long skillId = enrollment.getCourse().getSkillCovered().getId();

            results.stream()
                    .filter(r -> r.getAssessment().getEmployee().getId().equals(employeeId))
                    .filter(r -> r.getSkill().getId().equals(skillId))
                    .filter(r -> r.getImprovement() != null && r.getImprovement() > 0)
                    .filter(r -> r.getAssessment().getDate() != null
                            && r.getAssessment().getDate().isAfter(enrollment.getCompletionDate()))
                    // Results arrive newest first, so the first match is the closest assessment
                    // after the course finished.
                    .findFirst()
                    .ifPresent(r -> improved.add(ImprovedAfterTraining.builder()
                            .employeeId(employeeId)
                            .employeeName(enrollment.getEmployee().getFullName())
                            .skillId(skillId)
                            .skillName(r.getSkill().getName())
                            .trainingId(enrollment.getCourse().getId())
                            .trainingTitle(enrollment.getCourse().getTitle())
                            .trainingCompletedAt(enrollment.getCompletionDate())
                            .previousProficiency(r.getPreviousProficiency())
                            .currentProficiency(r.getProficiency())
                            .improvement(r.getImprovement())
                            .assessedAt(r.getAssessment().getDate())
                            .build()));
        }

        improved.sort(Comparator.comparing(ImprovedAfterTraining::getImprovement).reversed()
                .thenComparing(ImprovedAfterTraining::getEmployeeName));
        return improved;
    }

    /** The courses this group has enrolled in most, with how many of them finished. */
    private List<TrainingProgramUptake> topTrainingPrograms(List<Long> employeeIds) {
        if (employeeIds.isEmpty()) {
            return List.of();
        }
        return uptakeFrom(enrollmentRepository.findByEmployeeIdIn(employeeIds)).stream()
                .limit(TOP_PROGRAM_LIMIT)
                .toList();
    }

    private List<TrainingProgramUptake> uptakeFrom(List<Enrollment> enrollments) {
        Map<Long, List<Enrollment>> byCourse = enrollments.stream()
                .collect(Collectors.groupingBy(e -> e.getCourse().getId()));

        return byCourse.values().stream()
                .map(courseEnrollments -> {
                    var course = courseEnrollments.get(0).getCourse();
                    long enrolled = courseEnrollments.size();
                    long finished = courseEnrollments.stream().filter(this::isFinished).count();
                    return TrainingProgramUptake.builder()
                            .trainingId(course.getId())
                            .trainingTitle(course.getTitle())
                            .provider(course.getProvider())
                            .skillName(course.getSkillCovered() == null
                                    ? null : course.getSkillCovered().getName())
                            .enrolledCount(enrolled)
                            .completedCount(finished)
                            .completionRatePercent(round((finished * 100.0) / enrolled))
                            .build();
                })
                .sorted(Comparator.comparing(TrainingProgramUptake::getEnrolledCount).reversed()
                        .thenComparing(TrainingProgramUptake::getTrainingTitle))
                .toList();
    }

    // ── Department dashboard ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public DepartmentAnalyticsResponse getDepartmentAnalytics(Long actorId, String department) {
        User actor = getUser(actorId);
        requireCanViewDepartment(actor, department);

        List<User> members = managerService.getDepartmentMembers(department);
        if (members.isEmpty()) {
            throw new ResourceNotFoundException("No employees found in department: " + department);
        }
        List<Long> memberIds = members.stream().map(User::getId).toList();

        List<Enrollment> enrollments = enrollmentRepository.findByEmployeeIdIn(memberIds);
        long completedEnrollments = enrollments.stream().filter(this::isFinished).count();
        double averageProgress = enrollments.stream()
                .mapToDouble(e -> e.getProgress() == null ? 0.0 : e.getProgress())
                .average()
                .orElse(0.0);

        List<GapAnalysis> gaps = gapAnalysisRepository.findByUserIdIn(memberIds);

        return DepartmentAnalyticsResponse.builder()
                .department(department)
                .totalEmployees(members.size())
                .employeesEnrolled(enrollments.stream().map(e -> e.getEmployee().getId()).distinct().count())
                .employeesCompleted(enrollments.stream()
                        .filter(this::isFinished)
                        .map(e -> e.getEmployee().getId())
                        .distinct()
                        .count())
                .totalEnrollments((long) enrollments.size())
                .completedEnrollments(completedEnrollments)
                .averageLearningProgressPercent(round(averageProgress))
                .criticalSkillGapCount(gaps.stream()
                        .filter(g -> g.getRiskSeverity() == RiskSeverity.CRITICAL)
                        .count())
                .topGapBySkill(topGapBySkill(gaps))
                .generatedAt(Instant.now())
                .build();
    }

    /** The skill recorded as a gap for the most people; null when nothing has been analysed. */
    private SkillGapFrequency topGapBySkill(List<GapAnalysis> gaps) {
        Map<Long, List<GapAnalysis>> bySkill = gaps.stream()
                .filter(g -> g.getGapScore() != null && g.getGapScore() > 0.0)
                .collect(Collectors.groupingBy(g -> g.getSkill().getId(), LinkedHashMap::new, Collectors.toList()));

        return bySkill.values().stream()
                .map(skillGaps -> {
                    var skill = skillGaps.get(0).getSkill();
                    return SkillGapFrequency.builder()
                            .skillId(skill.getId())
                            .skillName(skill.getName())
                            .category(skill.getCategory())
                            .affectedEmployees((long) skillGaps.size())
                            .criticalCount(skillGaps.stream()
                                    .filter(g -> g.getRiskSeverity() == RiskSeverity.CRITICAL)
                                    .count())
                            .averageGapScore(round(skillGaps.stream()
                                    .mapToDouble(GapAnalysis::getGapScore)
                                    .average()
                                    .orElse(0.0)))
                            .build();
                })
                .max(Comparator.comparing(SkillGapFrequency::getAffectedEmployees)
                        .thenComparing(SkillGapFrequency::getAverageGapScore))
                .orElse(null);
    }

    // ── Organization dashboard ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public OrganizationAnalyticsResponse getOrganizationAnalytics(Long actorId) {
        User actor = getUser(actorId);
        if (!ORG_WIDE_ROLES.contains(actor.getRole())) {
            throw new UnauthorizedException("Organization-wide analytics require an HR, L&D or admin role");
        }

        List<Enrollment> enrollments = enrollmentRepository.findAll();
        long completed = enrollments.stream().filter(this::isFinished).count();
        Double averageImprovement = assessmentResultRepository.findAverageImprovement();

        return OrganizationAnalyticsResponse.builder()
                .totalEmployees(userRepository.countByActiveTrue())
                .gapIntelligence(gapAnalysisService.getOrgGapMetrics())
                .workforceSkillInventory(hrIntelligenceService.getWorkforceSkillInventory())
                .totalEnrollments((long) enrollments.size())
                .completedEnrollments(completed)
                .trainingCompletionRatePercent(enrollments.isEmpty()
                        ? 0.0
                        : round((completed * 100.0) / enrollments.size()))
                .averageSkillImprovement(averageImprovement == null ? 0.0 : round(averageImprovement))
                .totalAssessmentResults(assessmentResultRepository.count())
                .activeMentorshipCount(mentorshipMatchRepository.countByStatus(MentorshipStatus.ACTIVE))
                .generatedAt(Instant.now())
                .build();
    }

    // ── Scoping ─────────────────────────────────────────────────────────────────

    /** Self, the employee's manager, their department head, or an HR / L&D / admin role. */
    private void requireCanViewEmployee(User actor, User employee) {
        if (actor.getId().equals(employee.getId()) || ORG_WIDE_ROLES.contains(actor.getRole())) {
            return;
        }
        if (actor.getRole() == Role.MANAGER && isManagerOf(actor, employee)) {
            return;
        }
        if (actor.getRole() == Role.DEPARTMENT_HEAD && sameDepartment(actor, employee)) {
            return;
        }
        throw new UnauthorizedException("Access denied. " + employee.getFullName() + " is not in your reporting line.");
    }

    /** A manager reads their own team; a department head reads managers inside their department. */
    private void requireCanViewTeam(User actor, User manager) {
        if (actor.getId().equals(manager.getId()) || ORG_WIDE_ROLES.contains(actor.getRole())) {
            return;
        }
        if (actor.getRole() == Role.DEPARTMENT_HEAD && sameDepartment(actor, manager)) {
            return;
        }
        throw new UnauthorizedException("Access denied. You may only view your own team.");
    }

    private void requireCanViewDepartment(User actor, String department) {
        if (ORG_WIDE_ROLES.contains(actor.getRole())) {
            return;
        }
        if (actor.getRole() == Role.DEPARTMENT_HEAD && department.equalsIgnoreCase(actor.getDepartment())) {
            return;
        }
        throw new UnauthorizedException("Access denied. You may only view your own department.");
    }

    /**
     * Direct report, or — matching how {@link ManagerService#getTeamMembers(Long)} resolves a team —
     * a department colleague when the manager has no direct reports recorded.
     */
    private boolean isManagerOf(User manager, User employee) {
        if (employee.getManager() != null) {
            return employee.getManager().getId().equals(manager.getId());
        }
        return sameDepartment(manager, employee);
    }

    private boolean sameDepartment(User actor, User other) {
        return actor.getDepartment() != null
                && actor.getDepartment().equalsIgnoreCase(other.getDepartment());
    }

    // ── Mapping and helpers ─────────────────────────────────────────────────────

    private boolean isFinished(Enrollment enrollment) {
        return enrollment.getStatus() == EnrollmentStatus.COMPLETED
                || enrollment.getStatus() == EnrollmentStatus.CERTIFIED;
    }

    private LearningPathSummary toLearningPathSummary(LearningPath path) {
        return LearningPathSummary.builder()
                .learningPathId(path.getId())
                .title(path.getTitle())
                .targetSkillId(path.getTargetSkill() == null ? null : path.getTargetSkill().getId())
                .targetSkillName(path.getTargetSkill() == null ? null : path.getTargetSkill().getName())
                .status(path.getStatus())
                .overallProgressPercent(path.getOverallProgressPercent())
                .totalEstimatedHours(path.getTotalEstimatedHours())
                .build();
    }

    private AchievementResponse toAchievementResponse(Achievement achievement) {
        return AchievementResponse.builder()
                .id(achievement.getId())
                .employeeId(achievement.getEmployee().getId())
                .type(achievement.getType())
                .title(achievement.getTitle())
                .description(achievement.getDescription())
                .earnedAt(achievement.getEarnedAt())
                .build();
    }

    private MentorshipResponse toMentorshipResponse(MentorshipMatch match) {
        return MentorshipResponse.builder()
                .mentorshipId(match.getId())
                .mentorId(match.getMentor().getId())
                .mentorName(match.getMentor().getFullName())
                .menteeId(match.getMentee().getId())
                .menteeName(match.getMentee().getFullName())
                .skillId(match.getTargetSkill().getId())
                .skillName(match.getTargetSkill().getName())
                .goal(match.getGoal())
                .startDate(match.getStartDate())
                .endDate(match.getEndDate())
                .status(match.getStatus())
                .createdAt(match.getCreatedAt())
                .build();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));
    }
}
