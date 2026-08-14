package com.knowledgegap.repository;

import com.knowledgegap.entity.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentQuestionRepository
        extends JpaRepository<AssessmentQuestion, Long> {

    List<AssessmentQuestion> findByAssessmentId(
            Long assessmentId
    );
}