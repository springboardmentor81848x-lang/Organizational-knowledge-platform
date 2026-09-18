package com.orgskills.intelligence.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultRequest;
import com.orgskills.intelligence.dto.assessment.CreateAssessmentRequest;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import com.orgskills.intelligence.service.AssessmentService;
import com.orgskills.intelligence.service.GapAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The acceptance criterion for the assessment module, end to end against a real context and
 * database: submitting a manager assessment must change the employee's gap severity on its own,
 * with no separate recalculation call, and the change must be visible immediately on the gap
 * endpoint in the same session.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
class AssessmentGapChainIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AssessmentService assessmentService;

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

    private User employee;
    private User manager;
    private Skill kubernetes;

    @BeforeEach
    void setUp() {
        kubernetes = skillRepository.save(skill("Kubernetes (chain test)", "Platform"));

        employee = userRepository.save(
                user("chain.employee@orgskills.com", "Chain Employee", Role.EMPLOYEE));
        manager = userRepository.save(
                user("chain.manager@orgskills.com", "Chain Manager", Role.MANAGER));

        // The role demands EXPERT (4); the employee is on record as UNAWARE (0).
        RoleCompetency competency = new RoleCompetency();
        competency.setJobTitle(employee.getJobTitle());
        competency.setDepartment(employee.getDepartment());
        competency.setSkill(kubernetes);
        competency.setRequiredProficiencyLevel(ProficiencyLevel.EXPERT);
        roleCompetencyRepository.save(competency);

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(employee);
        userSkill.setSkill(kubernetes);
        userSkill.setProficiencyLevel(ProficiencyLevel.UNAWARE);
        userSkill.setRatingScore((double) ProficiencyLevel.UNAWARE.getScore());
        userSkillRepository.save(userSkill);
    }

    @Test
    @DisplayName("A manager assessment moves the gap severity with no separate recalculation step")
    void managerAssessmentRecalculatesGapsImmediately() throws Exception {
        // Baseline: UNAWARE (0) against a required EXPERT (4) is a gap of 4 -> CRITICAL.
        GapAnalysisResponse before = kubernetesGap(gapAnalysisService.calculateAndFetchUserGaps(employee.getId()));
        assertThat(before.getCurrentScore()).isEqualTo(0.0);
        assertThat(before.getGapScore()).isEqualTo(4.0);
        assertThat(before.getRiskSeverity()).isEqualTo(RiskSeverity.CRITICAL);

        // The manager assesses the employee at ADVANCED (3). This is the only call made.
        CreateAssessmentRequest create = new CreateAssessmentRequest();
        create.setEmployeeId(employee.getId());
        create.setAssessmentType(AssessmentType.MANAGER);
        create.setSkillIds(List.of(kubernetes.getId()));
        AssessmentResponse scheduled = assessmentService.createAssessment(manager.getId(), create);
        assertThat(scheduled.getStatus()).isEqualTo(AssessmentStatus.PENDING);

        SubmitAssessmentRequest submit = new SubmitAssessmentRequest();
        submit.setResults(List.of(new AssessmentResultRequest(kubernetes.getId(), ProficiencyLevel.ADVANCED)));
        AssessmentResponse submitted =
                assessmentService.submitAssessment(manager.getId(), scheduled.getAssessmentId(), submit);

        assertThat(submitted.getStatus()).isEqualTo(AssessmentStatus.COMPLETED);
        assertThat(submitted.getResults()).singleElement().satisfies(r -> {
            assertThat(r.getProficiency()).isEqualTo(ProficiencyLevel.ADVANCED);
            assertThat(r.getPreviousProficiency()).isEqualTo(ProficiencyLevel.UNAWARE);
            assertThat(r.getImprovement()).isEqualTo(3);
        });

        // The employee's skill record now holds the assessed level.
        UserSkill updated = userSkillRepository
                .findByUserIdAndSkillId(employee.getId(), kubernetes.getId()).orElseThrow();
        assertThat(updated.getProficiencyLevel()).isEqualTo(ProficiencyLevel.ADVANCED);

        // Read the stored gaps over HTTP without asking for a recalculation: the persisted rows
        // must already reflect the new level.
        MvcResult result = mockMvc.perform(get("/api/gaps/user/" + employee.getId() + "/stored"))
                .andExpect(status().isOk())
                .andReturn();

        List<GapAnalysisResponse> after = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, GapAnalysisResponse.class));

        GapAnalysisResponse afterGap = kubernetesGap(after);
        assertThat(afterGap.getCurrentScore()).isEqualTo(3.0);
        assertThat(afterGap.getCurrentProficiency()).isEqualTo("ADVANCED");
        assertThat(afterGap.getGapScore()).isEqualTo(1.0);
        assertThat(afterGap.getRiskSeverity()).isEqualTo(RiskSeverity.MEDIUM);
    }

    @Test
    @DisplayName("History exposes the before and after levels for the assessed skill")
    void historyShowsBeforeAndAfter() {
        CreateAssessmentRequest create = new CreateAssessmentRequest();
        create.setEmployeeId(employee.getId());
        create.setAssessmentType(AssessmentType.MANAGER);
        create.setSkillIds(List.of(kubernetes.getId()));

        AssessmentResponse first = assessmentService.createAssessment(manager.getId(), create);
        SubmitAssessmentRequest firstSubmit = new SubmitAssessmentRequest();
        firstSubmit.setResults(List.of(
                new AssessmentResultRequest(kubernetes.getId(), ProficiencyLevel.BEGINNER)));
        assessmentService.submitAssessment(manager.getId(), first.getAssessmentId(), firstSubmit);

        AssessmentResponse second = assessmentService.createAssessment(manager.getId(), create);
        SubmitAssessmentRequest secondSubmit = new SubmitAssessmentRequest();
        secondSubmit.setResults(List.of(
                new AssessmentResultRequest(kubernetes.getId(), ProficiencyLevel.ADVANCED)));
        assessmentService.submitAssessment(manager.getId(), second.getAssessmentId(), secondSubmit);

        assertThat(assessmentService.getHistory(manager.getId(), employee.getId()))
                .singleElement()
                .satisfies(p -> {
                    assertThat(p.getPreviousProficiency()).isEqualTo(ProficiencyLevel.BEGINNER);
                    assertThat(p.getCurrentProficiency()).isEqualTo(ProficiencyLevel.ADVANCED);
                    assertThat(p.getImprovement()).isEqualTo(2);
                    assertThat(p.getAssessmentCount()).isEqualTo(2);
                });
    }

    private GapAnalysisResponse kubernetesGap(List<GapAnalysisResponse> gaps) {
        return gaps.stream()
                .filter(g -> g.getSkillId().equals(kubernetes.getId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No gap recorded for the assessed skill"));
    }

    private Skill skill(String name, String category) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCategory(category);
        return skill;
    }

    private User user(String email, String fullName, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword("not-used-in-this-test");
        user.setRole(role);
        user.setJobTitle("Chain Test Engineer");
        user.setDepartment("Chain Test Department");
        user.setActive(true);
        return user;
    }
}
