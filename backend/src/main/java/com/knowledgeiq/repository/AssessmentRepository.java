package com.knowledgeiq.repository;

import com.knowledgeiq.model.Assessment;
import com.knowledgeiq.model.AssessmentStatus;
import com.knowledgeiq.model.AssessmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {
    List<Assessment> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Assessment> findByEvaluatorIdOrderByCreatedAtDesc(UUID evaluatorId);
    List<Assessment> findByUserIdOrEvaluatorIdOrderByCreatedAtDesc(UUID userId, UUID evaluatorId);
    List<Assessment> findByUserIdAndTypeAndStatus(UUID userId, AssessmentType type, AssessmentStatus status);
}
