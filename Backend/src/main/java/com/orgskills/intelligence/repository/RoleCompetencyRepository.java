package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.dto.role.TargetRoleOption;
import com.orgskills.intelligence.entity.RoleCompetency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

public interface RoleCompetencyRepository extends JpaRepository<RoleCompetency, Long> {
    List<RoleCompetency> findByJobTitleIgnoreCaseAndDepartmentIgnoreCase(String jobTitle, String department);

    boolean existsByJobTitleIgnoreCaseAndDepartmentIgnoreCaseAndSkillId(String jobTitle, String department, Long skillId);

    /**
     * The distinct roles that have a competency profile, with how many skills each is measured
     * on. This is the set a new employee may choose as their target: a role with no profile has
     * nothing to assess against.
     */
    @Query("""
            SELECT new com.orgskills.intelligence.dto.role.TargetRoleOption(
                       rc.jobTitle, rc.department, CAST(COUNT(rc.id) AS integer))
            FROM RoleCompetency rc
            GROUP BY rc.jobTitle, rc.department
            ORDER BY rc.department ASC, rc.jobTitle ASC
            """)
    List<TargetRoleOption> findDistinctTargetRoles();

    /**
     * Every requirement any role places on these skills.
     *
     * <p>Backs the benchmark for a skill an employee added that their own role does not ask
     * for: the organisation's own highest expectation of that skill is a far better yardstick
     * than a number invented for the purpose, and it is one that moves as the competency
     * profiles are edited.
     */
    List<RoleCompetency> findBySkillIdIn(Collection<Long> skillIds);
}
