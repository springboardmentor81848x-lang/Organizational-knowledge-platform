package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.knowledgegap.entity.AssessmentResult;
import com.knowledgegap.enums.AssessmentType;

@Repository
public interface AssessmentResultRepository
        extends JpaRepository<AssessmentResult, Long> {

    List<AssessmentResult>
    findByEmployeeIdOrderByAssessmentDateDesc(
            Long employeeId
    );

    List<AssessmentResult>
    findByEmployeeIdAndSkillIdOrderByAssessmentDateDesc(
            Long employeeId,
            Long skillId
    );

    List<AssessmentResult>
    findByEmployeeIdAndAssessmentType(
            Long employeeId,
            AssessmentType assessmentType
    );

    List<AssessmentResult>
    findByEmployeeIdAndSkillIdAndAssessmentType(
            Long employeeId,
            Long skillId,
            AssessmentType assessmentType
    );
}