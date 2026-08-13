package com.knowledgegap.repository;

import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssessmentAttemptRepository
        extends JpaRepository<AssessmentAttempt, Long> {

    Optional<AssessmentAttempt> findFirstByEmployeeAndAssessmentOrderByIdDesc(
            Employee employee,
            Assessment assessment
    );

    Optional<AssessmentAttempt> findFirstByEmployeeOrderByIdDesc(
            Employee employee
    );
}