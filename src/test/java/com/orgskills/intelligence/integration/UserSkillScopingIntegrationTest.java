package com.orgskills.intelligence.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.skill.UserSkillRequest;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The skill endpoints took the user id straight from the path and acted on it, with no check
 * that the caller had any business doing so. Any signed-in user could read and rewrite anybody
 * else's proficiency levels — including their own manager's, and including levels that feed the
 * gap analysis those managers act on.
 *
 * <p>These pin the scoping: your own record is yours to curate, and somebody else's needs a role
 * responsible for them.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserSkillScopingIntegrationTest {

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

    private User employee;
    private User colleague;
    private User manager;
    private Skill skill;
    private UserSkill colleagueSkill;

    @BeforeEach
    void setUp() {
        skill = skillRepository.save(skill("Elixir (scoping test)"));
        employee = userRepository.save(person("scope.employee@orgskills.com", "Scope Employee", Role.EMPLOYEE));
        colleague = userRepository.save(person("scope.colleague@orgskills.com", "Scope Colleague", Role.EMPLOYEE));
        manager = userRepository.save(person("scope.manager@orgskills.com", "Scope Manager", Role.MANAGER));

        UserSkill held = new UserSkill();
        held.setUser(colleague);
        held.setSkill(skill);
        held.setProficiencyLevel(ProficiencyLevel.BEGINNER);
        held.setRatingScore((double) ProficiencyLevel.BEGINNER.getScore());
        colleagueSkill = userSkillRepository.save(held);
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("An employee can no longer read a colleague's skill record")
    void readingAnotherEmployeeIsRefused() throws Exception {
        mockMvc.perform(authed(get("/api/users/" + colleague.getId() + "/skills"), employee))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("An employee can no longer rewrite a colleague's proficiency")
    void rewritingAnotherEmployeeIsRefused() throws Exception {
        UserSkillRequest inflate = new UserSkillRequest(skill.getId(), ProficiencyLevel.EXPERT, 4.0);

        mockMvc.perform(authed(put("/api/users/" + colleague.getId() + "/skills/" + colleagueSkill.getId()), employee)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inflate)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("An employee can no longer inject a skill onto somebody else")
    void addingToAnotherEmployeeIsRefused() throws Exception {
        UserSkillRequest addition = new UserSkillRequest(skill.getId(), ProficiencyLevel.UNAWARE, 0.0);

        mockMvc.perform(authed(post("/api/users/" + colleague.getId() + "/skills"), employee)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addition)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Curating your own skill profile still works")
    void ownRecordRemainsEditable() throws Exception {
        UserSkillRequest addition = new UserSkillRequest(skill.getId(), ProficiencyLevel.INTERMEDIATE, 2.0);

        mockMvc.perform(authed(post("/api/users/" + employee.getId() + "/skills"), employee)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addition)))
                .andExpect(status().isCreated());

        mockMvc.perform(authed(get("/api/users/" + employee.getId() + "/skills"), employee))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("A manager may still read the records they are responsible for")
    void managerRetainsAccess() throws Exception {
        mockMvc.perform(authed(get("/api/users/" + colleague.getId() + "/skills"), manager))
                .andExpect(status().isOk());
    }

    // ── Fixtures ────────────────────────────────────────────────────────────────

    private MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder, User user) {
        CustomPrincipal principal = new CustomPrincipal(user.getId(), user.getEmail(), "",
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

    private User person(String email, String fullName, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword("not-used-in-this-test");
        user.setRole(role);
        user.setActive(true);
        user.setDepartment("Scoping Department");
        user.setJobTitle("Scoping Engineer");
        return user;
    }
}
