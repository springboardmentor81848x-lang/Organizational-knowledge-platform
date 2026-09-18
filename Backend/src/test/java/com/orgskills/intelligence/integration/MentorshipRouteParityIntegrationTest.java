package com.orgskills.intelligence.integration;

import com.orgskills.intelligence.dto.mentorship.MentorshipMatchRequest;
import com.orgskills.intelligence.dto.mentorship.MentorshipRequest;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import com.orgskills.intelligence.service.EmployeeService;
import com.orgskills.intelligence.service.MentorshipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The self-service mentorship endpoints under {@code /api/employee} and the mentorship module
 * under {@code /api/mentorships} are two doors onto the same action. They previously ran separate
 * implementations, and the employee door skipped every guard the other enforced, so which door a
 * demo happened to use decided whether the rules applied.
 *
 * <p>These tests pin the parity: the same rules now hold whichever route is taken.
 */
@SpringBootTest
@Transactional
class MentorshipRouteParityIntegrationTest {

    private static final String DEPARTMENT = "Parity Department";
    private static final String JOB_TITLE = "Parity Engineer";

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private MentorshipService mentorshipService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private RoleCompetencyRepository roleCompetencyRepository;

    @Autowired
    private GapAnalysisRepository gapAnalysisRepository;

    private User employee;
    private User mentor;
    private User novice;
    private Skill rust;

    @BeforeEach
    void setUp() {
        rust = skillRepository.save(skill("Rust (parity test)"));

        employee = userRepository.save(person("parity.employee@orgskills.com", "Parity Employee"));
        mentor = userRepository.save(person("parity.mentor@orgskills.com", "Parity Mentor"));
        novice = userRepository.save(person("parity.novice@orgskills.com", "Parity Novice"));

        RoleCompetency competency = new RoleCompetency();
        competency.setJobTitle(JOB_TITLE);
        competency.setDepartment(DEPARTMENT);
        competency.setSkill(rust);
        competency.setRequiredProficiencyLevel(ProficiencyLevel.EXPERT);
        roleCompetencyRepository.save(competency);

        userSkillRepository.save(userSkill(employee, ProficiencyLevel.INTERMEDIATE));
        userSkillRepository.save(userSkill(mentor, ProficiencyLevel.EXPERT));
        userSkillRepository.save(userSkill(novice, ProficiencyLevel.BEGINNER));
    }

    @Test
    @DisplayName("The employee route now refuses a mentor who is not above the mentee")
    void employeeRouteRefusesAnUnqualifiedMentor() {
        assertThatThrownBy(() -> employeeService.requestMentorship(employee.getId(), novice.getId(), rust.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("not above the mentee level");
    }

    @Test
    @DisplayName("The employee route now refuses a second ACTIVE mentorship for the same skill")
    void employeeRouteRefusesADuplicateActiveMentorship() {
        MentorshipRequest request = new MentorshipRequest();
        request.setMenteeId(employee.getId());
        request.setMentorId(mentor.getId());
        request.setSkillId(rust.getId());
        MentorshipResponse first = mentorshipService.requestMentorship(request);
        mentorshipService.acceptMentorship(first.getMentorshipId(), mentor.getId());

        assertThatThrownBy(() -> employeeService.requestMentorship(employee.getId(), mentor.getId(), rust.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("ACTIVE mentorship already exists");
    }

    @Test
    @DisplayName("The employee route now refuses to accept a mentorship that is not pending")
    void employeeRouteRefusesToReAcceptARejectedMentorship() {
        MentorshipRequest request = new MentorshipRequest();
        request.setMenteeId(employee.getId());
        request.setMentorId(mentor.getId());
        request.setSkillId(rust.getId());
        MentorshipResponse requested = mentorshipService.requestMentorship(request);
        mentorshipService.rejectMentorship(requested.getMentorshipId(), mentor.getId());

        assertThatThrownBy(() ->
                employeeService.acceptMentorship(mentor.getId(), requested.getMentorshipId()))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    @DisplayName("Accepting through the employee route sets the start date, as the other route does")
    void employeeRouteAcceptSetsStartDate() {
        MentorshipRequest request = new MentorshipRequest();
        request.setMenteeId(employee.getId());
        request.setMentorId(mentor.getId());
        request.setSkillId(rust.getId());
        MentorshipResponse requested = mentorshipService.requestMentorship(request);

        MentorshipResponse accepted =
                employeeService.acceptMentorship(mentor.getId(), requested.getMentorshipId());

        assertThat(accepted.getStatus()).isEqualTo(MentorshipStatus.ACTIVE);
        assertThat(accepted.getStartDate())
                .as("the start date must be filled in whichever route accepts")
                .isNotNull();
    }

    @Test
    @DisplayName("Completing through the employee route requires an ACTIVE mentorship")
    void employeeRouteCompleteRequiresAnActiveMentorship() {
        MentorshipRequest request = new MentorshipRequest();
        request.setMenteeId(employee.getId());
        request.setMentorId(mentor.getId());
        request.setSkillId(rust.getId());
        MentorshipResponse requested = mentorshipService.requestMentorship(request);

        assertThatThrownBy(() ->
                employeeService.completeMentorship(employee.getId(), requested.getMentorshipId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Only an ACTIVE mentorship can be completed");

        mentorshipService.acceptMentorship(requested.getMentorshipId(), mentor.getId());
        MentorshipResponse completed =
                employeeService.completeMentorship(employee.getId(), requested.getMentorshipId());
        assertThat(completed.getStatus()).isEqualTo(MentorshipStatus.COMPLETED);
        assertThat(completed.getEndDate()).isNotNull();
    }

    @Test
    @DisplayName("Both routes recommend the same mentors")
    void bothRoutesRecommendTheSameMentors() {
        assertThat(employeeService.getAvailableMentors(employee.getId(), rust.getId()))
                .usingRecursiveComparison()
                .isEqualTo(mentorshipService.findRecommendedMentors(employee.getId(), rust.getId()));
    }

    @Test
    @DisplayName("The legacy auto-match route also refuses to stack a second mentorship")
    void autoMatchRefusesADuplicateActiveMentorship() {
        GapAnalysis gap = new GapAnalysis();
        gap.setUser(employee);
        gap.setSkill(rust);
        gap.setTargetScore((double) ProficiencyLevel.EXPERT.getScore());
        gap.setCurrentScore((double) ProficiencyLevel.INTERMEDIATE.getScore());
        gap.setGapScore(3.0);
        gap.setRiskSeverity(RiskSeverity.CRITICAL);
        gap.setMissingSkill(false);
        gapAnalysisRepository.save(gap);

        MentorshipMatchRequest request = new MentorshipMatchRequest();
        request.setMenteeId(employee.getId());
        request.setSkillId(rust.getId());
        assertThat(mentorshipService.createMatch(request)).isNotNull();

        assertThatThrownBy(() -> mentorshipService.createMatch(request))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already pending");
    }

    // ── Fixtures ────────────────────────────────────────────────────────────────

    private Skill skill(String name) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCategory("Backend");
        return skill;
    }

    private UserSkill userSkill(User user, ProficiencyLevel level) {
        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(rust);
        userSkill.setProficiencyLevel(level);
        userSkill.setRatingScore((double) level.getScore());
        return userSkill;
    }

    private User person(String email, String fullName) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword("not-used-in-this-test");
        user.setRole(Role.EMPLOYEE);
        user.setActive(true);
        user.setDepartment(DEPARTMENT);
        user.setJobTitle(JOB_TITLE);
        return user;
    }
}
