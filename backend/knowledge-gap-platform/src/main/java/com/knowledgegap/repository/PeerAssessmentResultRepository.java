package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.PeerAssessmentResult;

public interface PeerAssessmentResultRepository
        extends JpaRepository<PeerAssessmentResult, Long> {

    List<PeerAssessmentResult> findByAttempt(
            AssessmentAttempt attempt
    );

    List<PeerAssessmentResult> findByAttemptId(
            Long attemptId
    );
}