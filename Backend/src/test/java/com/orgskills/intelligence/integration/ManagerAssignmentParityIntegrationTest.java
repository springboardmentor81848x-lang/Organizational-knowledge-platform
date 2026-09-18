package com.orgskills.intelligence.integration;

import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.LearningMilestone;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.LearningMilestoneRepository;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import com.orgskills.intelligence.service.ManagerService;
import com.orgskills.intelligence.service.TrainingProgressService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * A manager assigning training or a mentor is the same act as an employee starting one, and must
 * land in the same state. These previously built the rows by hand and skipped the rules the
 * self-service routes enforce.
 */
@SpringBootTest
@Transactional
class ManagerAssignmentParityIntegrationTest {

    private static final String DEPARTMENT = "Assignment Department";
    private static final String JOB_TITLE = "Assignment Engineer";

    @Autowired
    private ManagerService managerService;

    @Autowired
    private TrainingProgressService trainingProgressService;

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

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LearningMilestoneRepository milestoneRepository;

    @Autowired
    private MentorshipMatchRepository mentorshipMatchRepository;

    private User employee;
    private User manager;
    private User mentor;
    private User novice;
    private Skill scala;
    private Course scalaCourse;

    @BeforeEach
    void setUp() {
        scala = skillRepository.save(skill("Scala (assignment test)"));

        manager = userRepository.save(person("assign.manager@orgskills.com", "Assign Manager", Role.MANAGER));
        employee = userRepository.save(person("assign.employee@orgskills.com", "Assign Employee", Role.EMPLOYEE));
        mentor = userRepository.save(person("assign.mentor@orgskills.com", "Assign Mentor", Role.EMPLOYEE));
        novice = userRepository.save(person("assign.novice@orgskills.com", "Assign Novice", Role.EMPLOYEE));

        RoleCompetency competency = new RoleCompetency();
        competency.setJobTitle(JOB_TITLE);
        competency.setDepartment(DEPARTMENT);
        competency.setSkill(scala);
        competency.setRequiredProficiencyLevel(ProficiencyLevel.EXPERT);
        roleCompetencyRepository.save(competency);

        userSkillRepository.save(userSkill(employee, ProficiencyLevel.INTERMEDIATE));
        userSkillRepository.save(userSkill(mentor, ProficiencyLevel.EXPERT));
        userSkillRepository.save(userSkill(novice, ProficiencyLevel.BEGINNER));

        Course course = new Course();
        course.setTitle("Scala Foundations (assignment test)");
        course.setProvider("Internal Academy");
        course.setSkillCovered(scala);
        course.setDifficulty("INTERMEDIATE");
        course.setDurationHours(9.0);
        course.setIsInternal(true);
        scalaCourse = courseRepository.save(course);

        // A course-level milestone template, which a self-service enrolment copies for the learner.
        milestoneRepository.save(templateMilestone("Language basics", 1));
        milestoneRepository.save(templateMilestone("Functional patterns", 2));
    }

    @Test
    @DisplayName("Assigned training gets the milestone breakdown a self-service enrolment gets")
    void assignedTrainingCopiesTheMilestoneTemplate() {
        EnrollmentResponse assigned =
                managerService.assignTraining(manager.getId(), employee.getId(), scalaCourse.getId());

        assertThat(assigned.getMilestones())
                .as("an assigned course must be as navigable as one the employee picked")
                .extracting("title")
                .containsExactly("Language basics", "Functional patterns");
    }

    @Test
    @DisplayName("Re-assigning a course somebody already completed does not reopen the finished record")
    void reassigningDoesNotCorruptACompletedEnrollment() {
        EnrollmentResponse enrollment = trainingProgressService.enroll(
                employee.getId(), new EnrollmentRequest(scalaCourse.getId()));
        trainingProgressService.complete(employee.getId(), enrollment.getEnrollmentId());

        managerService.assignTraining(manager.getId(), employee.getId(), scalaCourse.getId());

        // The completed attempt must stay completed and keep its completion date; a re-assignment
        // is a fresh attempt, not an edit of the old one.
        var finished = enrollmentRepository.findById(enrollment.getEnrollmentId()).orElseThrow();
        assertThat(finished.getStatus()).isEqualTo(EnrollmentStatus.COMPLETED);
        assertThat(finished.getCompletionDate()).isNotNull();
        assertThat(finished.getProgress()).isEqualTo(100.0);

        assertThat(enrollmentRepository.findByEmployeeId(employee.getId()))
                .as("the re-assignment should be a second attempt")
                .hasSize(2);
    }

    @Test
    @DisplayName("Assigning a course the employee is already working through is refused")
    void reassigningAnActiveCourseIsRefused() {
        trainingProgressService.enroll(employee.getId(), new EnrollmentRequest(scalaCourse.getId()));

        assertThatThrownBy(() ->
                managerService.assignTraining(manager.getId(), employee.getId(), scalaCourse.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already enrolled");
    }

    @Test
    @DisplayName("An assigned mentorship applies the mentor-qualification rule")
    void assignedMentorshipRefusesAnUnqualifiedMentor() {
        assertThatThrownBy(() -> managerService.assignMentorship(
                manager.getId(), employee.getId(), novice.getId(), scala.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("not above the mentee level");
    }

    @Test
    @DisplayName("An assigned mentorship starts ACTIVE with a start date and no duplicates")
    void assignedMentorshipIsActiveAndUnique() {
        var assigned = managerService.assignMentorship(
                manager.getId(), employee.getId(), mentor.getId(), scala.getId());

        assertThat(assigned.getStatus()).isEqualTo(MentorshipStatus.ACTIVE);
        assertThat(assigned.getStartDate()).isNotNull();

        assertThatThrownBy(() -> managerService.assignMentorship(
                manager.getId(), employee.getId(), mentor.getId(), scala.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("ACTIVE mentorship already exists");

        assertThat(mentorshipMatchRepository.findByMenteeIdInAndStatus(
                List.of(employee.getId()), MentorshipStatus.ACTIVE)).hasSize(1);
    }

    // ── Fixtures ────────────────────────────────────────────────────────────────

    private LearningMilestone templateMilestone(String title, int sequence) {
        LearningMilestone milestone = new LearningMilestone();
        milestone.setTraining(scalaCourse);
        milestone.setEnrollment(null);
        milestone.setTitle(title);
        milestone.setSequence(sequence);
        milestone.setCompletionPercentage(0.0);
        return milestone;
    }

    private Skill skill(String name) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCategory("Backend");
        return skill;
    }

    private UserSkill userSkill(User user, ProficiencyLevel level) {
        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(scala);
        userSkill.setProficiencyLevel(level);
        userSkill.setRatingScore((double) level.getScore());
        return userSkill;
    }

    private User person(String email, String fullName, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword("not-used-in-this-test");
        user.setRole(role);
        user.setActive(true);
        user.setDepartment(DEPARTMENT);
        user.setJobTitle(JOB_TITLE);
        return user;
    }
}
