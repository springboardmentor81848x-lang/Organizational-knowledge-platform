package com.knowledgegap.repository;

import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.AssessmentGapResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentGapResultRepository
        extends JpaRepository<AssessmentGapResult, Long> {

    // Get gap results using the AssessmentAttempt object
    List<AssessmentGapResult> findByAttempt(AssessmentAttempt attempt);

    // Get gap results directly using attempt ID
    List<AssessmentGapResult> findByAttempt_Id(Long attemptId);
}