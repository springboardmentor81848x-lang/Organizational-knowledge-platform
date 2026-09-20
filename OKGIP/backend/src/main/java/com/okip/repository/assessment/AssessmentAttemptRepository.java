package com.okip.repository.assessment;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.assessment.Assessment;
import com.okip.entity.assessment.AssessmentAttempt;

public interface AssessmentAttemptRepository
        extends JpaRepository<AssessmentAttempt, Long> {

    List<AssessmentAttempt>
    findByEmployeeEmployeeIdOrderByStartedAtDesc(
            Long employeeId);

    Optional<AssessmentAttempt>
    findByAttemptIdAndEmployeeEmployeeId(
            Long attemptId,
            Long employeeId);

    Optional<AssessmentAttempt>
    findByAttemptIdAndEvaluatorEmployeeId(
            Long attemptId,
            Long evaluatorId);

    boolean
    existsByAssessmentAssessmentIdAndEmployeeEmployeeIdAndEvaluatorEmployeeIdAndStatus(
            Long assessmentId,
            Long employeeId,
            Long evaluatorId,
            AssessmentAttempt.Status status);

    Optional<AssessmentAttempt>
    findTopByEmployeeEmployeeIdAndAssessmentSkillSkillIdAndAssessmentAssessmentTypeAndStatusOrderBySubmittedAtDesc(
            Long employeeId,
            Long skillId,
            Assessment.AssessmentType assessmentType,
            AssessmentAttempt.Status status);
}