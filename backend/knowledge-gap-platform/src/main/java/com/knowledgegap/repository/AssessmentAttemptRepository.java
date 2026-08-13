package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.AssessmentAttempt;

public interface AssessmentAttemptRepository
        extends JpaRepository<AssessmentAttempt, Long> {

    List<AssessmentAttempt> findByEmployeeIdOrderByCompletedAtDesc(Long employeeId);

    Optional<AssessmentAttempt> findFirstByEmployeeIdOrderByCompletedAtDesc(Long employeeId);
}