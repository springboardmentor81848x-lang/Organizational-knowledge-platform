package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, Long> {

    List<AssessmentQuestion> findBySkillId(Long skillId);

    /**
     * Every question for a set of skills, fetched in one query.
     *
     * <p>A quiz covers all the skills a target role names, so loading them per skill would issue
     * one query per skill on the busiest read in the assessment flow. The skill is joined in for
     * the same reason: the caller groups by skill and reads its name, which would otherwise be a
     * lazy load per row.
     */
    @org.springframework.data.jpa.repository.Query(
            "SELECT q FROM AssessmentQuestion q JOIN FETCH q.skill WHERE q.skill.id IN :skillIds")
    List<AssessmentQuestion> findBySkillIdInWithSkill(
            @org.springframework.data.repository.query.Param("skillIds") Collection<Long> skillIds);

    long countBySkillId(Long skillId);
}
