package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, Long> {
    List<AssessmentResult> findByAssessmentId(Long assessmentId);
    List<AssessmentResult> findByEvaluateeId(Long evaluateeId);
    List<AssessmentResult> findByEvaluatorId(Long evaluatorId);
}
