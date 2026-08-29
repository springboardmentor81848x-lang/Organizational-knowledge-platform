package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.analytics.DepartmentAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.TeamAnalyticsResponse;
import com.orgskills.intelligence.entity.Assessment;
import com.orgskills.intelligence.entity.AssessmentResult;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.repository.AchievementRepository;
import com.orgskills.intelligence.repository.AssessmentResultRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.LearningPathRepository;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
import com.orgskills.intelligence.repository.SessionRegistrationRepository;
import com.orgskills.intelligence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private GapAnalysisRepository gapAnalysisRepository;

    @Mock
    private LearningPathRepository learningPathRepository;

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private AssessmentResultRepository assessmentResultRepository;

    @Mock
    private MentorshipMatchRepository mentorshipMatchRepository;

    @Mock
    private SessionRegistrationRepository sessionRegistrationRepository;

    @Mock
    private UserSkillService userSkillService;

    @Mock
    private GapAnalysisService gapAnalysisService;

    @Mock
    private ManagerService managerService;

    @Mock
    private HrIntelligenceService hrIntelligenceService;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User employee;
    private User manager;
    private User otherManager;
    private User departmentHead;
    private User hrAdmin;
    private Skill terraform;
    private Course terraformCourse;

    @BeforeEach
    void setUp() {
        manager = user(2L, "Bob Smith", Role.MANAGER, "Engineering", null);
        employee = user(1L, "Alice Johnson", Role.EMPLOYEE, "Engineering", manager);
        otherManager = user(3L, "Dana Patel", Role.MANAGER, "Marketing", null);
        departmentHead = user(4L, "Eve Turner", Role.DEPARTMENT_HEAD, "Engineering", null);
        hrAdmin = user(5L, "Frank Lee", Role.HR_ADMIN, "People Operations", null);

        terraform = new Skill();
        terraform.setId(10L);
        terraform.setName("Terraform");
        terraform.setCategory("Platform");

        terraformCourse = new Course();
        terraformCourse.setId(20L);
        terraformCourse.setTitle("Terraform Fundamentals");
        terraformCourse.setProvider("Internal Academy");
        terraformCourse.setSkillCovered(terraform);
    }

    // ── Scoping ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("A manager may read a direct report but not somebody else's report")
    void employeeAnalyticsScopedToReportingLine() {
        User outsider = user(9L, "Grace Kim", Role.EMPLOYEE, "Marketing", otherManager);
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(userRepository.findById(9L)).thenReturn(Optional.of(outsider));

        assertThatThrownBy(() -> analyticsService.getEmployeeAnalytics(2L, 9L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("not in your reporting line");
    }

    @Test
    @DisplayName("An employee cannot read a colleague's dashboard")
    void employeeAnalyticsRefusesPeer() {
        User colleague = user(6L, "Hugo Bright", Role.EMPLOYEE, "Engineering", manager);
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(userRepository.findById(6L)).thenReturn(Optional.of(colleague));

        assertThatThrownBy(() -> analyticsService.getEmployeeAnalytics(1L, 6L))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("A manager cannot read another manager's team")
    void teamAnalyticsScopedToOwnTeam() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(otherManager));
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));

        assertThatThrownBy(() -> analyticsService.getTeamAnalytics(3L, 2L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("your own team");
    }

    @Test
    @DisplayName("A department head may read a team inside their own department")
    void teamAnalyticsAllowsDepartmentHead() {
        when(userRepository.findById(4L)).thenReturn(Optional.of(departmentHead));
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(managerService.getTeamMembers(2L)).thenReturn(List.of(employee));
        when(gapAnalysisRepository.findByUserIdIn(List.of(1L))).thenReturn(List.of());
        when(enrollmentRepository.findByEmployeeIdInAndStatus(anyCollection(), eq(EnrollmentStatus.COMPLETED)))
                .thenReturn(List.of());
        when(enrollmentRepository.findByEmployeeIdIn(List.of(1L))).thenReturn(List.of());

        TeamAnalyticsResponse response = analyticsService.getTeamAnalytics(4L, 2L);

        assertThat(response.getManagerId()).isEqualTo(2L);
        assertThat(response.getTeamSize()).isEqualTo(1);
    }

    @Test
    @DisplayName("A department head cannot read another department")
    void departmentAnalyticsScopedToOwnDepartment() {
        when(userRepository.findById(4L)).thenReturn(Optional.of(departmentHead));

        assertThatThrownBy(() -> analyticsService.getDepartmentAnalytics(4L, "Marketing"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("your own department");
    }

    @Test
    @DisplayName("Organization analytics are refused to anyone without an org-wide role")
    void organizationAnalyticsRequiresOrgWideRole() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));

        assertThatThrownBy(() -> analyticsService.getOrganizationAnalytics(2L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("HR, L&D or admin role");
    }

    // ── Derived figures ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("Only gaps at severity HIGH become team alerts")
    void teamAlertsCoverHighSeverityOnly() {
        stubTeamOf(employee);
        when(gapAnalysisRepository.findByUserIdIn(List.of(1L))).thenReturn(List.of(
                gap(terraform, 2.0, RiskSeverity.HIGH),
                gap(terraform, 3.0, RiskSeverity.CRITICAL),
                gap(terraform, 1.0, RiskSeverity.MEDIUM)));
        when(gapAnalysisService.toResponse(any(GapAnalysis.class)))
                .thenReturn(com.orgskills.intelligence.dto.gap.GapAnalysisResponse.builder()
                        .skillId(10L).skillName("Terraform").gapScore(2.0)
                        .riskSeverity(RiskSeverity.HIGH).build());

        assertThat(analyticsService.getTeamAnalytics(2L, 2L).getHighRiskGapAlerts()).hasSize(1);
    }

    @Test
    @DisplayName("An improvement assessed before the course finished is not credited to the training")
    void improvementBeforeTrainingIsNotCredited() {
        Instant courseFinished = Instant.parse("2026-03-01T00:00:00Z");
        stubTeamOf(employee);
        when(gapAnalysisRepository.findByUserIdIn(List.of(1L))).thenReturn(List.of());
        when(enrollmentRepository.findByEmployeeIdInAndStatus(anyCollection(), eq(EnrollmentStatus.COMPLETED)))
                .thenReturn(List.of(completedEnrollment(courseFinished)));
        when(assessmentResultRepository.findSubmittedResultsForEmployees(anyList()))
                .thenReturn(List.of(assessedAt("2026-02-01T00:00:00Z", 2)));

        assertThat(analyticsService.getTeamAnalytics(2L, 2L).getImprovedAfterTraining()).isEmpty();
    }

    @Test
    @DisplayName("An improvement assessed after the course finished is credited to the training")
    void improvementAfterTrainingIsCredited() {
        Instant courseFinished = Instant.parse("2026-03-01T00:00:00Z");
        stubTeamOf(employee);
        when(gapAnalysisRepository.findByUserIdIn(List.of(1L))).thenReturn(List.of());
        when(enrollmentRepository.findByEmployeeIdInAndStatus(anyCollection(), eq(EnrollmentStatus.COMPLETED)))
                .thenReturn(List.of(completedEnrollment(courseFinished)));
        when(assessmentResultRepository.findSubmittedResultsForEmployees(anyList()))
                .thenReturn(List.of(assessedAt("2026-04-01T00:00:00Z", 2)));

        assertThat(analyticsService.getTeamAnalytics(2L, 2L).getImprovedAfterTraining())
                .singleElement()
                .satisfies(i -> {
                    assertThat(i.getEmployeeId()).isEqualTo(1L);
                    assertThat(i.getSkillName()).isEqualTo("Terraform");
                    assertThat(i.getTrainingTitle()).isEqualTo("Terraform Fundamentals");
                    assertThat(i.getImprovement()).isEqualTo(2);
                });
    }

    @Test
    @DisplayName("Training programs are ranked by how many people enrolled")
    void topProgramsRankedByEnrolment() {
        Course other = new Course();
        other.setId(21L);
        other.setTitle("Advanced Terraform");
        other.setProvider("Coursera");

        stubTeamOf(employee);
        when(gapAnalysisRepository.findByUserIdIn(List.of(1L))).thenReturn(List.of());
        when(enrollmentRepository.findByEmployeeIdInAndStatus(anyCollection(), eq(EnrollmentStatus.COMPLETED)))
                .thenReturn(List.of());
        when(enrollmentRepository.findByEmployeeIdIn(List.of(1L))).thenReturn(List.of(
                enrollment(terraformCourse, EnrollmentStatus.COMPLETED),
                enrollment(terraformCourse, EnrollmentStatus.IN_PROGRESS),
                enrollment(other, EnrollmentStatus.IN_PROGRESS)));

        assertThat(analyticsService.getTeamAnalytics(2L, 2L).getTopTrainingPrograms())
                .extracting("trainingTitle")
                .containsExactly("Terraform Fundamentals", "Advanced Terraform");
    }

    @Test
    @DisplayName("The department's top gap is the skill that affects the most people")
    void departmentTopGapIsTheMostWidelyFelt() {
        Skill kubernetes = new Skill();
        kubernetes.setId(11L);
        kubernetes.setName("Kubernetes");

        User colleague = user(6L, "Hugo Bright", Role.EMPLOYEE, "Engineering", manager);
        when(userRepository.findById(5L)).thenReturn(Optional.of(hrAdmin));
        when(managerService.getDepartmentMembers("Engineering")).thenReturn(List.of(employee, colleague));
        when(enrollmentRepository.findByEmployeeIdIn(List.of(1L, 6L))).thenReturn(List.of(
                enrollment(terraformCourse, EnrollmentStatus.COMPLETED)));
        when(gapAnalysisRepository.findByUserIdIn(List.of(1L, 6L))).thenReturn(List.of(
                gap(terraform, 1.0, RiskSeverity.MEDIUM),
                gap(kubernetes, 3.0, RiskSeverity.CRITICAL),
                gap(kubernetes, 2.0, RiskSeverity.HIGH)));

        DepartmentAnalyticsResponse response = analyticsService.getDepartmentAnalytics(5L, "Engineering");

        assertThat(response.getTotalEmployees()).isEqualTo(2);
        assertThat(response.getCriticalSkillGapCount()).isEqualTo(1);
        assertThat(response.getTopGapBySkill().getSkillName()).isEqualTo("Kubernetes");
        assertThat(response.getTopGapBySkill().getAffectedEmployees()).isEqualTo(2);
        assertThat(response.getTopGapBySkill().getAverageGapScore()).isEqualTo(2.5);
    }

    @Test
    @DisplayName("A CERTIFIED enrolment counts as finished training")
    void certifiedEnrolmentsCountAsCompleted() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(hrAdmin));
        when(managerService.getDepartmentMembers("Engineering")).thenReturn(List.of(employee));
        when(gapAnalysisRepository.findByUserIdIn(List.of(1L))).thenReturn(List.of());
        when(enrollmentRepository.findByEmployeeIdIn(List.of(1L))).thenReturn(List.of(
                enrollment(terraformCourse, EnrollmentStatus.CERTIFIED),
                enrollment(terraformCourse, EnrollmentStatus.IN_PROGRESS)));

        DepartmentAnalyticsResponse response = analyticsService.getDepartmentAnalytics(5L, "Engineering");

        assertThat(response.getTotalEnrollments()).isEqualTo(2);
        assertThat(response.getCompletedEnrollments()).isEqualTo(1);
        assertThat(response.getEmployeesCompleted()).isEqualTo(1);
    }

    // ── Fixtures ────────────────────────────────────────────────────────────────

    private void stubTeamOf(User member) {
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(managerService.getTeamMembers(2L)).thenReturn(List.of(member));
    }

    private GapAnalysis gap(Skill skill, double gapScore, RiskSeverity severity) {
        GapAnalysis gap = new GapAnalysis();
        gap.setUser(employee);
        gap.setSkill(skill);
        gap.setTargetScore(4.0);
        gap.setCurrentScore(4.0 - gapScore);
        gap.setGapScore(gapScore);
        gap.setRiskSeverity(severity);
        gap.setMissingSkill(false);
        return gap;
    }

    private Enrollment enrollment(Course course, EnrollmentStatus status) {
        Enrollment enrollment = new Enrollment();
        enrollment.setEmployee(employee);
        enrollment.setCourse(course);
        enrollment.setStatus(status);
        enrollment.setProgress(status == EnrollmentStatus.IN_PROGRESS ? 50.0 : 100.0);
        return enrollment;
    }

    private Enrollment completedEnrollment(Instant completedAt) {
        Enrollment enrollment = enrollment(terraformCourse, EnrollmentStatus.COMPLETED);
        enrollment.setCompletionDate(completedAt);
        return enrollment;
    }

    private AssessmentResult assessedAt(String date, int improvement) {
        Assessment assessment = new Assessment();
        assessment.setId(30L);
        assessment.setEmployee(employee);
        assessment.setAssessor(manager);
        assessment.setAssessmentType(AssessmentType.MANAGER);
        assessment.setStatus(AssessmentStatus.COMPLETED);
        assessment.setDate(Instant.parse(date));

        AssessmentResult result = new AssessmentResult();
        result.setResultId(40L);
        result.setAssessment(assessment);
        result.setSkill(terraform);
        result.setPreviousProficiency(ProficiencyLevel.BEGINNER);
        result.setProficiency(ProficiencyLevel.ADVANCED);
        result.setImprovement(improvement);
        return result;
    }

    private User user(Long id, String name, Role role, String department, User reportsTo) {
        User user = new User();
        user.setId(id);
        user.setFullName(name);
        user.setEmail(name.toLowerCase().replace(' ', '.') + "@orgskills.com");
        user.setRole(role);
        user.setDepartment(department);
        user.setJobTitle("Engineer");
        user.setManager(reportsTo);
        return user;
    }
}
