package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findByUserId(Long userId);

    List<UserSkill> findByUserIdIn(List<Long> userIds);

    List<UserSkill> findBySkillId(Long skillId);

    Optional<UserSkill> findByUserIdAndSkillId(Long userId, Long skillId);

    List<UserSkill> findBySkillIdAndProficiencyLevelOrderByRatingScoreDesc(Long skillId, ProficiencyLevel proficiencyLevel);

    /**
     * Expert-directory search. Elasticsearch is not part of this stack, so this is the
     * relational substitute: a single indexed query over user_skills joined to users and
     * skills, with no duplicated "expert" table. The composite index
     * {@code idx_user_skill_skill_proficiency} on (skill_id, proficiency_level) declared on
     * {@link UserSkill} serves the filter; the join fetches avoid an N+1 on the returned rows.
     *
     * <p>Results are not ordered here: {@code proficiency_level} is persisted as a string, so
     * SQL would sort it alphabetically rather than by seniority. The service ranks the
     * (already filtered, small) result set by enum order instead.
     */
    @Query("""
            SELECT us FROM UserSkill us
            JOIN FETCH us.user u
            JOIN FETCH us.skill s
            WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :skillName, '%'))
              AND us.proficiencyLevel IN :levels
              AND u.active = true
            """)
    List<UserSkill> searchExperts(@Param("skillName") String skillName,
                                  @Param("levels") Collection<ProficiencyLevel> levels);
}
