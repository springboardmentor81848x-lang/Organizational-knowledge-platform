package com.orgskills.intelligence.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import com.orgskills.intelligence.dto.analytics.EmployeeAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.TeamAnalyticsResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultRequest;
import com.orgskills.intelligence.dto.assessment.CreateAssessmentRequest;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.employee.UpdateProgressRequest;
import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.mentorship.MentorshipRequest;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.dto.mentorship.RecommendedMentorResponse;
import com.orgskills.intelligence.dto.notification.NotificationResponse;
import com.orgskills.intelligence.dto.recommendation.RecommendationResponse;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AchievementType;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.AssessmentService;
import com.orgskills.intelligence.service.GapAnalysisService;
import com.orgskills.intelligence.service.MentorshipService;
import com.orgskills.intelligence.service.RecommendationService;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The full Milestone 3 demo, walked end to end in one transaction against a real context.
 *
 * <p>The point of this test is not to cover each module again — each has its own — but to prove the
 * chain holds without anyone reaching for the database or calling a "now recalculate" endpoint
 * between steps. Every step reads its evidence back through the same API a demo would use.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
class Milestone3DemoScenarioTest {

    private static final String DEPARTMENT = "Demo Engineering";
    private static final String JOB_TITLE = "Demo Platform Engineer";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private MentorshipService mentorshipService;

    @Autowired
    private TrainingProgressService trainingProgressService;

    @Autowired
    private AssessmentService assessmentService;

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
    private User mentor;
    private Skill kafka;
    private Course kafkaCourse;

    @BeforeEach
    void setUp() {
        kafka = skillRepository.save(skill("Kafka (demo)", "Backend"));

        manager = userRepository.save(person("demo.manager@orgskills.com", "Demo Manager", Role.MANAGER, null));
        employee = userRepository.save(
                person("demo.employee@orgskills.com", "Demo Employee", Role.EMPLOYEE, manager));
        mentor = userRepository.save(person("demo.mentor@orgskills.com", "Demo Mentor", Role.EMPLOYEE, manager));

        RoleCompetency competency = new RoleCompetency();
        competency.setJobTitle(JOB_TITLE);
        competency.setDepartment(DEPARTMENT);
        competency.setSkill(kafka);
        competency.setRequiredProficiencyLevel(ProficiencyLevel.EXPERT);
        roleCompetencyRepository.save(competency);

        // The employee is well short of the requirement; the mentor is not.
        userSkillRepository.save(userSkill(employee, ProficiencyLevel.BEGINNER));
        userSkillRepository.save(userSkill(mentor, ProficiencyLevel.EXPERT));

        Course course = new Course();
        course.setTitle("Kafka Streams Deep Dive (demo)");
        course.setProvider("Internal Academy");
        course.setSkillCovered(kafka);
        course.setDifficulty("ADVANCED");
        course.setDurationHours(12.0);
        course.setIsInternal(true);
        kafkaCourse = courseRepository.save(course);
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("The whole Milestone 3 demo runs end to end with no manual step between stages")
    void fullDemoScenario() throws Exception {
        // ── 1. The employee has a knowledge gap ─────────────────────────────────
        List<GapAnalysisResponse> gaps = readList(
                authed(get("/api/gaps/user/" + employee.getId()), employee.getId()),
                GapAnalysisResponse.class);
        GapAnalysisResponse kafkaGap = gapFor(gaps);
        assertThat(kafkaGap.getGapScore()).isEqualTo(3.0);
        assertThat(kafkaGap.getRiskSeverity()).isEqualTo(RiskSeverity.CRITICAL);

        // Recommendations follow from the gap without a separate call.
        List<RecommendationResponse> recommendations = readList(
                authed(get("/api/employee/recommendations"), employee.getId()),
                RecommendationResponse.class);
        assertThat(recommendations)
                .as("gap analysis must generate recommendations on its own")
                .anySatisfy(r -> assertThat(r.getSkillId()).isEqualTo(kafka.getId()));

        // ── 2. A mentor is recommended, requested, and accepts ──────────────────
        List<RecommendedMentorResponse> candidates = readList(
                authed(get("/api/mentorships/recommendations?employeeId=" + employee.getId()
                        + "&skillId=" + kafka.getId()), employee.getId()),
                RecommendedMentorResponse.class);
        assertThat(candidates)
                .as("an EXPERT colleague in the gapped skill should be recommended")
                .anySatisfy(c -> assertThat(c.getMentorId()).isEqualTo(mentor.getId()));

        MentorshipRequest mentorshipRequest = new MentorshipRequest();
        mentorshipRequest.setMenteeId(employee.getId());
        mentorshipRequest.setMentorId(mentor.getId());
        mentorshipRequest.setSkillId(kafka.getId());
        mentorshipRequest.setGoal("Reach production competence with Kafka Streams");
        mentorshipRequest.setStartDate(LocalDate.now());
        mentorshipRequest.setEndDate(LocalDate.now().plusMonths(3));
        MentorshipResponse requested = readCreated(
                authed(post("/api/mentorships"), employee.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mentorshipRequest)),
                MentorshipResponse.class);
        assertThat(requested.getStatus()).isEqualTo(MentorshipStatus.REQUESTED);

        MentorshipResponse accepted = read(
                authed(put("/api/mentorships/" + requested.getMentorshipId() + "/accept"), mentor.getId()),
                MentorshipResponse.class);
        assertThat(accepted.getStatus()).isEqualTo(MentorshipStatus.ACTIVE);

        // ── 3. The employee enrols and works through the course ─────────────────
        EnrollmentResponse enrollment = readCreated(
                authed(post("/api/enrollments"), employee.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EnrollmentRequest(kafkaCourse.getId()))),
                EnrollmentResponse.class);
        assertThat(enrollment.getStatus()).isEqualTo(EnrollmentStatus.NOT_STARTED);

        for (double progress : new double[]{40.0, 60.0, 80.0}) {
            EnrollmentResponse updated = updateProgress(enrollment.getEnrollmentId(), progress);
            assertThat(updated.getProgress()).isEqualTo(progress);
            assertThat(updated.getStatus()).isEqualTo(EnrollmentStatus.IN_PROGRESS);
        }

        // Crossing 75% announced the learning-path milestone.
        assertThat(feedFor(employee)).anySatisfy(n -> {
            assertThat(n.getType()).isEqualTo(NotificationType.TRAINING_PROGRESS);
            assertThat(n.getMessage()).isEqualTo("Congratulations! You completed 80% of your learning path");
        });

        EnrollmentResponse completed = updateProgress(enrollment.getEnrollmentId(), 100.0);
        assertThat(completed.getStatus()).isEqualTo(EnrollmentStatus.COMPLETED);
        assertThat(completed.getCompletionDate()).isNotNull();

        // Achievement and completion notification fired from the completion itself.
        EmployeeAnalyticsResponse afterCourse = employeeAnalytics();
        assertThat(afterCourse.getAchievements())
                .anySatisfy(a -> assertThat(a.getType()).isEqualTo(AchievementType.COURSE_COMPLETED));
        assertThat(feedFor(employee)).anySatisfy(n ->
                assertThat(n.getType()).isEqualTo(NotificationType.ACHIEVEMENT_UNLOCKED));

        // Finishing the course must NOT have moved proficiency: only an assessment does that.
        assertThat(afterCourse.getSkillProfile())
                .as("course completion must not inflate proficiency")
                .anySatisfy(s -> {
                    assertThat(s.getSkillId()).isEqualTo(kafka.getId());
                    assertThat(s.getProficiencyLevel()).isEqualTo(ProficiencyLevel.BEGINNER);
                });

        // ── 4. The employee is assessed; proficiency and gaps follow ────────────
        CreateAssessmentRequest create = new CreateAssessmentRequest();
        create.setEmployeeId(employee.getId());
        create.setAssessmentType(AssessmentType.MANAGER);
        create.setSkillIds(List.of(kafka.getId()));
        AssessmentResponse scheduled = readCreated(
                authed(post("/api/assessments"), manager.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)),
                AssessmentResponse.class);

        SubmitAssessmentRequest submit = new SubmitAssessmentRequest();
        submit.setResults(List.of(new AssessmentResultRequest(kafka.getId(), ProficiencyLevel.ADVANCED)));
        AssessmentResponse submitted = read(
                authed(post("/api/assessments/" + scheduled.getAssessmentId() + "/submit"), manager.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submit)),
                AssessmentResponse.class);

        assertThat(submitted.getResults()).singleElement().satisfies(r -> {
            assertThat(r.getPreviousProficiency()).isEqualTo(ProficiencyLevel.BEGINNER);
            assertThat(r.getProficiency()).isEqualTo(ProficiencyLevel.ADVANCED);
            assertThat(r.getImprovement()).isEqualTo(2);
        });

        // The gap recalculated with no separate call: read the stored rows back over HTTP.
        GapAnalysisResponse gapAfter = gapFor(storedGaps());
        assertThat(gapAfter.getCurrentScore()).isEqualTo(3.0);
        assertThat(gapAfter.getGapScore()).isEqualTo(1.0);
        assertThat(gapAfter.getRiskSeverity()).isEqualTo(RiskSeverity.MEDIUM);

        assertThat(feedFor(employee)).anySatisfy(n -> {
            assertThat(n.getType()).isEqualTo(NotificationType.ASSESSMENT_RESULT);
            assertThat(n.getMessage()).contains("has improved to Advanced");
        });

        // ── 5. The employee dashboard reflects all of it ────────────────────────
        EmployeeAnalyticsResponse dashboard = employeeAnalytics();
        assertThat(dashboard.getLearningProgressPercent()).isEqualTo(100.0);
        assertThat(dashboard.getCompletedEnrollments()).isEqualTo(1);
        assertThat(dashboard.getActiveEnrollments()).isZero();
        assertThat(dashboard.getSkillProfile()).anySatisfy(s -> {
            assertThat(s.getSkillId()).isEqualTo(kafka.getId());
            assertThat(s.getProficiencyLevel()).isEqualTo(ProficiencyLevel.ADVANCED);
        });
        assertThat(dashboard.getRecentAssessmentResults()).singleElement()
                .satisfies(r -> assertThat(r.getImprovement()).isEqualTo(2));
        assertThat(dashboard.getActiveMentor())
                .as("the accepted mentorship should show on the dashboard")
                .isNotNull();
        assertThat(dashboard.getActiveMentor().getMentorId()).isEqualTo(mentor.getId());
        assertThat(dashboard.getGapSummary().getOverallReadinessPercentage()).isEqualTo(75.0);

        // ── 6. The manager dashboard reflects it too ────────────────────────────
        TeamAnalyticsResponse team = teamAnalytics();
        assertThat(team.getTeamSize()).isEqualTo(2); // the employee and the mentor both report in
        assertThat(team.getMemberSnapshots())
                .anySatisfy(m -> {
                    assertThat(m.getId()).isEqualTo(employee.getId());
                    assertThat(m.getLastAssessmentDate()).isNotNull();
                });
        assertThat(team.getImprovedAfterTraining())
                .as("the assessment came after the course finished, so it counts as improvement after training")
                .anySatisfy(i -> {
                    assertThat(i.getEmployeeId()).isEqualTo(employee.getId());
                    assertThat(i.getTrainingTitle()).isEqualTo(kafkaCourse.getTitle());
                    assertThat(i.getImprovement()).isEqualTo(2);
                });
        assertThat(team.getTopTrainingPrograms()).anySatisfy(p -> {
            assertThat(p.getTrainingId()).isEqualTo(kafkaCourse.getId());
            assertThat(p.getCompletedCount()).isEqualTo(1);
        });

        // ── 7. The report carries the same updated numbers ──────────────────────
        String reportText = pdfText(reportBytes());
        assertThat(reportText).contains("Employee Learning Report", "Demo Employee", DEPARTMENT);
        assertThat(reportText).contains(kafka.getName());
        assertThat(reportText).contains("ADVANCED");
        assertThat(reportText).as("the report must show the improvement the assessment recorded")
                .contains("+2");
        assertThat(reportText).as("the report must show the course as finished")
                .contains("100");
    }

    // ── Reads, all through the API ──────────────────────────────────────────────

    private EnrollmentResponse updateProgress(Long enrollmentId, double progress) throws Exception {
        return read(authed(put("/api/enrollments/" + enrollmentId + "/progress"), employee.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateProgressRequest(progress))),
                EnrollmentResponse.class);
    }

    private <T> T readCreated(MockHttpServletRequestBuilder request, Class<T> type) throws Exception {
        String body = mockMvc.perform(request)
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readValue(body, type);
    }

    private GapAnalysisResponse gapFor(List<GapAnalysisResponse> gaps) {
        return gaps.stream()
                .filter(g -> g.getSkillId().equals(kafka.getId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No gap recorded for the demo skill"));
    }

    private List<GapAnalysisResponse> storedGaps() throws Exception {
        return readList(authed(get("/api/gaps/user/" + employee.getId() + "/stored"), employee.getId()),
                GapAnalysisResponse.class);
    }

    private EmployeeAnalyticsResponse employeeAnalytics() throws Exception {
        return read(authed(get("/api/analytics/employee/" + employee.getId()), employee.getId()),
                EmployeeAnalyticsResponse.class);
    }

    private TeamAnalyticsResponse teamAnalytics() throws Exception {
        return read(authed(get("/api/analytics/team/" + manager.getId()), manager.getId()),
                TeamAnalyticsResponse.class);
    }

    private List<NotificationResponse> feedFor(User user) throws Exception {
        return readList(authed(get("/api/notifications"), user.getId()), NotificationResponse.class);
    }

    private byte[] reportBytes() throws Exception {
        return mockMvc.perform(authed(get("/api/reports/employee/" + employee.getId() + "?format=pdf"),
                        manager.getId()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();
    }

    private String pdfText(byte[] pdf) throws Exception {
        assertThat(new String(pdf, 0, 5, StandardCharsets.ISO_8859_1)).isEqualTo("%PDF-");
        PdfReader reader = new PdfReader(pdf);
        try {
            PdfTextExtractor extractor = new PdfTextExtractor(reader);
            StringBuilder text = new StringBuilder();
            for (int page = 1; page <= reader.getNumberOfPages(); page++) {
                text.append(extractor.getTextFromPage(page)).append('\n');
            }
            return text.toString();
        } finally {
            reader.close();
        }
    }

    private <T> T read(MockHttpServletRequestBuilder request, Class<T> type) throws Exception {
        return objectMapper.readValue(body(request), type);
    }

    private <T> List<T> readList(MockHttpServletRequestBuilder request, Class<T> type) throws Exception {
        return objectMapper.readValue(body(request),
                objectMapper.getTypeFactory().constructCollectionType(List.class, type));
    }

    private String body(MockHttpServletRequestBuilder request) throws Exception {
        return mockMvc.perform(request)
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
    }

    private MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder, Long userId) {
        Authentication authentication = principal(userId);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return builder.principal(authentication);
    }

    // ── Fixtures ────────────────────────────────────────────────────────────────

    private Skill skill(String name, String category) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCategory(category);
        return skill;
    }

    private UserSkill userSkill(User user, ProficiencyLevel level) {
        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(kafka);
        userSkill.setProficiencyLevel(level);
        userSkill.setRatingScore((double) level.getScore());
        return userSkill;
    }

    private User person(String email, String fullName, Role role, User reportsTo) {
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
        CustomPrincipal customPrincipal = new CustomPrincipal(userId, "demo@orgskills.com", "",
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
        return new UsernamePasswordAuthenticationToken(customPrincipal, null, customPrincipal.getAuthorities());
    }
}
