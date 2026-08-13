package com.knowledgegap.repository;

import com.knowledgegap.entity.AssessmentGapResult;
import com.knowledgegap.entity.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentGapResultRepository
        extends JpaRepository<AssessmentGapResult, Long> {

    List<AssessmentGapResult> findByAttempt(AssessmentAttempt attempt);
}