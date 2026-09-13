package com.orgskills.intelligence.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.skill.UserSkillRequest;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import com.orgskills.intelligence.security.CustomPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Recording a skill when your job title has no competency profile.
 *
 * <p>Profiles exist for the roles the organisation measures — "Software Engineer",
 * "Engineering Manager". A VP, an HR specialist and an administrator have none, and the gap
 * recalculation that follows a skill change refuses outright when it cannot find one. That
 * refusal was caught and ignored on purpose, because recalculating gaps is a side effect and
 * not the reason the request was made.
 *
 * <p>Catching it was not enough. The recalculation is transactional and joined the caller's
 * transaction, so throwing marked that transaction rollback-only; the catch then let the method
 * return normally and the commit failed with "Transaction silently rolled back". Every one of
 * those roles got a 500 from "Add a skill", and the skill was discarded.
 *
 * <p>Deliberately <strong>not</strong> {@code @Transactional}. A rollback-only transaction fails
 * at commit and nowhere else, so a test that never commits cannot see this — which is exactly
 * how it survived a suite that covers these endpoints elsewhere.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SkillWithoutRoleProfileIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private RoleCompetencyRepository roleCompetencyRepository;

    private User unmeasured;
    private Skill skill;

    /**
     * A user and a skill of its own per test, rather than one pair cleaned up afterwards.
     *
     * <p>Adding a skill sets off the whole chain behind it - a gap row, a gap alert, a
     * recommendation, a learning path - and every one of those references the user or the skill.
     * A teardown that deletes them has to delete all of that first, in the right order, and gets
     * silently out of date the moment another table joins the chain: the symptom is not a
     * failure here but a unique-name clash in the <em>next</em> test's setUp, which says nothing
     * about what actually went wrong. Unique fixtures cost two lines and cannot rot.
     */
    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        skill = skillRepository.save(skill("Rust (no-profile test " + unique + ")"));

        User user = new User();
        user.setEmail("vp.noprofile." + unique + "@orgskills.com");
        user.setFullName("Vera Prentice");
        user.setPassword("not-used-in-this-test");
        user.setRole(Role.DEPARTMENT_HEAD);
        user.setActive(true);
        user.setDepartment("Unmeasured Division");
        user.setJobTitle("VP of Nothing Measured");
        unmeasured = userRepository.save(user);

        // The premise of the test: nothing describes what this job title is meant to know.
        assertThat(roleCompetencyRepository
                .findByJobTitleIgnoreCaseAndDepartmentIgnoreCase(unmeasured.getJobTitle(), unmeasured.getDepartment()))
                .isEmpty();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Adding a skill succeeds, and is kept, when the job title has no competency profile")
    void addingASkillSurvivesTheMissingProfile() throws Exception {
        // The level in the request is deliberately absurd. It is ignored either way - the point
        // of sending it is that a request claiming EXPERT must not produce an EXPERT row.
        UserSkillRequest request = new UserSkillRequest(skill.getId(), ProficiencyLevel.EXPERT, 4.0);

        mockMvc.perform(authed(post("/api/users/" + unmeasured.getId() + "/skills"), unmeasured)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.proficiencyLevel").value("UNAWARE"))
                .andExpect(jsonPath("$.awaitingAssessment").value(true));

        // The status alone is not the assertion that matters: the rollback happened at commit,
        // after the response had been written, so the row is what proves it was really kept.
        List<UserSkill> held = userSkillRepository.findByUserId(unmeasured.getId());
        assertThat(held)
                .singleElement()
                .satisfies(us -> {
                    assertThat(us.getSkill().getId()).isEqualTo(skill.getId());
                    // Adding a skill is a claim that it is part of your work, not evidence of
                    // how good you are at it. The level waits for a marked assessment.
                    assertThat(us.getProficiencyLevel()).isEqualTo(ProficiencyLevel.UNAWARE);
                });
    }

    @Test
    @DisplayName("The level cannot be set by hand, and removing the skill still works")
    void levelIsRefusedButRemovalSurvivesTheMissingProfile() throws Exception {
        UserSkillRequest added = new UserSkillRequest(skill.getId(), ProficiencyLevel.BEGINNER, 1.0);
        mockMvc.perform(authed(post("/api/users/" + unmeasured.getId() + "/skills"), unmeasured)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(added)))
                .andExpect(status().isCreated());

        Long userSkillId = userSkillRepository.findByUserId(unmeasured.getId()).get(0).getId();

        // Promoting yourself is refused with an explanation rather than a 404: the address is
        // right, the operation is the thing that no longer exists.
        UserSkillRequest promoted = new UserSkillRequest(skill.getId(), ProficiencyLevel.ADVANCED, 3.0);
        mockMvc.perform(authed(put("/api/users/" + unmeasured.getId() + "/skills/" + userSkillId), unmeasured)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(promoted)))
                .andExpect(status().isBadRequest());

        assertThat(userSkillRepository.findById(userSkillId))
                .get()
                .extracting(UserSkill::getProficiencyLevel)
                .isEqualTo(ProficiencyLevel.UNAWARE);

        // Removal is still the way to correct a skill that does not belong on the profile, and
        // it still has to survive the missing competency profile.
        mockMvc.perform(authed(delete("/api/users/" + unmeasured.getId() + "/skills/" + userSkillId), unmeasured))
                .andExpect(status().isNoContent());

        assertThat(userSkillRepository.findById(userSkillId)).isEmpty();
    }

    // ── Fixtures ────────────────────────────────────────────────────────────────

    private MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder, User user) {
        CustomPrincipal principal = new CustomPrincipal(user.getId(), user.getEmail(), "",
                true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return builder.principal(authentication);
    }

    private Skill skill(String name) {
        Skill created = new Skill();
        created.setName(name);
        created.setCategory("Technical");
        return created;
    }
}
