package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.AssessmentQuestion;

public interface AssessmentQuestionRepository
        extends JpaRepository<AssessmentQuestion, Long> {

    List<AssessmentQuestion> findByAssessmentIdOrderByIdAsc(Long assessmentId);
}