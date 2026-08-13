package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.AssessmentAnswer;

public interface AssessmentAnswerRepository
        extends JpaRepository<AssessmentAnswer, Long> {

    List<AssessmentAnswer> findByAttemptId(Long attemptId);
}