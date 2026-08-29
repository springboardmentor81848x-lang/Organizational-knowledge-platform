package com.orgskills.intelligence.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.analytics.DepartmentAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.EmployeeAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.OrganizationAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.TeamAnalyticsResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultRequest;
import com.orgskills.intelligence.dto.assessment.CreateAssessmentRequest;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.employee.UpdateProgressRequest;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.AssessmentService;
import com.orgskills.intelligence.service.GapAnalysisService;
import com.orgskills.intelligence.service.TrainingProgressService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The acceptance criterion for the analytics dashboards: changing an assessment result or an
 * enrolment's progress and re-calling the endpoint must reflect the change immediately, in the
 * same running server. Each assertion re-reads over HTTP rather than reusing an earlier response,
 * so a cached or precomputed figure would fail here.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
class AnalyticsLiveDataIntegrationTest {

    private static final String DEPARTMENT = "Analytics Test Department";
    private static final String JOB_TITLE = "Analytics Test Engineer";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private TrainingProgressService trainingProgressService;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private RoleCompetencyRepository roleCompetencyRepository;

    @Autowired
    private CourseRepository courseRepository;

    private User employee;
    private User manager;
    private User hrAdmin;
    private Skill terraform;
    private Course terraformCourse;

    @BeforeEach
    void setUp() {
        terraform = skillRepository.save(skill("Terraform (analytics test)", "Platform"));

        manager = userRepository.save(user("analytics.manager@orgskills.com", "Analytics Manager", Role.MANAGER, null));
        employee = userRepository.save(
                user("analytics.employee@orgskills.com", "Analytics Employee", Role.EMPLOYEE, manager));
        // HR sits outside the department under test, so department headcount stays the team itself.
        User hr = baseUser("analytics.hr@orgskills.com", "Analytics HR", Role.HR_ADMIN);
        hr.setDepartment("People Operations");
        hr.setJobTitle("HR Administrator");
        hrAdmin = userRepository.save(hr);

        RoleCompetency competency = new RoleCompetency();
        competency.setJobTitle(JOB_TITLE);
        competency.setDepartment(DEPARTMENT);
        competency.setSkill(terraform);
        competency.setRequiredProficiencyLevel(ProficiencyLevel.EXPERT);
        roleCompetencyRepository.save(competency);

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(employee);
        userSkill.setSkill(terraform);
        userSkill.setProficiencyLevel(ProficiencyLevel.BEGINNER);
        userSkill.setRatingScore((double) ProficiencyLevel.BEGINNER.getScore());
        userSkillRepository.save(userSkill);

        Course course = new Course();
        course.setTitle("Terraform Fundamentals (analytics test)");
        course.setProvider("Internal Academy");
        course.setSkillCovered(terraform);
        course.setDifficulty("INTERMEDIATE");
        course.setDurationHours(8.0);
        course.setIsInternal(true);
        terraformCourse = courseRepository.save(course);
    }

    @Test
    @DisplayName("Employee analytics reflect an enrolment progress change on the very next call")
    void employeeAnalyticsFollowEnrollmentProgress() throws Exception {
        EmployeeAnalyticsResponse before = employeeAnalytics();
        assertThat(before.getLearningProgressPercent()).isZero();
        assertThat(before.getActiveEnrollments()).isZero();

        EnrollmentResponse enrollment = trainingProgressService.enroll(
                employee.getId(), new EnrollmentRequest(terraformCourse.getId()));

        EmployeeAnalyticsResponse afterEnrolling = employeeAnalytics();
        assertThat(afterEnrolling.getActiveEnrollments()).isEqualTo(1);
        assertThat(afterEnrolling.getLearningProgressPercent()).isZero();

        trainingProgressService.updateProgress(
                employee.getId(), enrollment.getEnrollmentId(), new UpdateProgressRequest(60.0));

        EmployeeAnalyticsResponse afterProgress = employeeAnalytics();
        assertThat(afterProgress.getLearningProgressPercent()).isEqualTo(60.0);
        assertThat(afterProgress.getActiveEnrollments()).isEqualTo(1);
        assertThat(afterProgress.getCompletedEnrollments()).isZero();

        trainingProgressService.complete(employee.getId(), enrollment.getEnrollmentId());

        EmployeeAnalyticsResponse afterCompletion = employeeAnalytics();
        assertThat(afterCompletion.getLearningProgressPercent()).isEqualTo(100.0);
        assertThat(afterCompletion.getActiveEnrollments()).isZero();
        assertThat(afterCompletion.getCompletedEnrollments()).isEqualTo(1);
        // Completing a course awards an achievement, which the same dashboard call picks up.
        assertThat(afterCompletion.getAchievements()).isNotEmpty();
    }

    @Test
    @DisplayName("Employee analytics reflect a new assessment result and the gap it closes")
    void employeeAnalyticsFollowAssessmentResults() throws Exception {
        EmployeeAnalyticsResponse before = employeeAnalytics();
        assertThat(before.getRecentAssessmentResults()).isEmpty();
        double readinessBefore = before.getGapSummary().getOverallReadinessPercentage();
        assertThat(before.getSkillProfile()).singleElement()
                .satisfies(s -> assertThat(s.getProficiencyLevel()).isEqualTo(ProficiencyLevel.BEGINNER));

        submitManagerAssessment(ProficiencyLevel.EXPERT);

        EmployeeAnalyticsResponse after = employeeAnalytics();
        assertThat(after.getRecentAssessmentResults()).singleElement().satisfies(r -> {
            assertThat(r.getSkillName()).isEqualTo(terraform.getName());
            assertThat(r.getPreviousProficiency()).isEqualTo(ProficiencyLevel.BEGINNER);
            assertThat(r.getProficiency()).isEqualTo(ProficiencyLevel.EXPERT);
            assertThat(r.getImprovement()).isEqualTo(3);
        });
        assertThat(after.getSkillProfile()).singleElement()
                .satisfies(s -> assertThat(s.getProficiencyLevel()).isEqualTo(ProficiencyLevel.EXPERT));
        // The gap closed, so readiness on the same dashboard rose without any recalculation call.
        assertThat(after.getGapSummary().getOverallReadinessPercentage()).isGreaterThan(readinessBefore);
        assertThat(after.getGapSummary().getMissingSkillsCount()).isZero();
    }

    @Test
    @DisplayName("Team analytics credit an improvement recorded after the training was completed")
    void teamAnalyticsShowImprovementAfterTraining() throws Exception {
        assertThat(teamAnalytics().getImprovedAfterTraining()).isEmpty();

        EnrollmentResponse enrollment = trainingProgressService.enroll(
                employee.getId(), new EnrollmentRequest(terraformCourse.getId()));
        trainingProgressService.complete(employee.getId(), enrollment.getEnrollmentId());

        // Completed training alone is not evidence of improvement.
        assertThat(teamAnalytics().getImprovedAfterTraining()).isEmpty();

        submitManagerAssessment(ProficiencyLevel.ADVANCED);

        TeamAnalyticsResponse after = teamAnalytics();
        assertThat(after.getTeamSize()).isEqualTo(1);
        assertThat(after.getImprovedAfterTraining()).singleElement().satisfies(i -> {
            assertThat(i.getEmployeeId()).isEqualTo(employee.getId());
            assertThat(i.getSkillName()).isEqualTo(terraform.getName());
            assertThat(i.getTrainingTitle()).isEqualTo(terraformCourse.getTitle());
            assertThat(i.getPreviousProficiency()).isEqualTo(ProficiencyLevel.BEGINNER);
            assertThat(i.getCurrentProficiency()).isEqualTo(ProficiencyLevel.ADVANCED);
            assertThat(i.getImprovement()).isEqualTo(2);
        });
        assertThat(after.getTopTrainingPrograms()).singleElement().satisfies(p -> {
            assertThat(p.getTrainingId()).isEqualTo(terraformCourse.getId());
            assertThat(p.getEnrolledCount()).isEqualTo(1);
            assertThat(p.getCompletedCount()).isEqualTo(1);
        });
    }

    @Test
    @DisplayName("Department analytics recount enrolments and gaps on every call")
    void departmentAnalyticsAreRecomputedPerCall() throws Exception {
        DepartmentAnalyticsResponse before = departmentAnalytics();
        assertThat(before.getTotalEmployees()).isEqualTo(2); // the employee and their manager
        assertThat(before.getTotalEnrollments()).isZero();
        assertThat(before.getAverageLearningProgressPercent()).isZero();
        // The dashboard reports what has actually been analysed rather than analysing on read,
        // so there is no top gap until gap analysis has run for somebody in the department.
        assertThat(before.getTopGapBySkill()).isNull();
        assertThat(before.getCriticalSkillGapCount()).isZero();

        gapAnalysisService.calculateAndFetchUserGaps(employee.getId());

        EnrollmentResponse enrollment = trainingProgressService.enroll(
                employee.getId(), new EnrollmentRequest(terraformCourse.getId()));
        trainingProgressService.updateProgress(
                employee.getId(), enrollment.getEnrollmentId(), new UpdateProgressRequest(40.0));

        DepartmentAnalyticsResponse after = departmentAnalytics();
        assertThat(after.getTotalEnrollments()).isEqualTo(1);
        assertThat(after.getEmployeesEnrolled()).isEqualTo(1);
        assertThat(after.getCompletedEnrollments()).isZero();
        assertThat(after.getAverageLearningProgressPercent()).isEqualTo(40.0);
        // BEGINNER (1) against a required EXPERT (4) is a gap of 3, which classifies as CRITICAL.
        assertThat(after.getCriticalSkillGapCount()).isEqualTo(1);
        assertThat(after.getTopGapBySkill()).isNotNull();
        assertThat(after.getTopGapBySkill().getSkillName()).isEqualTo(terraform.getName());
        assertThat(after.getTopGapBySkill().getAffectedEmployees()).isEqualTo(1);
    }

    @Test
    @DisplayName("Organization analytics recompute the completion rate and average improvement live")
    void organizationAnalyticsAreRecomputedPerCall() throws Exception {
        OrganizationAnalyticsResponse before = organizationAnalytics();
        long enrollmentsBefore = before.getTotalEnrollments();
        long resultsBefore = before.getTotalAssessmentResults();

        EnrollmentResponse enrollment = trainingProgressService.enroll(
                employee.getId(), new EnrollmentRequest(terraformCourse.getId()));
        trainingProgressService.complete(employee.getId(), enrollment.getEnrollmentId());
        submitManagerAssessment(ProficiencyLevel.ADVANCED);

        OrganizationAnalyticsResponse after = organizationAnalytics();
        assertThat(after.getTotalEnrollments()).isEqualTo(enrollmentsBefore + 1);
        assertThat(after.getCompletedEnrollments()).isEqualTo(before.getCompletedEnrollments() + 1);
        assertThat(after.getTotalAssessmentResults()).isEqualTo(resultsBefore + 1);
        assertThat(after.getAverageSkillImprovement()).isGreaterThan(0.0);
        assertThat(after.getWorkforceSkillInventory())
                .anySatisfy(s -> assertThat(s.getSkillName()).isEqualTo(terraform.getName()));
    }

    @Test
    @DisplayName("A manager cannot read the dashboard of somebody outside their reporting line")
    void employeeAnalyticsIsScopedToTheReportingLine() throws Exception {
        User outsider = userRepository.save(
                outsiderUser("analytics.outsider@orgskills.com", "Analytics Outsider"));

        mockMvc.perform(authedGet("/api/analytics/employee/" + outsider.getId(), manager.getId()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(authedGet("/api/analytics/employee/" + employee.getId(), manager.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Organization analytics are refused to an ordinary employee")
    void organizationAnalyticsRequiresAnOrgWideRole() throws Exception {
        mockMvc.perform(authedGet("/api/analytics/organization", employee.getId()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(authedGet("/api/analytics/organization", hrAdmin.getId()))
                .andExpect(status().isOk());
    }

    // ── HTTP helpers: every read goes back over the wire ─────────────────────────

    private EmployeeAnalyticsResponse employeeAnalytics() throws Exception {
        return readJson(authedGet("/api/analytics/employee/" + employee.getId(), employee.getId()),
                EmployeeAnalyticsResponse.class);
    }

    private TeamAnalyticsResponse teamAnalytics() throws Exception {
        return readJson(authedGet("/api/analytics/team/" + manager.getId(), manager.getId()),
                TeamAnalyticsResponse.class);
    }

    private DepartmentAnalyticsResponse departmentAnalytics() throws Exception {
        return readJson(authedGet("/api/analytics/department/" + DEPARTMENT, hrAdmin.getId()),
                DepartmentAnalyticsResponse.class);
    }

    private OrganizationAnalyticsResponse organizationAnalytics() throws Exception {
        return readJson(authedGet("/api/analytics/organization", hrAdmin.getId()),
                OrganizationAnalyticsResponse.class);
    }

    private <T> T readJson(org.springframework.test.web.servlet.RequestBuilder request, Class<T> type)
            throws Exception {
        String body = mockMvc.perform(request)
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readValue(body, type);
    }

    private void submitManagerAssessment(ProficiencyLevel level) {
        CreateAssessmentRequest create = new CreateAssessmentRequest();
        create.setEmployeeId(employee.getId());
        create.setAssessmentType(AssessmentType.MANAGER);
        create.setSkillIds(List.of(terraform.getId()));
        AssessmentResponse scheduled = assessmentService.createAssessment(manager.getId(), create);

        SubmitAssessmentRequest submit = new SubmitAssessmentRequest();
        submit.setResults(List.of(new AssessmentResultRequest(terraform.getId(), level)));
        assessmentService.submitAssessment(manager.getId(), scheduled.getAssessmentId(), submit);
    }

    // ── Fixtures ────────────────────────────────────────────────────────────────

    private Skill skill(String name, String category) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCategory(category);
        return skill;
    }

    private User user(String email, String fullName, Role role, User reportsTo) {
        User user = baseUser(email, fullName, role);
        user.setDepartment(DEPARTMENT);
        user.setJobTitle(JOB_TITLE);
        user.setManager(reportsTo);
        return user;
    }

    private User outsiderUser(String email, String fullName) {
        User user = baseUser(email, fullName, Role.EMPLOYEE);
        user.setDepartment("Some Other Department");
        user.setJobTitle("Unrelated Role");
        return user;
    }

    private User baseUser(String email, String fullName, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword("not-used-in-this-test");
        user.setRole(role);
        user.setActive(true);
        return user;
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    /**
     * Builds a GET as the given user. Filters are disabled in this test, so nothing populates the
     * SecurityContext that {@code @PreAuthorize} reads, nor the request principal that the
     * controller resolves its Authentication parameter from. This sets both.
     */
    private MockHttpServletRequestBuilder authedGet(String url, Long userId) {
        Authentication authentication = principal(userId);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return get(url).principal(authentication);
    }

    private Authentication principal(Long userId) {
        CustomPrincipal customPrincipal = new CustomPrincipal(userId, "analytics@orgskills.com", "",
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
        return new UsernamePasswordAuthenticationToken(customPrincipal, null, customPrincipal.getAuthorities());
    }
}
