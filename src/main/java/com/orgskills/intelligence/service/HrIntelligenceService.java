package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.auth.UserProfileResponse;
import com.orgskills.intelligence.dto.hr.GapTrendPoint;
import com.orgskills.intelligence.dto.hr.SkillInventoryResponse;
import com.orgskills.intelligence.dto.hr.TrainingEffectivenessResponse;
import com.orgskills.intelligence.dto.manager.GapHeatmapResponse;
import com.orgskills.intelligence.entity.AssessmentResult;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.GapSnapshot;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.repository.AssessmentResultRepository;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.GapSnapshotRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HrIntelligenceService {

    /** Enrolment states in which the course has genuinely been finished. */
    private static final Set<EnrollmentStatus> FINISHED_STATUSES =
            EnumSet.of(EnrollmentStatus.COMPLETED, EnrollmentStatus.CERTIFIED);

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GapSnapshotRepository gapSnapshotRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final ManagerService managerService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public GapHeatmapResponse getOrgGapIntelligence(String department) {
        List<User> users;
        String scopeName;

        if (department != null && !department.isBlank()) {
            users = userRepository.findByDepartmentIgnoreCase(department.trim());
            scopeName = department.trim();
        } else {
            users = userRepository.findAll();
            scopeName = "ORGANIZATION_WIDE";
        }
        return managerService.getGapHeatmap(users, "ORGANIZATION", scopeName);
    }

    @Transactional(readOnly = true)
    public List<SkillInventoryResponse> getWorkforceSkillInventory() {
        List<Skill> allSkills = skillRepository.findAll();
        List<UserSkill> allUserSkills = userSkillRepository.findAll();

        Map<Long, List<UserSkill>> bySkillId = allUserSkills.stream()
                .collect(Collectors.groupingBy(us -> us.getSkill().getId()));

        return allSkills.stream().map(skill -> {
            List<UserSkill> list = bySkillId.getOrDefault(skill.getId(), List.of());
            double avgScore = list.stream().mapToDouble(this::getSkillScore).average().orElse(0.0);
            return SkillInventoryResponse.builder()
                    .skillId(skill.getId())
                    .skillName(skill.getName())
                    .category(skill.getCategory())
                    .headcount(list.size())
                    .averageProficiency(Math.round(avgScore * 100.0) / 100.0)
                    .averageProficiencyLabel(scoreToProficiencyLabel(avgScore))
                    .build();
        }).sorted(Comparator.comparing(SkillInventoryResponse::getSkillName)).toList();
    }

    /**
     * Per-course completion and the skill movement the course actually produced.
     *
     * <p>The before and after levels are measured rather than assumed. For each finished
     * enrolment the earliest assessment of the course's own skill submitted after the completion
     * date is found, and the level the learner held going into it — captured on the result row at
     * submission time, before it could be overwritten — is the "before". Averaging those pairs
     * across the course gives its real effect on the canonical 0-4 scale.
     *
     * <p>The earliest qualifying assessment is used rather than the most recent, so a course is
     * credited with the movement closest to it in time instead of with everything the learner has
     * picked up since.
     *
     * <p>A course nobody has both finished and been reassessed on reports null levels and a
     * measured count of zero. It reports no baseline: an unmeasured course and a course that
     * achieved nothing are different findings, and a placeholder would make them look the same.
     */
    @Transactional(readOnly = true)
    public List<TrainingEffectivenessResponse> getTrainingEffectiveness() {
        List<Course> courses = courseRepository.findAll();
        if (courses.isEmpty()) {
            return List.of();
        }

        Map<Long, List<Enrollment>> enrollmentsByCourse = new HashMap<>();
        Set<Long> finishedLearnerIds = new HashSet<>();
        for (Course course : courses) {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());
            enrollmentsByCourse.put(course.getId(), enrollments);
            enrollments.stream()
                    .filter(e -> FINISHED_STATUSES.contains(e.getStatus()))
                    .forEach(e -> finishedLearnerIds.add(e.getEmployee().getId()));
        }

        Map<Long, List<AssessmentResult>> resultsByLearner = resultsFor(finishedLearnerIds);

        return courses.stream()
                .map(course -> effectivenessOf(
                        course,
                        enrollmentsByCourse.getOrDefault(course.getId(), List.of()),
                        resultsByLearner))
                .sorted(Comparator.comparing(TrainingEffectivenessResponse::getCourseTitle))
                .toList();
    }

    /**
     * The same measurement for a single course, so the learning administrator's course page and
     * the workforce report cannot disagree about how well a course has worked.
     */
    @Transactional(readOnly = true)
    public TrainingEffectivenessResponse getCourseEffectiveness(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for id: " + courseId));

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        Set<Long> learnerIds = enrollments.stream()
                .filter(e -> FINISHED_STATUSES.contains(e.getStatus()))
                .map(e -> e.getEmployee().getId())
                .collect(Collectors.toSet());

        return effectivenessOf(course, enrollments, resultsFor(learnerIds));
    }

    /** Every submitted result for a set of learners, in one query rather than one per enrolment. */
    private Map<Long, List<AssessmentResult>> resultsFor(Set<Long> learnerIds) {
        if (learnerIds.isEmpty()) {
            return Map.of();
        }
        return assessmentResultRepository.findSubmittedResultsForEmployees(learnerIds).stream()
                .collect(Collectors.groupingBy(r -> r.getAssessment().getEmployee().getId()));
    }

    private TrainingEffectivenessResponse effectivenessOf(
            Course course, List<Enrollment> enrollments,
            Map<Long, List<AssessmentResult>> resultsByLearner) {

        int enrolled = enrollments.size();
        List<Enrollment> finished = enrollments.stream()
                .filter(e -> FINISHED_STATUSES.contains(e.getStatus()))
                .toList();
        double completionRate = enrolled == 0 ? 0.0 : (finished.size() * 100.0) / enrolled;

        Skill covered = course.getSkillCovered();
        List<int[]> measured = new ArrayList<>();
        if (covered != null) {
            for (Enrollment enrollment : finished) {
                movementAfter(enrollment, covered, resultsByLearner).ifPresent(measured::add);
            }
        }

        Double avgBefore = null;
        Double avgAfter = null;
        Double avgImprovement = null;
        if (!measured.isEmpty()) {
            avgBefore = round(measured.stream().mapToInt(pair -> pair[0]).average().orElseThrow());
            avgAfter = round(measured.stream().mapToInt(pair -> pair[1]).average().orElseThrow());
            avgImprovement = round(avgAfter - avgBefore);
        }

        return TrainingEffectivenessResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .provider(course.getProvider())
                .skillName(covered != null ? covered.getName() : null)
                .enrolledCount(enrolled)
                .completedCount(finished.size())
                .completionRatePercent(round(completionRate))
                .measuredCount(measured.size())
                .avgPreCourseSkillLevel(avgBefore)
                .avgPostCourseSkillLevel(avgAfter)
                .avgSkillImprovement(avgImprovement)
                .build();
    }

    /**
     * The before and after scores one finished enrolment produced, where they have been measured:
     * the earliest assessment of the course's skill submitted after the course was completed.
     */
    private Optional<int[]> movementAfter(Enrollment enrollment, Skill covered,
                                          Map<Long, List<AssessmentResult>> resultsByLearner) {
        if (enrollment.getCompletionDate() == null) {
            return Optional.empty();
        }
        return resultsByLearner.getOrDefault(enrollment.getEmployee().getId(), List.of()).stream()
                .filter(r -> r.getSkill().getId().equals(covered.getId()))
                .filter(r -> r.getProficiency() != null && r.getPreviousProficiency() != null)
                .filter(r -> r.getAssessment().getDate() != null
                        && r.getAssessment().getDate().isAfter(enrollment.getCompletionDate()))
                .min(Comparator.comparing(r -> r.getAssessment().getDate()))
                .map(r -> new int[] {
                        r.getPreviousProficiency().getScore(),
                        r.getProficiency().getScore()});
    }

    @Transactional(readOnly = true)
    public List<GapTrendPoint> getGapTrends(String department) {
        List<GapSnapshot> snapshots;
        if (department != null && !department.isBlank()) {
            snapshots = gapSnapshotRepository.findByDepartmentIgnoreCaseOrderBySnapshotDateAsc(department.trim());
        } else {
            snapshots = gapSnapshotRepository.findByOrderBySnapshotDateAsc();
        }

        return snapshots.stream().map(s -> GapTrendPoint.builder()
                .snapshotDate(s.getSnapshotDate())
                .department(s.getDepartment())
                .totalGaps(s.getTotalGaps())
                .criticalGapsCount(s.getCriticalGapsCount())
                .highGapsCount(s.getHighGapsCount())
                .mediumGapsCount(s.getMediumGapsCount())
                .lowGapsCount(s.getLowGapsCount())
                .avgGapScore(s.getAvgGapScore())
                .build()).toList();
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> searchEmployees(String query, String department, Role role) {
        List<User> users = userRepository.searchUsers(
                (query != null && !query.isBlank()) ? query.trim() : null,
                (department != null && !department.isBlank()) ? department.trim() : null,
                role
        );
        return users.stream().map(this::toUserProfile).toList();
    }

    @Transactional
    public UserProfileResponse updateEmployeeDepartment(Long actorUserId, Long employeeId, String department, String jobTitle) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + employeeId));

        if (department != null && !department.isBlank()) {
            employee.setDepartment(department.trim());
        }
        if (jobTitle != null && !jobTitle.isBlank()) {
            employee.setJobTitle(jobTitle.trim());
        }

        User saved = userRepository.save(employee);
        User actor = userRepository.findById(actorUserId).orElse(null);
        auditLogService.logEvent(actorUserId, actor != null ? actor.getEmail() : "HR", "UPDATE_EMPLOYEE_DEPARTMENT", "User", saved.getId().toString(), "Updated department to " + saved.getDepartment() + " and title to " + saved.getJobTitle());
        return toUserProfile(saved);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private double getSkillScore(UserSkill us) {
        return us.getProficiencyLevel().getScore();
    }

    private String scoreToProficiencyLabel(double score) {
        return ProficiencyLevel.fromScore(score).name();
    }

    private UserProfileResponse toUserProfile(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .department(user.getDepartment())
                .jobTitle(user.getJobTitle())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
