package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.ld.CourseRequest;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.repository.CertificationRepository;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.LearningPathRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.util.DifficultyNormalizer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Difficulty is what places a course into a learning path's beginner/intermediate/advanced
 * ladder, and {@code LearningPathService} drops any course whose difficulty is null. A course
 * added through the catalogue screens used to be saved exactly as typed, so leaving the field
 * blank produced a course that covered a skill, appeared in the catalogue, and yet was invisible
 * to every learner's path — while the path claimed no course covered the skill at all.
 */
@ExtendWith(MockitoExtension.class)
class LndAdminCourseDifficultyTest {

    @Mock private CourseRepository courseRepository;
    @Mock private SkillRepository skillRepository;
    @Mock private LearningPathRepository learningPathRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private CertificationRepository certificationRepository;
    @Mock private NotificationService notificationService;
    @Mock private AuditLogService auditLogService;
    @Mock private HrIntelligenceService hrIntelligenceService;

    private LndAdminService lndAdminService;
    private Skill communication;

    @BeforeEach
    void setUp() {
        // The normaliser is a pure function; mocking it would test nothing.
        lndAdminService = new LndAdminService(
                courseRepository,
                skillRepository,
                learningPathRepository,
                enrollmentRepository,
                certificationRepository,
                notificationService,
                auditLogService,
                hrIntelligenceService,
                new DifficultyNormalizer());

        communication = new Skill();
        communication.setId(8L);
        communication.setName("Communication");

        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> {
            Course course = invocation.getArgument(0);
            if (course.getId() == null) {
                course.setId(99L);
            }
            return course;
        });
    }

    @Test
    @DisplayName("A course created with no difficulty is still placeable in a learning path")
    void createFillsInAMissingDifficulty() {
        when(skillRepository.findById(8L)).thenReturn(Optional.of(communication));

        lndAdminService.createCourse(1L, request(null));

        assertThat(savedCourse().getDifficulty()).isEqualTo("INTERMEDIATE");
    }

    @Test
    @DisplayName("A described difficulty is normalised to the stage vocabulary paths group by")
    void createNormalisesAFreeTextDifficulty() {
        when(skillRepository.findById(8L)).thenReturn(Optional.of(communication));

        lndAdminService.createCourse(1L, request("Absolute beginners"));

        assertThat(savedCourse().getDifficulty()).isEqualTo("BEGINNER");
    }

    @Test
    @DisplayName("Editing a course cannot blank out its difficulty either")
    void updateFillsInAMissingDifficulty() {
        Course existing = new Course();
        existing.setId(12L);
        existing.setTitle("Writing Well");
        existing.setDifficulty("BEGINNER");
        when(courseRepository.findById(12L)).thenReturn(Optional.of(existing));
        when(skillRepository.findById(8L)).thenReturn(Optional.of(communication));

        lndAdminService.updateCourse(1L, 12L, request(null));

        assertThat(savedCourse().getDifficulty()).isEqualTo("INTERMEDIATE");
    }

    private CourseRequest request(String difficulty) {
        CourseRequest request = new CourseRequest();
        request.setTitle("Communication Clinic");
        request.setDescription("A practical session on being understood.");
        request.setProvider("Internal Academy");
        request.setSkillId(8L);
        request.setDifficulty(difficulty);
        request.setDurationHours(5.0);
        request.setIsInternal(true);
        return request;
    }

    private Course savedCourse() {
        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        org.mockito.Mockito.verify(courseRepository).save(captor.capture());
        return captor.getValue();
    }
}
