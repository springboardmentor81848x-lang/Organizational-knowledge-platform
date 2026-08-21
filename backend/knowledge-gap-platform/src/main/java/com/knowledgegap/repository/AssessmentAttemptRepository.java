package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Assessment;
import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.Employee;

public interface AssessmentAttemptRepository
        extends JpaRepository<AssessmentAttempt, Long> {

    Optional<AssessmentAttempt> findFirstByEmployeeAndAssessmentOrderByIdDesc(
            Employee employee,
            Assessment assessment
    );

    Optional<AssessmentAttempt> findFirstByEmployeeOrderByIdDesc(
            Employee employee
    );

    List<AssessmentAttempt> findByEmployeeOrderByCompletedAtAsc(
            Employee employee
    );
}