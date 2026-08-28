package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Assessment;
import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.AssessmentType;
import com.knowledgegap.entity.Employee;

public interface AssessmentAttemptRepository
        extends JpaRepository<AssessmentAttempt, Long> {

    // =========================================================
    // LATEST ATTEMPT FOR EMPLOYEE + ASSESSMENT
    // =========================================================

    Optional<AssessmentAttempt> findFirstByEmployeeAndAssessmentOrderByIdDesc(
            Employee employee,
            Assessment assessment
    );

    // =========================================================
    // LATEST REASSESSMENT FOR EMPLOYEE + ASSESSMENT
    // =========================================================

    Optional<AssessmentAttempt>
    findFirstByEmployeeAndAssessmentAndAssessmentTypeOrderByIdDesc(
            Employee employee,
            Assessment assessment,
            AssessmentType assessmentType
    );

    // =========================================================
    // LATEST ATTEMPT FOR EMPLOYEE
    // =========================================================

    Optional<AssessmentAttempt> findFirstByEmployeeOrderByIdDesc(
            Employee employee
    );

    // =========================================================
    // ALL ATTEMPTS
    // =========================================================

    List<AssessmentAttempt> findByEmployeeOrderByCompletedAtAsc(
            Employee employee
    );
}