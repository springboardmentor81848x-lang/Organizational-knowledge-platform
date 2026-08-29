package com.orgskills.intelligence.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultRequest;
import com.orgskills.intelligence.dto.assessment.CreateAssessmentRequest;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.employee.UpdateProgressRequest;
import com.orgskills.intelligence.dto.notification.NotificationResponse;
import com.orgskills.intelligence.dto.session.SessionRequest;
import com.orgskills.intelligence.dto.session.SessionResponse;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.NotificationType;
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
import com.orgskills.intelligence.service.KnowledgeSessionService;
import com.orgskills.intelligence.service.NotificationReminderService;
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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The acceptance criterion for notifications: each trigger must fire from the real workflow in the
 * earlier parts and leave a row visible on {@code GET /api/notifications}.
 *
 * <p>Nothing here calls a notification endpoint to create a notification. Every assertion follows a
 * genuine action — submitting an assessment, moving a course along, scheduling a session — or runs
 * the scan the scheduler runs, and then reads the feed back over HTTP.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
class NotificationTriggersIntegrationTest {

    private static final String DEPARTMENT = "Notifications Test Department";
    private static final String JOB_TITLE = "Notifications Test Engineer";

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
    private KnowledgeSessionService knowledgeSessionService;

    @Autowired
    private NotificationReminderService reminderService;

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
    private Skill graphql;
    private Course graphqlCourse;

    @BeforeEach
    void setUp() {
        graphql = skillRepository.save(skill("GraphQL (notifications test)", "Backend"));

        manager = userRepository.save(member("notify.manager@orgskills.com", "Notify Manager", Role.MANAGER, null));
        employee = userRepository.save(
                member("notify.employee@orgskills.com", "Notify Employee", Role.EMPLOYEE, manager));

        RoleCompetency competency = new RoleCompetency();
        competency.setJobTitle(JOB_TITLE);
        competency.setDepartment(DEPARTMENT);
        competency.setSkill(graphql);
        competency.setRequiredProficiencyLevel(ProficiencyLevel.EXPERT);
        roleCompetencyRepository.save(competency);

        userSkillRepository.save(userSkill(employee, ProficiencyLevel.INTERMEDIATE));
        // The manager is EXPERT in the skill, which is what qualifies them to host a session.
        userSkillRepository.save(userSkill(manager, ProficiencyLevel.EXPERT));

        Course course = new Course();
        course.setTitle("GraphQL In Practice (notifications test)");
        course.setProvider("Internal Academy");
        course.setSkillCovered(graphql);
        course.setDifficulty("INTERMEDIATE");
        course.setDurationHours(10.0);
        course.setIsInternal(true);
        graphqlCourse = courseRepository.save(course);
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    // ── 1. Gap alert from the real recalculation flow ───────────────────────────

    @Test
    @DisplayName("Submitting an assessment that opens a HIGH gap raises a gap alert")
    void assessmentOpeningAHighGapRaisesAGapAlert() throws Exception {
        // The assessment drops the employee to BEGINNER (1) against a required EXPERT (4).
        // That is a gap of 3, and the recalculation the submission triggers must alert on it.
        submitManagerAssessment(ProficiencyLevel.BEGINNER);

        List<NotificationResponse> feed = feedFor(employee);
        assertThat(feed).anySatisfy(n -> {
            assertThat(n.getType()).isEqualTo(NotificationType.GAP_ALERT);
            assertThat(n.getTitle()).contains(graphql.getName());
            assertThat(n.getMessage()).contains("proficiency gap");
        });
    }

    @Test
    @DisplayName("A HIGH gap alerts, where previously only CRITICAL did")
    void highSeverityGapsAlertToo() throws Exception {
        // INTERMEDIATE (2) against a required EXPERT (4) is a gap of 2, which is HIGH not CRITICAL.
        gapAnalysisService.calculateAndFetchUserGaps(employee.getId());

        assertThat(feedFor(employee))
                .filteredOn(n -> n.getType() == NotificationType.GAP_ALERT)
                .isNotEmpty()
                .anySatisfy(n -> assertThat(n.getTitle()).startsWith("High skill gap detected"));
    }

    // ── 2. Training deadline reminder from the scheduled scan ───────────────────

    @Test
    @DisplayName("The deadline scan reminds a learner whose target completion date is approaching")
    void trainingDeadlineScanRemindsTheLearner() throws Exception {
        EnrollmentRequest request = new EnrollmentRequest(graphqlCourse.getId());
        request.setTargetCompletionDate(Instant.now().plus(3, ChronoUnit.DAYS));
        EnrollmentResponse enrollment = trainingProgressService.enroll(employee.getId(), request);
        trainingProgressService.updateProgress(
                employee.getId(), enrollment.getEnrollmentId(), new UpdateProgressRequest(20.0));

        assertThat(reminderService.sendTrainingDeadlineReminders()).isEqualTo(1);

        assertThat(feedFor(employee)).anySatisfy(n -> {
            assertThat(n.getType()).isEqualTo(NotificationType.TRAINING_DEADLINE);
            assertThat(n.getMessage()).contains(graphqlCourse.getTitle(), "20%");
        });

        // A second run must not repeat itself: the scan is nightly.
        assertThat(reminderService.sendTrainingDeadlineReminders()).isZero();
    }

    @Test
    @DisplayName("A completed enrolment is not chased about its deadline")
    void finishedTrainingIsNotChased() {
        EnrollmentRequest request = new EnrollmentRequest(graphqlCourse.getId());
        request.setTargetCompletionDate(Instant.now().plus(2, ChronoUnit.DAYS));
        EnrollmentResponse enrollment = trainingProgressService.enroll(employee.getId(), request);
        trainingProgressService.complete(employee.getId(), enrollment.getEnrollmentId());

        assertThat(reminderService.sendTrainingDeadlineReminders()).isZero();
    }

    // ── 3. New recommendation alert from generation ─────────────────────────────

    @Test
    @DisplayName("Recalculating gaps regenerates recommendations and announces them")
    void newRecommendationsAreAnnounced() throws Exception {
        gapAnalysisService.calculateAndFetchUserGaps(employee.getId());

        assertThat(feedFor(employee)).anySatisfy(n -> {
            assertThat(n.getType()).isEqualTo(NotificationType.TRAINING_RECOMMENDATION);
            assertThat(n.getTitle()).isEqualTo("New training recommendations");
            assertThat(n.getMessage()).contains(graphql.getName());
        });
    }

    // ── 4. Mentorship session reminder from the scheduled scan ──────────────────

    @Test
    @DisplayName("The session scan reminds the host and the registered mentee")
    void sessionScanRemindsHostAndAttendees() throws Exception {
        SessionRequest request = new SessionRequest();
        request.setTitle("GraphQL mentoring hour");
        request.setDescription("Schema design walkthrough");
        request.setSessionDate(Instant.now().plus(20, ChronoUnit.HOURS));
        request.setDurationMinutes(60);
        request.setCapacity(5);
        SessionResponse session = knowledgeSessionService.createSession(manager.getId(), request);
        knowledgeSessionService.register(employee.getId(), session.getSessionId());

        assertThat(reminderService.sendSessionReminders()).isEqualTo(2);

        assertThat(feedFor(employee)).anySatisfy(n -> {
            assertThat(n.getType()).isEqualTo(NotificationType.SESSION_REMINDER);
            assertThat(n.getMessage()).contains("Your mentorship session", "GraphQL mentoring hour");
        });
        assertThat(feedFor(manager)).anySatisfy(n -> {
            assertThat(n.getType()).isEqualTo(NotificationType.SESSION_REMINDER);
            assertThat(n.getMessage()).contains("You are hosting");
        });

        assertThat(reminderService.sendSessionReminders()).isZero();
    }

    @Test
    @DisplayName("A session further out than the reminder horizon is left alone")
    void distantSessionsAreNotRemindedAboutYet() {
        SessionRequest request = new SessionRequest();
        request.setTitle("Far future session");
        request.setSessionDate(Instant.now().plus(30, ChronoUnit.DAYS));
        request.setDurationMinutes(60);
        request.setCapacity(5);
        knowledgeSessionService.createSession(manager.getId(), request);

        assertThat(reminderService.sendSessionReminders()).isZero();
    }

    // ── 5. Learning milestone notification from Part 4 ──────────────────────────

    @Test
    @DisplayName("Passing 80% of a course produces the learning path milestone notification")
    void learningMilestoneNotificationFiresAtEightyPercent() throws Exception {
        EnrollmentResponse enrollment = trainingProgressService.enroll(
                employee.getId(), new EnrollmentRequest(graphqlCourse.getId()));
        trainingProgressService.updateProgress(
                employee.getId(), enrollment.getEnrollmentId(), new UpdateProgressRequest(80.0));

        assertThat(feedFor(employee)).anySatisfy(n -> {
            assertThat(n.getType()).isEqualTo(NotificationType.TRAINING_PROGRESS);
            assertThat(n.getMessage())
                    .isEqualTo("Congratulations! You completed 80% of your learning path");
        });
    }

    // ── 6. Assessment reminder from the scheduled scan ──────────────────────────

    @Test
    @DisplayName("The assessment scan chases a pending assessment falling due")
    void assessmentScanChasesPendingAssessments() throws Exception {
        CreateAssessmentRequest create = new CreateAssessmentRequest();
        create.setEmployeeId(employee.getId());
        create.setAssessmentType(AssessmentType.MANAGER);
        create.setSkillIds(List.of(graphql.getId()));
        create.setDate(Instant.now().plus(2, ChronoUnit.DAYS));
        assessmentService.createAssessment(manager.getId(), create);

        assertThat(reminderService.sendAssessmentReminders()).isEqualTo(2);

        assertThat(feedFor(manager)).anySatisfy(n -> {
            assertThat(n.getType()).isEqualTo(NotificationType.ASSESSMENT_REMINDER);
            assertThat(n.getMessage()).contains("you scheduled for", employee.getFullName());
        });
        assertThat(feedFor(employee)).anySatisfy(n -> {
            assertThat(n.getType()).isEqualTo(NotificationType.ASSESSMENT_REMINDER);
            assertThat(n.getMessage()).contains("assessment of your skills is due");
        });

        assertThat(reminderService.sendAssessmentReminders()).isZero();
    }

    @Test
    @DisplayName("A submitted assessment is no longer chased")
    void submittedAssessmentsAreNotChased() {
        CreateAssessmentRequest create = new CreateAssessmentRequest();
        create.setEmployeeId(employee.getId());
        create.setAssessmentType(AssessmentType.MANAGER);
        create.setSkillIds(List.of(graphql.getId()));
        create.setDate(Instant.now().plus(1, ChronoUnit.DAYS));
        AssessmentResponse scheduled = assessmentService.createAssessment(manager.getId(), create);

        SubmitAssessmentRequest submit = new SubmitAssessmentRequest();
        submit.setResults(List.of(new AssessmentResultRequest(graphql.getId(), ProficiencyLevel.ADVANCED)));
        assessmentService.submitAssessment(manager.getId(), scheduled.getAssessmentId(), submit);

        assertThat(reminderService.sendAssessmentReminders()).isZero();
    }

    // ── Endpoints ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/notifications returns the caller's feed newest first")
    void feedIsNewestFirst() throws Exception {
        gapAnalysisService.calculateAndFetchUserGaps(employee.getId());
        trainingProgressService.enroll(employee.getId(), new EnrollmentRequest(graphqlCourse.getId()));

        List<NotificationResponse> feed = feedFor(employee);
        assertThat(feed).hasSizeGreaterThan(1);
        for (int i = 1; i < feed.size(); i++) {
            assertThat(feed.get(i - 1).getCreatedAt())
                    .isAfterOrEqualTo(feed.get(i).getCreatedAt());
        }
    }

    @Test
    @DisplayName("PUT /api/notifications/{id}/read marks the caller's notification read")
    void markAsRead() throws Exception {
        gapAnalysisService.calculateAndFetchUserGaps(employee.getId());
        NotificationResponse first = feedFor(employee).get(0);
        assertThat(first.getIsRead()).isFalse();

        mockMvc.perform(authed(put("/api/notifications/" + first.getId() + "/read"), employee.getId()))
                .andExpect(status().isOk());

        assertThat(feedFor(employee)).anySatisfy(n -> {
            assertThat(n.getId()).isEqualTo(first.getId());
            assertThat(n.getIsRead()).isTrue();
        });
    }

    @Test
    @DisplayName("One employee cannot read or act on another employee's notifications")
    void feedsAreScopedToTheirOwner() throws Exception {
        gapAnalysisService.calculateAndFetchUserGaps(employee.getId());
        NotificationResponse target = feedFor(employee).get(0);

        User outsider = userRepository.save(
                member("notify.outsider@orgskills.com", "Notify Outsider", Role.EMPLOYEE, manager));

        mockMvc.perform(authed(get("/api/notifications?userId=" + employee.getId()), outsider.getId()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(authed(put("/api/notifications/" + target.getId() + "/read"), outsider.getId()))
                .andExpect(status().isUnauthorized());
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private List<NotificationResponse> feedFor(User user) throws Exception {
        String body = mockMvc.perform(authed(get("/api/notifications"), user.getId()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readValue(body,
                objectMapper.getTypeFactory().constructCollectionType(List.class, NotificationResponse.class));
    }

    /**
     * Filters are disabled here, so nothing populates the SecurityContext that method security
     * reads, nor the request principal the controller resolves its Authentication from.
     */
    private MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder, Long userId) {
        Authentication authentication = principal(userId);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return builder.principal(authentication);
    }

    private void submitManagerAssessment(ProficiencyLevel level) {
        CreateAssessmentRequest create = new CreateAssessmentRequest();
        create.setEmployeeId(employee.getId());
        create.setAssessmentType(AssessmentType.MANAGER);
        create.setSkillIds(List.of(graphql.getId()));
        AssessmentResponse scheduled = assessmentService.createAssessment(manager.getId(), create);

        SubmitAssessmentRequest submit = new SubmitAssessmentRequest();
        submit.setResults(List.of(new AssessmentResultRequest(graphql.getId(), level)));
        assessmentService.submitAssessment(manager.getId(), scheduled.getAssessmentId(), submit);
    }

    private UserSkill userSkill(User user, ProficiencyLevel level) {
        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(graphql);
        userSkill.setProficiencyLevel(level);
        userSkill.setRatingScore((double) level.getScore());
        return userSkill;
    }

    private Skill skill(String name, String category) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCategory(category);
        return skill;
    }

    private User member(String email, String fullName, Role role, User reportsTo) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword("not-used-in-this-test");
        user.setRole(role);
        user.setActive(true);
        user.setDepartment(DEPARTMENT);
        user.setJobTitle(JOB_TITLE);
        user.setManager(reportsTo);
        return user;
    }

    private Authentication principal(Long userId) {
        CustomPrincipal customPrincipal = new CustomPrincipal(userId, "notify@orgskills.com", "",
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
        return new UsernamePasswordAuthenticationToken(customPrincipal, null, customPrincipal.getAuthorities());
    }
}
