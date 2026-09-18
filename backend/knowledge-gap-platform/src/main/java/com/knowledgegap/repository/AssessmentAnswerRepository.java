package com.knowledgegap.repository;

import com.knowledgegap.entity.AssessmentAnswer;
import com.knowledgegap.entity.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentAnswerRepository
        extends JpaRepository<AssessmentAnswer, Long> {

    List<AssessmentAnswer> findByAttempt(AssessmentAttempt attempt);
}