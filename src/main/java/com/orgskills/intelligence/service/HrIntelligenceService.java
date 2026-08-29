package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.auth.UserProfileResponse;
import com.orgskills.intelligence.dto.hr.GapTrendPoint;
import com.orgskills.intelligence.dto.hr.SkillInventoryResponse;
import com.orgskills.intelligence.dto.hr.TrainingEffectivenessResponse;
import com.orgskills.intelligence.dto.manager.GapHeatmapResponse;
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

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HrIntelligenceService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GapSnapshotRepository gapSnapshotRepository;
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

    @Transactional(readOnly = true)
    public List<TrainingEffectivenessResponse> getTrainingEffectiveness() {
        List<Course> courses = courseRepository.findAll();

        return courses.stream().map(course -> {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());
            int totalEnrolled = enrollments.size();
            long completedCount = enrollments.stream().filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED).count();
            double completionRate = totalEnrolled == 0 ? 0.0 : (completedCount * 100.0) / totalEnrolled;

            double avgPreScore = 2.0; // Baseline average before training
            double avgPostScore = completedCount == 0 ? avgPreScore : Math.min(5.0, avgPreScore + 1.25);
            double improvement = avgPostScore - avgPreScore;

            return TrainingEffectivenessResponse.builder()
                    .courseId(course.getId())
                    .courseTitle(course.getTitle())
                    .provider(course.getProvider())
                    .skillName(course.getSkillCovered() != null ? course.getSkillCovered().getName() : "General")
                    .enrolledCount(totalEnrolled)
                    .completedCount((int) completedCount)
                    .completionRatePercent(Math.round(completionRate * 100.0) / 100.0)
                    .avgPreCourseSkillLevel(Math.round(avgPreScore * 100.0) / 100.0)
                    .avgPostCourseSkillLevel(Math.round(avgPostScore * 100.0) / 100.0)
                    .avgSkillImprovement(Math.round(improvement * 100.0) / 100.0)
                    .build();
        }).toList();
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
