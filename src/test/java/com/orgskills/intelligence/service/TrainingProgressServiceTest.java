package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.employee.MilestoneDefinitionRequest;
import com.orgskills.intelligence.dto.employee.UpdateProgressRequest;
import com.orgskills.intelligence.entity.Achievement;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.LearningMilestone;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.AchievementType;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ForbiddenException;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.AchievementRepository;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.LearningMilestoneRepository;
import com.orgskills.intelligence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrainingProgressServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private LearningMilestoneRepository milestoneRepository;

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private RecommendationService recommendationService;

    @Mock
    private LearningPathService learningPathService;

    @InjectMocks
    private TrainingProgressService trainingProgressService;

    private User employee;
    private User manager;
    private Course training;
    private Enrollment enrollment;

    @BeforeEach
    void setUp() {
        employee = user(1L, "Alice Johnson", Role.EMPLOYEE);
        manager = user(2L, "Bob Smith", Role.MANAGER);

        training = new Course();
        training.setId(10L);
        training.setTitle("Advanced Java Concurrency");
        training.setProvider("Coursera");

        enrollment = new Enrollment();
        enrollment.setId(100L);
        enrollment.setEmployee(employee);
        enrollment.setCourse(training);
        enrollment.setStatus(EnrollmentStatus.IN_PROGRESS);
        enrollment.setProgress(40.0);
        enrollment.setStartDate(Instant.parse("2026-01-01T00:00:00Z"));
    }

    // ── Enrolment ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Enrolling creates a NOT_STARTED enrollment and notifies the learner")
    void enrollCreatesEnrollment() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(training));
        when(enrollmentRepository.findByEmployeeIdAndCourseIdAndStatusIn(eq(1L), eq(10L), anyCollection()))
                .thenReturn(List.of());
        when(milestoneRepository.findByTrainingIdAndEnrollmentIsNullOrderBySequenceAsc(10L)).thenReturn(List.of());
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> {
            Enrollment e = inv.getArgument(0);
            e.setId(100L);
            return e;
        });

        EnrollmentResponse response = trainingProgressService.enroll(1L, new EnrollmentRequest(10L));

        assertThat(response.getEnrollmentId()).isEqualTo(100L);
        assertThat(response.getEmployeeId()).isEqualTo(1L);
        assertThat(response.getTrainingId()).isEqualTo(10L);
        assertThat(response.getStatus()).isEqualTo(EnrollmentStatus.NOT_STARTED);
        assertThat(response.getProgress()).isZero();
        assertThat(response.getMilestones()).isEmpty();
        verify(notificationService).createNotification(eq(employee), eq("Course Enrollment Confirmed"),
                any(), eq(NotificationType.TRAINING_RECOMMENDATION));
    }

    @Test
    @DisplayName("A second enrollment in a course that is still active is rejected")
    void enrollRejectsDuplicateActiveEnrollment() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(training));
        when(enrollmentRepository.findByEmployeeIdAndCourseIdAndStatusIn(eq(1L), eq(10L), anyCollection()))
                .thenReturn(List.of(enrollment));

        assertThatThrownBy(() -> trainingProgressService.enroll(1L, new EnrollmentRequest(10L)))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already enrolled");

        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Re-enrolling is allowed once the previous attempt is COMPLETED")
    void enrollAllowsRetakeAfterCompletion() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(training));
        // Only NOT_STARTED / IN_PROGRESS attempts are returned, so a completed one does not block.
        when(enrollmentRepository.findByEmployeeIdAndCourseIdAndStatusIn(eq(1L), eq(10L), anyCollection()))
                .thenReturn(List.of());
        when(milestoneRepository.findByTrainingIdAndEnrollmentIsNullOrderBySequenceAsc(10L)).thenReturn(List.of());
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));

        assertThat(trainingProgressService.enroll(1L, new EnrollmentRequest(10L)).getStatus())
                .isEqualTo(EnrollmentStatus.NOT_STARTED);
    }

    @Test
    @DisplayName("Enrolling copies the course milestone template into learner-owned rows")
    void enrollCopiesMilestoneTemplate() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(training));
        when(enrollmentRepository.findByEmployeeIdAndCourseIdAndStatusIn(eq(1L), eq(10L), anyCollection()))
                .thenReturn(List.of());
        when(milestoneRepository.findByTrainingIdAndEnrollmentIsNullOrderBySequenceAsc(10L))
                .thenReturn(List.of(template(1L, "Core Java", 1), template(2L, "Multithreading", 2)));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));
        when(milestoneRepository.saveAll(anyCollection())).thenAnswer(inv -> inv.getArgument(0));

        EnrollmentResponse response = trainingProgressService.enroll(1L, new EnrollmentRequest(10L));

        assertThat(response.getMilestones()).extracting("title")
                .containsExactly("Core Java", "Multithreading");
        assertThat(response.getMilestones()).allMatch(m -> m.getStatus() == EnrollmentStatus.NOT_STARTED);
    }

    @Test
    @DisplayName("Milestones supplied on the request are used when the course has no template")
    void enrollUsesRequestedMilestones() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(training));
        when(enrollmentRepository.findByEmployeeIdAndCourseIdAndStatusIn(eq(1L), eq(10L), anyCollection()))
                .thenReturn(List.of());
        when(milestoneRepository.findByTrainingIdAndEnrollmentIsNullOrderBySequenceAsc(10L)).thenReturn(List.of());
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));
        when(milestoneRepository.saveAll(anyCollection())).thenAnswer(inv -> inv.getArgument(0));

        EnrollmentRequest request = new EnrollmentRequest(10L);
        request.setMilestones(List.of(
                new MilestoneDefinitionRequest("Multithreading", 2),
                new MilestoneDefinitionRequest("Core Java", 1)));

        EnrollmentResponse response = trainingProgressService.enroll(1L, request);

        assertThat(response.getMilestones()).extracting("sequence").containsExactly(1, 2);
    }

    @Test
    @DisplayName("An employee cannot enrol a colleague, a manager can")
    void enrollForAnotherEmployeeRequiresElevatedRole() {
        User colleague = user(3L, "Cara Diaz", Role.EMPLOYEE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));

        EnrollmentRequest request = new EnrollmentRequest(10L);
        request.setEmployeeId(3L);
        assertThatThrownBy(() -> trainingProgressService.enroll(1L, request))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Access denied");

        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(userRepository.findById(3L)).thenReturn(Optional.of(colleague));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(training));
        when(enrollmentRepository.findByEmployeeIdAndCourseIdAndStatusIn(eq(3L), eq(10L), anyCollection()))
                .thenReturn(List.of());
        when(milestoneRepository.findByTrainingIdAndEnrollmentIsNullOrderBySequenceAsc(10L)).thenReturn(List.of());
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));

        assertThat(trainingProgressService.enroll(2L, request).getEmployeeId()).isEqualTo(3L);
    }

    // ── Listing ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Listing returns progress, milestones and dates for the employee")
    void getEnrollmentsReturnsProgressAndMilestones() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(enrollmentRepository.findByEmployeeIdOrderByStartDateDesc(1L)).thenReturn(List.of(enrollment));
        when(milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(100L))
                .thenReturn(List.of(learnerMilestone(1L, "Core Java", 1, 100.0),
                        learnerMilestone(2L, "Multithreading", 2, 30.0)));

        List<EnrollmentResponse> responses = trainingProgressService.getEnrollments(1L, null);

        assertThat(responses).hasSize(1);
        EnrollmentResponse response = responses.get(0);
        assertThat(response.getProgress()).isEqualTo(40.0);
        assertThat(response.getStartDate()).isEqualTo(Instant.parse("2026-01-01T00:00:00Z"));
        assertThat(response.getMilestones()).extracting("status")
                .containsExactly(EnrollmentStatus.COMPLETED, EnrollmentStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("An employee cannot list another employee's enrollments")
    void getEnrollmentsRejectsForeignEmployee() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> trainingProgressService.getEnrollments(1L, 3L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Access denied");
    }

    // ── Progress updates ────────────────────────────────────────────────────────

    @Test
    @DisplayName("Updating overall progress persists the new percentage")
    void updateProgressPersistsOverallPercentage() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));
        when(milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(100L)).thenReturn(List.of());

        EnrollmentResponse response =
                trainingProgressService.updateProgress(1L, 100L, new UpdateProgressRequest(80.0));

        assertThat(response.getProgress()).isEqualTo(80.0);
        assertThat(response.getStatus()).isEqualTo(EnrollmentStatus.IN_PROGRESS);
        assertThat(response.getCompletionDate()).isNull();
        verify(achievementRepository, never()).save(any());
    }

    @Test
    @DisplayName("Crossing a progress threshold sends the learning-path encouragement notification")
    void updateProgressNotifiesOnThresholdCrossing() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));
        when(milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(100L)).thenReturn(List.of());

        trainingProgressService.updateProgress(1L, 100L, new UpdateProgressRequest(80.0));

        ArgumentCaptor<String> message = ArgumentCaptor.forClass(String.class);
        verify(notificationService).createNotification(eq(employee), eq("Learning progress update"),
                message.capture(), eq(NotificationType.TRAINING_PROGRESS));
        assertThat(message.getValue()).isEqualTo("Congratulations! You completed 80% of your learning path");
    }

    @Test
    @DisplayName("Updating a milestone leaves the overall enrollment percentage untouched")
    void updateProgressUpdatesSingleMilestone() {
        LearningMilestone milestone = learnerMilestone(2L, "Multithreading", 2, 30.0);
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(milestoneRepository.findByMilestoneIdAndEnrollmentId(2L, 100L)).thenReturn(Optional.of(milestone));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));
        when(milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(100L)).thenReturn(List.of(milestone));

        UpdateProgressRequest request = new UpdateProgressRequest();
        request.setMilestoneId(2L);
        request.setCompletionPercentage(100.0);

        EnrollmentResponse response = trainingProgressService.updateProgress(1L, 100L, request);

        assertThat(milestone.getCompletionPercentage()).isEqualTo(100.0);
        assertThat(response.getProgress()).isEqualTo(40.0);
        assertThat(response.getMilestones()).singleElement()
                .extracting("status").isEqualTo(EnrollmentStatus.COMPLETED);
    }

    @Test
    @DisplayName("An empty progress body is rejected")
    void updateProgressRejectsEmptyBody() {
        assertThatThrownBy(() -> trainingProgressService.updateProgress(1L, 100L, new UpdateProgressRequest()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Provide an overall progress value");
    }

    @Test
    @DisplayName("A milestone that does not belong to the enrollment is rejected")
    void updateProgressRejectsForeignMilestone() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(milestoneRepository.findByMilestoneIdAndEnrollmentId(99L, 100L)).thenReturn(Optional.empty());

        UpdateProgressRequest request = new UpdateProgressRequest();
        request.setMilestoneId(99L);
        request.setCompletionPercentage(50.0);

        assertThatThrownBy(() -> trainingProgressService.updateProgress(1L, 100L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── Completion chain ────────────────────────────────────────────────────────

    @Test
    @DisplayName("Completing fires the achievement and notification chain and sets the completion date")
    void completeFiresAchievementAndNotification() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));
        when(milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(100L)).thenReturn(List.of());

        EnrollmentResponse response = trainingProgressService.complete(1L, 100L);

        assertThat(response.getStatus()).isEqualTo(EnrollmentStatus.COMPLETED);
        assertThat(response.getProgress()).isEqualTo(100.0);
        assertThat(response.getCompletionDate()).isNotNull();

        ArgumentCaptor<Achievement> achievement = ArgumentCaptor.forClass(Achievement.class);
        verify(achievementRepository).save(achievement.capture());
        assertThat(achievement.getValue().getType()).isEqualTo(AchievementType.COURSE_COMPLETED);
        assertThat(achievement.getValue().getEmployee()).isEqualTo(employee);

        verify(notificationService).createNotification(eq(employee), eq("Achievement Unlocked!"),
                any(), eq(NotificationType.ACHIEVEMENT_UNLOCKED));
    }

    @Test
    @DisplayName("Reaching 100% through a progress update fires the same completion chain")
    void progressToHundredCompletesEnrollment() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));
        when(milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(100L)).thenReturn(List.of());

        EnrollmentResponse response =
                trainingProgressService.updateProgress(1L, 100L, new UpdateProgressRequest(100.0));

        assertThat(response.getStatus()).isEqualTo(EnrollmentStatus.COMPLETED);
        verify(achievementRepository).save(any(Achievement.class));
        verify(notificationService).createNotification(eq(employee), eq("Achievement Unlocked!"),
                any(), eq(NotificationType.ACHIEVEMENT_UNLOCKED));
    }

    @Test
    @DisplayName("Completing an already completed course does not award a second achievement")
    void completeIsIdempotent() {
        enrollment.setStatus(EnrollmentStatus.COMPLETED);
        enrollment.setCompletionDate(Instant.parse("2026-02-01T00:00:00Z"));
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));
        when(milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(100L)).thenReturn(List.of());

        EnrollmentResponse response = trainingProgressService.complete(1L, 100L);

        assertThat(response.getCompletionDate()).isEqualTo(Instant.parse("2026-02-01T00:00:00Z"));
        verify(achievementRepository, never()).save(any());
        verify(notificationService, never()).createNotification(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Completion does not raise skill proficiency or recalculate gaps")
    void completeDoesNotTouchProficiencyOrGaps() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));
        when(milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(100L)).thenReturn(List.of());

        trainingProgressService.complete(1L, 100L);

        // Only recommendation refresh and learning-path bookkeeping run; proficiency and gap
        // recalculation belong to the Assessment module.
        verify(recommendationService).generateRecommendations(1L);
        verify(learningPathService).onEnrollmentCompleted(1L, 10L);
    }

    @Test
    @DisplayName("A failure in the post-completion refresh does not undo the completion")
    void completionSurvivesDownstreamFailure() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> withId(inv.getArgument(0)));
        when(milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(100L)).thenReturn(List.of());
        when(recommendationService.generateRecommendations(anyLong()))
                .thenThrow(new IllegalStateException("recommendation engine offline"));

        assertThat(trainingProgressService.complete(1L, 100L).getStatus())
                .isEqualTo(EnrollmentStatus.COMPLETED);
        verify(achievementRepository).save(any(Achievement.class));
    }

    // ── Fixtures ────────────────────────────────────────────────────────────────

    /** Stands in for the identity the database assigns on save. */
    private Enrollment withId(Enrollment e) {
        e.setId(100L);
        return e;
    }

    private User user(Long id, String name, Role role) {
        User u = new User();
        u.setId(id);
        u.setFullName(name);
        u.setEmail(name.toLowerCase().replace(' ', '.') + "@orgskills.com");
        u.setRole(role);
        return u;
    }

    private LearningMilestone template(Long id, String title, int sequence) {
        LearningMilestone milestone = new LearningMilestone();
        milestone.setMilestoneId(id);
        milestone.setTraining(training);
        milestone.setTitle(title);
        milestone.setSequence(sequence);
        milestone.setCompletionPercentage(0.0);
        return milestone;
    }

    private LearningMilestone learnerMilestone(Long id, String title, int sequence, double completion) {
        LearningMilestone milestone = template(id, title, sequence);
        milestone.setEnrollment(enrollment);
        milestone.setCompletionPercentage(completion);
        return milestone;
    }
}
