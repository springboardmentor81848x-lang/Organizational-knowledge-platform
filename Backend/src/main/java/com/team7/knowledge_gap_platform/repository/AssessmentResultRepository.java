package com.team7.knowledge_gap_platform.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.AssessmentResult;

public interface AssessmentResultRepository
        extends JpaRepository<AssessmentResult, Long> {

    List<AssessmentResult> findByEmployeeId(Long employeeId);

    List<AssessmentResult> findByEmployeeIdAndSkillId(
            Long employeeId,
            Long skillId);

    List<AssessmentResult> findByEmployeeIdAndSkillIdAndAssessmentType(
            Long employeeId,
            Long skillId,
            String assessmentType);

    Optional<AssessmentResult>
    findTopByEmployeeIdAndSkillIdAndAssessmentTypeOrderByCompletedAtDesc(
            Long employeeId,
            Long skillId,
            String assessmentType);
}