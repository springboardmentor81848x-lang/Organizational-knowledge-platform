package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.LearningMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningMilestoneRepository extends JpaRepository<LearningMilestone, Long> {
    List<LearningMilestone> findByUserId(Long userId);
}
