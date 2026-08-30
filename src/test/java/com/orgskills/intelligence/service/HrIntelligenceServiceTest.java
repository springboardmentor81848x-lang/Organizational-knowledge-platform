package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.hr.TrainingEffectivenessResponse;
import com.orgskills.intelligence.entity.Assessment;
import com.orgskills.intelligence.entity.AssessmentResult;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.AssessmentResultRepository;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.GapSnapshotRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.when;

/**
 * Training effectiveness must be measured, never assumed.
 *
 * <p>These cases exist because the method they cover used to return a fixed 2.0 before and 3.25
 * after for every course in the catalogue, including courses with no enrolments at all. Each test
 * below fails against that implementation.
 */
@ExtendWith(MockitoExtension.class)
class HrIntelligenceServiceTest {

    private static final Instant FINISHED_AT = Instant.parse("2026-03-01T00:00:00Z");

    @Mock
    private UserRepository userRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private UserSkillRepository userSkillRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private GapSnapshotRepository gapSnapshotRepository;

    @Mock
    private AssessmentResultRepository assessmentResultRepository;

    @Mock
    private ManagerService managerService;

    @Mock
    private HeatmapVisualizationService heatmapVisualizationService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private HrIntelligenceService hrIntelligenceService;

    private Skill springBoot;
    private Course course;
    private User learner;

    @BeforeEach
    void setUp() {
        springBoot = new Skill();
        springBoot.setId(2L);
        springBoot.setName("Spring Boot");

        course = new Course();
        course.setId(10L);
        course.setTitle("Mastering Spring Boot");
        course.setProvider("Internal Academy");
        course.setSkillCovered(springBoot);

        learner = new User();
        learner.setId(1L);
        learner.setFullName("Alice Johnson");
        learner.setRole(Role.EMPLOYEE);
    }

    @Test
    @DisplayName("A course nobody has finished reports no before or after, rather than a baseline")
    void unfinishedCourseReportsNothing() {
        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(enrollmentRepository.findByCourseId(10L))
                .thenReturn(List.of(enrollment(EnrollmentStatus.IN_PROGRESS, null)));

        TrainingEffectivenessResponse result = only();

        assertThat(result.getEnrolledCount()).isEqualTo(1);
        assertThat(result.getCompletedCount()).isZero();
        assertThat(result.getCompletionRatePercent()).isZero();
        assertThat(result.getMeasuredCount()).isZero();
        assertThat(result.getAvgPreCourseSkillLevel()).isNull();
        assertThat(result.getAvgPostCourseSkillLevel()).isNull();
        assertThat(result.getAvgSkillImprovement()).isNull();
    }

    @Test
    @DisplayName("A course nobody has enrolled in claims nothing at all")
    void emptyCourseClaimsNothing() {
        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(enrollmentRepository.findByCourseId(10L)).thenReturn(List.of());

        TrainingEffectivenessResponse result = only();

        assertThat(result.getEnrolledCount()).isZero();
        assertThat(result.getMeasuredCount()).isZero();
        assertThat(result.getAvgPreCourseSkillLevel()).isNull();
        assertThat(result.getAvgSkillImprovement()).isNull();
    }

    @Test
    @DisplayName("The before and after come from the assessment taken after the course finished")
    void measuresMovementFromTheAssessmentAfterCompletion() {
        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(enrollmentRepository.findByCourseId(10L))
                .thenReturn(List.of(enrollment(EnrollmentStatus.COMPLETED, FINISHED_AT)));
        when(assessmentResultRepository.findSubmittedResultsForEmployees(anyCollection()))
                .thenReturn(List.of(result(
                        FINISHED_AT.plusSeconds(86_400),
                        springBoot,
                        ProficiencyLevel.BEGINNER,
                        ProficiencyLevel.ADVANCED)));

        TrainingEffectivenessResponse result = only();

        assertThat(result.getCompletedCount()).isEqualTo(1);
        assertThat(result.getCompletionRatePercent()).isEqualTo(100.0);
        assertThat(result.getMeasuredCount()).isEqualTo(1);
        assertThat(result.getAvgPreCourseSkillLevel()).isEqualTo(1.0);
        assertThat(result.getAvgPostCourseSkillLevel()).isEqualTo(3.0);
        assertThat(result.getAvgSkillImprovement()).isEqualTo(2.0);
    }

    @Test
    @DisplayName("An assessment taken before the course finished is not credited to it")
    void ignoresAssessmentsPredatingCompletion() {
        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(enrollmentRepository.findByCourseId(10L))
                .thenReturn(List.of(enrollment(EnrollmentStatus.COMPLETED, FINISHED_AT)));
        when(assessmentResultRepository.findSubmittedResultsForEmployees(anyCollection()))
                .thenReturn(List.of(result(
                        FINISHED_AT.minusSeconds(86_400),
                        springBoot,
                        ProficiencyLevel.BEGINNER,
                        ProficiencyLevel.EXPERT)));

        TrainingEffectivenessResponse result = only();

        assertThat(result.getCompletedCount()).isEqualTo(1);
        assertThat(result.getMeasuredCount()).isZero();
        assertThat(result.getAvgSkillImprovement()).isNull();
    }

    @Test
    @DisplayName("An assessment of a different skill is not credited to the course")
    void ignoresAssessmentsOfAnotherSkill() {
        Skill unrelated = new Skill();
        unrelated.setId(99L);
        unrelated.setName("Leadership");

        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(enrollmentRepository.findByCourseId(10L))
                .thenReturn(List.of(enrollment(EnrollmentStatus.COMPLETED, FINISHED_AT)));
        when(assessmentResultRepository.findSubmittedResultsForEmployees(anyCollection()))
                .thenReturn(List.of(result(
                        FINISHED_AT.plusSeconds(86_400),
                        unrelated,
                        ProficiencyLevel.BEGINNER,
                        ProficiencyLevel.EXPERT)));

        assertThat(only().getMeasuredCount()).isZero();
    }

    @Test
    @DisplayName("A certified enrolment counts as finished, the same as a completed one")
    void certifiedCountsAsFinished() {
        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(enrollmentRepository.findByCourseId(10L))
                .thenReturn(List.of(enrollment(EnrollmentStatus.CERTIFIED, FINISHED_AT)));
        when(assessmentResultRepository.findSubmittedResultsForEmployees(anyCollection()))
                .thenReturn(List.of());

        TrainingEffectivenessResponse result = only();

        assertThat(result.getCompletedCount()).isEqualTo(1);
        assertThat(result.getCompletionRatePercent()).isEqualTo(100.0);
    }

    @Test
    @DisplayName("A course mapped to no skill can never be measured, however many finish it")
    void courseWithoutASkillIsNeverMeasured() {
        course.setSkillCovered(null);
        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(enrollmentRepository.findByCourseId(10L))
                .thenReturn(List.of(enrollment(EnrollmentStatus.COMPLETED, FINISHED_AT)));

        TrainingEffectivenessResponse result = only();

        assertThat(result.getSkillName()).isNull();
        assertThat(result.getCompletedCount()).isEqualTo(1);
        assertThat(result.getMeasuredCount()).isZero();
        assertThat(result.getAvgSkillImprovement()).isNull();
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private TrainingEffectivenessResponse only() {
        List<TrainingEffectivenessResponse> all = hrIntelligenceService.getTrainingEffectiveness();
        assertThat(all).hasSize(1);
        return all.get(0);
    }

    private Enrollment enrollment(EnrollmentStatus status, Instant completionDate) {
        Enrollment enrollment = new Enrollment();
        enrollment.setId(100L);
        enrollment.setEmployee(learner);
        enrollment.setCourse(course);
        enrollment.setStatus(status);
        enrollment.setCompletionDate(completionDate);
        return enrollment;
    }

    private AssessmentResult result(Instant date, Skill skill,
                                    ProficiencyLevel before, ProficiencyLevel after) {
        Assessment assessment = new Assessment();
        assessment.setId(500L);
        assessment.setEmployee(learner);
        assessment.setAssessmentType(AssessmentType.SELF);
        assessment.setStatus(AssessmentStatus.COMPLETED);
        assessment.setDate(date);

        AssessmentResult result = new AssessmentResult();
        result.setAssessment(assessment);
        result.setSkill(skill);
        result.setPreviousProficiency(before);
        result.setProficiency(after);
        result.setImprovement(after.getScore() - before.getScore());
        return result;
    }
}
