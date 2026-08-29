package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.manager.GapHeatmapCell;
import com.orgskills.intelligence.dto.manager.GapHeatmapResponse;
import com.orgskills.intelligence.dto.manager.SkillCoverageResponse;
import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.manager.TeamMemberSummary;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.dto.manager.TrainingAdoptionResponse;
import com.orgskills.intelligence.entity.Assessment;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.MentorshipMatch;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.AssessmentRepository;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManagerService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final GapAnalysisRepository gapAnalysisRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentRepository assessmentRepository;
    private final CourseRepository courseRepository;
    private final MentorshipMatchRepository mentorshipMatchRepository;
    private final SkillRepository skillRepository;
    private final GapAnalysisService gapAnalysisService;
    private final TrainingProgressService trainingProgressService;
    private final MentorshipService mentorshipService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    // ── Member Scoping ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<User> getTeamMembers(Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found for id: " + managerId));

        List<User> directReports = userRepository.findByManagerId(managerId);
        if (directReports.isEmpty()) {
            // Fallback: employees in manager's department
            return userRepository.findByDepartmentIgnoreCase(manager.getDepartment()).stream()
                    .filter(u -> !u.getId().equals(managerId))
                    .toList();
        }
        return directReports;
    }

    @Transactional(readOnly = true)
    public List<User> getDepartmentMembers(String department) {
        return userRepository.findByDepartmentIgnoreCase(department);
    }

    // ── Team / Department Summaries ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TeamMemberSummary> getMemberSummaries(List<User> users) {
        return users.stream().map(this::buildMemberSummary).toList();
    }

    @Transactional(readOnly = true)
    public TeamMemberSummary getEmployeeProgressSnapshot(Long employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for id: " + employeeId));
        return buildMemberSummary(employee);
    }

    // ── Skill Coverage & Gap Heatmap Aggregation ─────────────────────────────────

    @Transactional(readOnly = true)
    public List<SkillCoverageResponse> getSkillCoverage(List<User> users) {
        if (users.isEmpty()) return List.of();
        List<Long> userIds = users.stream().map(User::getId).toList();

        List<UserSkill> skills = userSkillRepository.findByUserIdIn(userIds);

        Map<Long, List<UserSkill>> bySkill = skills.stream()
                .collect(Collectors.groupingBy(us -> us.getSkill().getId()));

        return bySkill.entrySet().stream().map(entry -> {
            List<UserSkill> list = entry.getValue();
            var first = list.get(0);
            double avgScore = list.stream().mapToDouble(this::getSkillScore).average().orElse(0.0);
            return SkillCoverageResponse.builder()
                    .skillId(first.getSkill().getId())
                    .skillName(first.getSkill().getName())
                    .category(first.getSkill().getCategory())
                    .employeeCount(list.size())
                    .averageProficiency(Math.round(avgScore * 100.0) / 100.0)
                    .proficiencyLabel(scoreToProficiencyLabel(avgScore))
                    .build();
        }).sorted(Comparator.comparing(SkillCoverageResponse::getSkillName)).toList();
    }

    @Transactional(readOnly = true)
    public GapHeatmapResponse getGapHeatmap(List<User> users, String scope, String scopeName) {
        if (users.isEmpty()) {
            return GapHeatmapResponse.builder()
                    .scope(scope)
                    .scopeName(scopeName)
                    .totalEmployees(0)
                    .cells(List.of())
                    .generatedAt(Instant.now())
                    .build();
        }

        List<Long> userIds = users.stream().map(User::getId).toList();
        List<GapAnalysis> gaps = gapAnalysisRepository.findByUserIdIn(userIds);

        Map<Long, List<GapAnalysis>> gapsBySkill = gaps.stream()
                .collect(Collectors.groupingBy(g -> g.getSkill().getId()));

        List<GapHeatmapCell> cells = gapsBySkill.entrySet().stream().map(entry -> {
            List<GapAnalysis> skillGaps = entry.getValue();
            var first = skillGaps.get(0);

            long low = skillGaps.stream().filter(g -> g.getRiskSeverity() == RiskSeverity.LOW).count();
            long med = skillGaps.stream().filter(g -> g.getRiskSeverity() == RiskSeverity.MEDIUM).count();
            long high = skillGaps.stream().filter(g -> g.getRiskSeverity() == RiskSeverity.HIGH).count();
            long crit = skillGaps.stream().filter(g -> g.getRiskSeverity() == RiskSeverity.CRITICAL).count();
            double avgGap = skillGaps.stream().mapToDouble(GapAnalysis::getGapScore).average().orElse(0.0);

            return GapHeatmapCell.builder()
                    .skillId(first.getSkill().getId())
                    .skillName(first.getSkill().getName())
                    .category(first.getSkill().getCategory())
                    .lowCount(low)
                    .mediumCount(med)
                    .highCount(high)
                    .criticalCount(crit)
                    .totalGaps((long) skillGaps.size())
                    .avgGapScore(Math.round(avgGap * 100.0) / 100.0)
                    .build();
        }).sorted(Comparator.comparing(GapHeatmapCell::getTotalGaps).reversed()).toList();

        return GapHeatmapResponse.builder()
                .scope(scope)
                .scopeName(scopeName)
                .totalEmployees(users.size())
                .cells(cells)
                .generatedAt(Instant.now())
                .build();
    }

    @Transactional(readOnly = true)
    public List<GapAnalysisResponse> getHighRiskGaps(List<User> users) {
        if (users.isEmpty()) return List.of();
        List<Long> userIds = users.stream().map(User::getId).toList();
        List<GapAnalysis> gaps = gapAnalysisRepository.findByUserIdIn(userIds);

        return gaps.stream()
                .filter(g -> g.getRiskSeverity() == RiskSeverity.HIGH || g.getRiskSeverity() == RiskSeverity.CRITICAL)
                .sorted(Comparator.comparing(GapAnalysis::getGapScore).reversed())
                .map(gapAnalysisService::toResponse)
                .toList();
    }

    // ── Training Adoption & Learning Progress ────────────────────────────────────

    @Transactional(readOnly = true)
    public TrainingAdoptionResponse getTrainingAdoption(List<User> users) {
        if (users.isEmpty()) {
            return TrainingAdoptionResponse.builder()
                    .totalMembers(0)
                    .activeEnrolledMembers(0)
                    .completedMembers(0)
                    .adoptionRatePercent(0.0)
                    .completionRatePercent(0.0)
                    .avgProgressPercent(0.0)
                    .build();
        }

        List<Long> userIds = users.stream().map(User::getId).toList();
        List<Enrollment> enrollments = enrollmentRepository.findByEmployeeIdIn(userIds);

        long activeMembersCount = enrollments.stream()
                .map(e -> e.getEmployee().getId())
                .distinct()
                .count();

        long completedMembersCount = enrollments.stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED)
                .map(e -> e.getEmployee().getId())
                .distinct()
                .count();

        double avgProgress = enrollments.stream()
                .mapToDouble(Enrollment::getProgress)
                .average()
                .orElse(0.0);

        double adoptionRate = (activeMembersCount * 100.0) / users.size();
        double completionRate = enrollments.isEmpty() ? 0.0 : (enrollments.stream().filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED).count() * 100.0) / enrollments.size();

        return TrainingAdoptionResponse.builder()
                .totalMembers(users.size())
                .activeEnrolledMembers((int) activeMembersCount)
                .completedMembers((int) completedMembersCount)
                .adoptionRatePercent(Math.round(adoptionRate * 100.0) / 100.0)
                .completionRatePercent(Math.round(completionRate * 100.0) / 100.0)
                .avgProgressPercent(Math.round(avgProgress * 100.0) / 100.0)
                .build();
    }

    // ── Direct Training / Mentorship Assignments ─────────────────────────────────

    /**
     * Assigning training is the same act as an employee enrolling themselves, so it goes through
     * the same service: the duplicate-enrolment check applies, the course milestone template is
     * copied, and a completed attempt is left alone rather than reopened.
     */
    @Transactional
    public EnrollmentResponse assignTraining(Long assignedByUserId, Long employeeId, Long courseId) {
        User assigner = userRepository.findById(assignedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Assigner user not found for id: " + assignedByUserId));

        EnrollmentRequest request = new EnrollmentRequest(courseId);
        request.setEmployeeId(employeeId);
        EnrollmentResponse enrollment = trainingProgressService.enroll(assignedByUserId, request);

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for id: " + employeeId));
        notificationService.createNotification(
                employee,
                "Training Course Assigned",
                assigner.getFullName() + " has assigned you the course: " + enrollment.getTrainingTitle(),
                NotificationType.TRAINING_RECOMMENDATION
        );

        auditLogService.logEvent(assignedByUserId, assigner.getEmail(), "ASSIGN_TRAINING", "Enrollment",
                String.valueOf(enrollment.getEnrollmentId()),
                "Assigned course " + enrollment.getTrainingTitle() + " to " + employee.getEmail());
        return enrollment;
    }

    /** Pairing an employee with a mentor runs the mentorship module's pairing rules. */
    @Transactional
    public MentorshipResponse assignMentorship(Long assignedByUserId, Long employeeId, Long mentorId,
                                               Long targetSkillId) {
        User assigner = userRepository.findById(assignedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Assigner user not found for id: " + assignedByUserId));

        MentorshipResponse assigned =
                mentorshipService.assignMentorship(assigner, employeeId, mentorId, targetSkillId);

        auditLogService.logEvent(assignedByUserId, assigner.getEmail(), "ASSIGN_MENTORSHIP", "MentorshipMatch",
                String.valueOf(assigned.getMentorshipId()),
                "Assigned mentor " + assigned.getMentorName() + " to " + assigned.getMenteeName());
        return assigned;
    }

    private TeamMemberSummary buildMemberSummary(User employee) {
        List<UserSkill> userSkills = userSkillRepository.findByUserId(employee.getId());
        double avgSkill = userSkills.stream().mapToDouble(this::getSkillScore).average().orElse(0.0);

        List<GapAnalysis> gaps = gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(employee.getId());

        List<Enrollment> enrollments = enrollmentRepository.findByEmployeeId(employee.getId());
        double avgProgress = enrollments.stream().mapToDouble(Enrollment::getProgress).average().orElse(0.0);

        List<Assessment> assessments = assessmentRepository.findByEmployeeIdOrderByDateDesc(employee.getId());
        Instant lastAssessment = assessments.isEmpty() ? null : assessments.get(0).getDate();

        return TeamMemberSummary.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .jobTitle(employee.getJobTitle())
                .department(employee.getDepartment())
                .avgSkillScore(Math.round(avgSkill * 100.0) / 100.0)
                .gapCount(gaps.size())
                .trainingProgressPercent(Math.round(avgProgress * 100.0) / 100.0)
                .lastAssessmentDate(lastAssessment)
                .build();
    }

    private double getSkillScore(UserSkill us) {
        return us.getProficiencyLevel().getScore();
    }

    private String scoreToProficiencyLabel(double score) {
        return ProficiencyLevel.fromScore(score).name();
    }
}
