package com.team7.knowledge_gap_platform.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.Assessment;

public interface AssessmentRepository
        extends JpaRepository<Assessment, Long> {

    Optional<Assessment> findBySkillId(Long skillId);

    Optional<Assessment> findBySkillIdAndAssessmentType(
            Long skillId,
            String assessmentType);
}