package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Exercises the expert-directory search against a real database rather than mocks, so the
 * JPQL, the join fetches and the supporting index are all verified.
 */
@DataJpaTest
class ExpertSearchRepositoryTest {

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private EntityManager entityManager;

    private Skill java;

    @BeforeEach
    void setUp() {
        java = skill("Java", "Technical");
        Skill python = skill("Python", "Technical");

        User expert = user("expert@corp.com", "Erin Expert", "Engineering");
        User advanced = user("advanced@corp.com", "Adam Advanced", "Finance");
        User intermediate = user("mid@corp.com", "Mia Mid", "Engineering");
        User inactive = user("gone@corp.com", "Gus Gone", "Engineering");
        inactive.setActive(false);

        entityManager.persist(userSkill(expert, java, ProficiencyLevel.EXPERT, 5.0));
        entityManager.persist(userSkill(advanced, java, ProficiencyLevel.ADVANCED, 4.0));
        entityManager.persist(userSkill(intermediate, java, ProficiencyLevel.INTERMEDIATE, 3.0));
        entityManager.persist(userSkill(inactive, java, ProficiencyLevel.EXPERT, 5.0));
        entityManager.persist(userSkill(expert, python, ProficiencyLevel.EXPERT, 5.0));
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("searchExperts returns only the requested skill at or above the given levels")
    void searchesBySkillAndProficiency() {
        List<UserSkill> results = userSkillRepository.searchExperts(
                "Java", List.of(ProficiencyLevel.ADVANCED, ProficiencyLevel.EXPERT));

        assertThat(results).hasSize(2);
        assertThat(results).allMatch(result -> result.getSkill().getName().equals("Java"));
        assertThat(results).extracting(result -> result.getUser().getFullName())
                .containsExactlyInAnyOrder("Erin Expert", "Adam Advanced");
    }

    @Test
    @DisplayName("searchExperts matches the skill name case-insensitively and partially")
    void matchesSkillNameLoosely() {
        assertThat(userSkillRepository.searchExperts("jav", List.of(ProficiencyLevel.EXPERT)))
                .extracting(result -> result.getUser().getFullName())
                .containsExactly("Erin Expert");
    }

    @Test
    @DisplayName("searchExperts excludes deactivated employees")
    void excludesInactiveEmployees() {
        List<UserSkill> results = userSkillRepository.searchExperts("Java", List.of(ProficiencyLevel.EXPERT));

        assertThat(results).extracting(result -> result.getUser().getFullName())
                .doesNotContain("Gus Gone");
    }

    @Test
    @DisplayName("searchExperts returns nothing for a skill no one holds")
    void unknownSkillReturnsEmpty() {
        assertThat(userSkillRepository.searchExperts("Cobol", List.of(ProficiencyLevel.ADVANCED))).isEmpty();
    }

    @Test
    @DisplayName("the (skill_id, proficiency_level) index backing the search exists in the schema")
    void supportingIndexIsCreated() {
        Object count = entityManager.createNativeQuery("""
                        SELECT COUNT(*) FROM INFORMATION_SCHEMA.INDEXES
                        WHERE UPPER(INDEX_NAME) = 'IDX_USER_SKILL_SKILL_PROFICIENCY'
                        """)
                .getSingleResult();

        assertThat(((Number) count).intValue()).isPositive();
    }

    // ── Helper methods ──────────────────────────────────────────────────────────

    private Skill skill(String name, String category) {
        Skill created = new Skill();
        created.setName(name);
        created.setCategory(category);
        entityManager.persist(created);
        return created;
    }

    private User user(String email, String fullName, String department) {
        User created = new User();
        created.setEmail(email);
        created.setPassword("x");
        created.setFullName(fullName);
        created.setRole(Role.EMPLOYEE);
        created.setDepartment(department);
        created.setJobTitle("Software Engineer");
        created.setActive(true);
        entityManager.persist(created);
        return created;
    }

    private UserSkill userSkill(User owner, Skill target, ProficiencyLevel level, Double rating) {
        UserSkill created = new UserSkill();
        created.setUser(owner);
        created.setSkill(target);
        created.setProficiencyLevel(level);
        created.setRatingScore(rating);
        return created;
    }
}
