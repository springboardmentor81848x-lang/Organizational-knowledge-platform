package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.assistant.AssistantChatRequest;
import com.orgskills.intelligence.dto.assistant.AssistantChatResponse;
import com.orgskills.intelligence.dto.recommendation.CourseRecommendationScore;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.TrainingRecommendationRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * The assistant's offline path, which is what runs whenever no model is configured — the
 * project's default state. These assert the grounding rather than the phrasing: that the answer
 * names the caller's real worst gap, that the courses offered are real catalogue rows, and that
 * a finished course is never recommended back to the person who finished it.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AssistantServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private GapAnalysisRepository gapAnalysisRepository;
    @Mock private TrainingRecommendationRepository recommendationRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private UserSkillRepository userSkillRepository;
    @Mock private RecommendationScoringService recommendationScoringService;
    @Mock private LlmClient llmClient;

    /**
     * The context service is real rather than mocked: the behaviour under test is how the
     * caller's rows become an answer, and mocking it away would leave nothing worth asserting.
     */
    private AssistantService assistantService;

    private static final long USER_ID = 1L;

    private Skill java;
    private Skill communication;
    private User employee;

    @BeforeEach
    void setUp() {
        AssistantContextService contextService = new AssistantContextService(
                userRepository,
                gapAnalysisRepository,
                recommendationRepository,
                enrollmentRepository,
                userSkillRepository,
                recommendationScoringService);
        assistantService = new AssistantService(contextService, llmClient);

        java = new Skill();
        java.setId(10L);
        java.setName("Java");
        java.setCategory("Backend");

        communication = new Skill();
        communication.setId(11L);
        communication.setName("Communication");
        communication.setCategory("Soft skills");

        employee = new User();
        employee.setId(USER_ID);
        employee.setFullName("Alice Ng");
        employee.setRole(Role.EMPLOYEE);
        employee.setJobTitle("Software Engineer");
        employee.setDepartment("Engineering");

        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(employee));
        when(recommendationRepository.findByEmployeeIdOrderByPriorityRankAsc(USER_ID)).thenReturn(List.of());
        when(enrollmentRepository.findByEmployeeIdOrderByStartDateDesc(USER_ID)).thenReturn(List.of());
        when(userSkillRepository.findByUserId(USER_ID)).thenReturn(List.of());
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(USER_ID)).thenReturn(List.of());
        when(recommendationScoringService.scoreCoursesForEmployee(USER_ID)).thenReturn(List.of());

        // The default state of the project: mock mode on, so no model is called.
        when(llmClient.isLive()).thenReturn(false);
    }

    @Test
    @DisplayName("Answers name the caller's largest gap and never reach the model when none is configured")
    void answersFromGapsWithoutAModel() {
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(USER_ID))
                .thenReturn(List.of(gap(communication, 0.0, 3.0, 3.0, RiskSeverity.CRITICAL),
                        gap(java, 2.0, 3.0, 1.0, RiskSeverity.MEDIUM)));

        AssistantChatResponse response = ask("Which gap should I close first?");

        assertThat(response.getAnswer()).contains("Communication").contains("critical");
        assertThat(response.isAnsweredByModel()).isFalse();
        verifyNoModelCall();
    }

    @Test
    @DisplayName("A question naming a skill narrows the suggested courses to that skill")
    void narrowsSuggestionsToTheSkillNamed() {
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(USER_ID))
                .thenReturn(List.of(gap(communication, 0.0, 3.0, 3.0, RiskSeverity.CRITICAL),
                        gap(java, 2.0, 3.0, 1.0, RiskSeverity.MEDIUM)));
        when(recommendationScoringService.scoreCoursesForEmployee(USER_ID)).thenReturn(List.of(
                score(course(101L, "Speaking with Impact", communication), communication, 90.0),
                score(course(102L, "Java Concurrency", java), java, 70.0)));

        AssistantChatResponse response = ask("What should I study for Java?");

        assertThat(response.getSuggestedCourses())
                .singleElement()
                .satisfies(suggestion -> {
                    assertThat(suggestion.getTitle()).isEqualTo("Java Concurrency");
                    assertThat(suggestion.getSkillName()).isEqualTo("Java");
                });
    }

    @Test
    @DisplayName("A course the employee already finished is not recommended back to them")
    void dropsCoursesAlreadyCompleted() {
        Course finished = course(101L, "Speaking with Impact", communication);
        Course open = course(102L, "Writing Clearly", communication);

        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(USER_ID))
                .thenReturn(List.of(gap(communication, 0.0, 3.0, 3.0, RiskSeverity.CRITICAL)));
        when(enrollmentRepository.findByEmployeeIdOrderByStartDateDesc(USER_ID))
                .thenReturn(List.of(enrollment(finished, EnrollmentStatus.COMPLETED, 100.0)));
        when(recommendationScoringService.scoreCoursesForEmployee(USER_ID)).thenReturn(List.of(
                score(finished, communication, 95.0),
                score(open, communication, 80.0)));

        AssistantChatResponse response = ask("What should I learn next?");

        assertThat(response.getSuggestedCourses())
                .extracting(suggestion -> suggestion.getTitle())
                .containsExactly("Writing Clearly");
    }

    @Test
    @DisplayName("With nothing measured yet, the answer points at the assessment rather than inventing a gap")
    void explainsTheEmptyStateInsteadOfGuessing() {
        AssistantChatResponse response = ask("Which gap should I close first?");

        assertThat(response.getAnswer()).containsIgnoringCase("assessment");
        assertThat(response.getSuggestedCourses()).isEmpty();
        assertThat(response.getFollowUps()).isNotEmpty();
    }

    @Test
    @DisplayName("An account with no competency profile to rank against still gets an answer")
    void survivesAnEmployeeWithNoRankableCourses() {
        when(recommendationScoringService.scoreCoursesForEmployee(USER_ID))
                .thenThrow(new IllegalStateException("no competency profile"));
        when(userSkillRepository.findByUserId(USER_ID))
                .thenReturn(List.of(userSkill(java, ProficiencyLevel.INTERMEDIATE, 2.0)));

        AssistantChatResponse response = ask("What are my strongest skills?");

        assertThat(response.getAnswer()).contains("Java");
        assertThat(response.getSuggestedCourses()).isEmpty();
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private AssistantChatResponse ask(String message) {
        AssistantChatRequest request = new AssistantChatRequest();
        request.setMessage(message);
        return assistantService.chat(USER_ID, request);
    }

    private void verifyNoModelCall() {
        try {
            verify(llmClient, never()).completeText(org.mockito.ArgumentMatchers.anyString(),
                    org.mockito.ArgumentMatchers.anyList());
        } catch (Exception ex) {
            throw new AssertionError("Unexpected checked exception while verifying", ex);
        }
    }

    private GapAnalysis gap(Skill skill, double current, double target, double gapScore, RiskSeverity severity) {
        GapAnalysis gap = new GapAnalysis();
        gap.setUser(employee);
        gap.setSkill(skill);
        gap.setCurrentScore(current);
        gap.setTargetScore(target);
        gap.setGapScore(gapScore);
        gap.setRiskSeverity(severity);
        gap.setMissingSkill(false);
        return gap;
    }

    private Course course(Long id, String title, Skill skill) {
        return new Course(id, title, "A course", "Coursera", skill, "BEGINNER", 8.0, true, null, null);
    }

    private CourseRecommendationScore score(Course course, Skill skill, double value) {
        return CourseRecommendationScore.builder()
                .course(course)
                .skill(skill)
                .score(value)
                .scoreBreakdown("Total: " + value + "/100")
                .build();
    }

    private Enrollment enrollment(Course course, EnrollmentStatus status, double progress) {
        Enrollment enrollment = new Enrollment();
        enrollment.setEmployee(employee);
        enrollment.setCourse(course);
        enrollment.setStatus(status);
        enrollment.setProgress(progress);
        return enrollment;
    }

    private UserSkill userSkill(Skill skill, ProficiencyLevel level, double rating) {
        UserSkill userSkill = new UserSkill();
        userSkill.setUser(employee);
        userSkill.setSkill(skill);
        userSkill.setProficiencyLevel(level);
        userSkill.setRatingScore(rating);
        return userSkill;
    }
}
