package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.ld.LearningPathResponse;
import com.orgskills.intelligence.dto.ld.LearningPathStepResponse;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.LearningPath;
import com.orgskills.intelligence.entity.LearningPathStep;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.LearningPathRepository;
import com.orgskills.intelligence.repository.LearningPathStepRepository;
import com.orgskills.intelligence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LearningPathServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GapAnalysisRepository gapAnalysisRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private LearningPathRepository learningPathRepository;

    @Mock
    private LearningPathStepRepository learningPathStepRepository;

    @Mock
    private GapAnalysisService gapAnalysisService;

    @Mock
    private RecommendationScoringService recommendationScoringService;

    @InjectMocks
    private LearningPathService learningPathService;

    private User sampleUser;
    private Skill javaSkill;
    private GapAnalysis javaGap;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(100L);
        sampleUser.setEmail("dev@company.com");
        sampleUser.setFullName("Jane Developer");
        sampleUser.setRole(Role.EMPLOYEE);
        sampleUser.setJobTitle("Software Engineer");
        sampleUser.setDepartment("Engineering");

        javaSkill = new Skill();
        javaSkill.setId(1L);
        javaSkill.setName("Java");
        javaSkill.setCategory("Backend");

        javaGap = new GapAnalysis();
        javaGap.setId(10L);
        javaGap.setUser(sampleUser);
        javaGap.setSkill(javaSkill);
        javaGap.setCurrentScore(1.0);
        javaGap.setTargetScore(4.0);
        javaGap.setGapScore(3.0);
        javaGap.setRiskSeverity(RiskSeverity.HIGH);
    }

    @Test
    @DisplayName("Generate learning paths orders courses beginner -> intermediate -> advanced and calculates total hours & calendar time")
    void testGenerateLearningPaths_BeginnerToAdvanced() {
        Course beginnerCourse = new Course(10L, "Java Basics", "Intro to Java", "Internal L&D", javaSkill, "BEGINNER", 5.0, true, null, null);
        Course intermediateCourse = new Course(11L, "Spring Boot Microservices", "Intermediate Java", "Internal L&D", javaSkill, "INTERMEDIATE", 10.0, true, null, null);
        Course advancedCourse = new Course(12L, "Advanced Java Concurrency", "Deep dive Java", "Coursera", javaSkill, "ADVANCED", 15.0, false, "http://ext", null);

        when(userRepository.findById(100L)).thenReturn(Optional.of(sampleUser));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(100L)).thenReturn(List.of(javaGap));
        when(courseRepository.findBySkillCoveredId(1L)).thenReturn(List.of(advancedCourse, beginnerCourse, intermediateCourse));
        when(learningPathRepository.findByEmployeeIdAndTargetSkillId(100L, 1L)).thenReturn(Optional.empty());
        when(learningPathRepository.save(any(LearningPath.class))).thenAnswer(inv -> inv.getArgument(0));

        List<LearningPathResponse> responses = learningPathService.generateLearningPathsForEmployee(100L);

        assertThat(responses).hasSize(1);
        LearningPathResponse response = responses.get(0);
        assertThat(response.getTitle()).contains("Java");
        assertThat(response.getNoCoursesAvailable()).isFalse();
        assertThat(response.getSteps()).hasSize(3);

        List<LearningPathStepResponse> steps = response.getSteps();
        assertThat(steps.get(0).getStepOrder()).isEqualTo(1);
        assertThat(steps.get(0).getDifficultyStage()).isEqualTo("BEGINNER");
        assertThat(steps.get(0).getCourseTitle()).isEqualTo("Java Basics");

        assertThat(steps.get(1).getStepOrder()).isEqualTo(2);
        assertThat(steps.get(1).getDifficultyStage()).isEqualTo("INTERMEDIATE");
        assertThat(steps.get(1).getCourseTitle()).isEqualTo("Spring Boot Microservices");

        assertThat(steps.get(2).getStepOrder()).isEqualTo(3);
        assertThat(steps.get(2).getDifficultyStage()).isEqualTo("ADVANCED");
        assertThat(steps.get(2).getCourseTitle()).isEqualTo("Advanced Java Concurrency");

        assertThat(response.getTotalEstimatedHours()).isEqualTo(30);
        assertThat(response.getEstimatedCalendarTime()).isEqualTo("Est. 8 weeks");
    }

    @Test
    @DisplayName("Employee with current skill score >= 2.0 skips beginner-level courses")
    void testGenerateLearningPaths_SkipBeginnerWhenLevelAbove2() {
        javaGap.setCurrentScore(2.5); // Current level is past beginner

        Course beginnerCourse = new Course(10L, "Java Basics", "Intro", "Internal L&D", javaSkill, "BEGINNER", 5.0, true, null, null);
        Course intermediateCourse = new Course(11L, "Spring Boot", "Intermediate", "Internal L&D", javaSkill, "INTERMEDIATE", 10.0, true, null, null);
        Course advancedCourse = new Course(12L, "JVM Tuning", "Advanced", "Coursera", javaSkill, "ADVANCED", 15.0, false, null, null);

        when(userRepository.findById(100L)).thenReturn(Optional.of(sampleUser));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(100L)).thenReturn(List.of(javaGap));
        when(courseRepository.findBySkillCoveredId(1L)).thenReturn(List.of(beginnerCourse, intermediateCourse, advancedCourse));
        when(learningPathRepository.findByEmployeeIdAndTargetSkillId(100L, 1L)).thenReturn(Optional.empty());
        when(learningPathRepository.save(any(LearningPath.class))).thenAnswer(inv -> inv.getArgument(0));

        List<LearningPathResponse> responses = learningPathService.generateLearningPathsForEmployee(100L);

        assertThat(responses).hasSize(1);
        List<LearningPathStepResponse> steps = responses.get(0).getSteps();
        assertThat(steps).hasSize(2);
        assertThat(steps).extracting(LearningPathStepResponse::getDifficultyStage)
                .containsExactly("INTERMEDIATE", "ADVANCED");
    }

    @Test
    @DisplayName("Skill gap with zero matching courses produces valid empty-step response with noCoursesAvailable=true")
    void testGenerateLearningPaths_ZeroMatchingCourses() {
        when(userRepository.findById(100L)).thenReturn(Optional.of(sampleUser));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(100L)).thenReturn(List.of(javaGap));
        when(courseRepository.findBySkillCoveredId(1L)).thenReturn(List.of()); // No courses available
        when(learningPathRepository.findByEmployeeIdAndTargetSkillId(100L, 1L)).thenReturn(Optional.empty());
        when(learningPathRepository.save(any(LearningPath.class))).thenAnswer(inv -> inv.getArgument(0));

        List<LearningPathResponse> responses = learningPathService.generateLearningPathsForEmployee(100L);

        assertThat(responses).hasSize(1);
        LearningPathResponse response = responses.get(0);
        assertThat(response.getNoCoursesAvailable()).isTrue();
        assertThat(response.getSteps()).isEmpty();
        assertThat(response.getTotalEstimatedHours()).isEqualTo(0);
        assertThat(response.getEstimatedCalendarTime()).isEqualTo("N/A");
    }

    @Test
    @DisplayName("Completing every step completes the path but does not move proficiency or gaps")
    void testCompleteStepManually_PathCompletion() {
        LearningPath path = LearningPath.builder()
                .id(50L)
                .employee(sampleUser)
                .targetSkill(javaSkill)
                .title("Java Learning Path")
                .status("IN_PROGRESS")
                .overallProgressPercent(50)
                .totalEstimatedHours(10)
                .noCoursesAvailable(false)
                .build();

        LearningPathStep step1 = LearningPathStep.builder()
                .id(201L)
                .learningPath(path)
                .stepOrder(1)
                .difficultyStage("INTERMEDIATE")
                .estimatedHours(5)
                .status("COMPLETED")
                .build();

        LearningPathStep step2 = LearningPathStep.builder()
                .id(202L)
                .learningPath(path)
                .stepOrder(2)
                .difficultyStage("ADVANCED")
                .estimatedHours(5)
                .status("NOT_STARTED")
                .build();

        path.setSteps(List.of(step1, step2));

        when(learningPathStepRepository.findById(202L)).thenReturn(Optional.of(step2));
        when(learningPathStepRepository.save(any(LearningPathStep.class))).thenAnswer(inv -> inv.getArgument(0));
        when(learningPathRepository.save(any(LearningPath.class))).thenAnswer(inv -> inv.getArgument(0));

        LearningPathResponse response = learningPathService.completeStepManually(202L);

        assertThat(step2.getStatus()).isEqualTo("COMPLETED");
        assertThat(response.getOverallProgressPercent()).isEqualTo(100);
        assertThat(response.getStatus()).isEqualTo("COMPLETED");

        // Finishing a learning path is not evidence of ability, so it must not raise the
        // employee's proficiency or recalculate their gaps. Only an assessment does that.
        verify(gapAnalysisService, never()).calculateAndFetchUserGaps(100L);
    }
}
