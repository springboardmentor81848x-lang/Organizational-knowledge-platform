package com.knowledgeiq.repository;

import com.knowledgeiq.model.LearningMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningMilestoneRepository extends JpaRepository<LearningMilestone, UUID> {
    List<LearningMilestone> findByCourseIdOrderBySequenceOrderAsc(UUID courseId);
    void deleteByCourseId(UUID courseId);
}
