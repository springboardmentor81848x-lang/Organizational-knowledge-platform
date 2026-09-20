package com.okip.repository.assessment;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.assessment.Assessment;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    Optional<Assessment> findBySkillSkillIdAndActiveTrue(Long skillId);

    Optional<Assessment> findBySkillSkillIdAndAssessmentTypeAndActiveTrue(
            Long skillId,
            Assessment.AssessmentType assessmentType
    );
}