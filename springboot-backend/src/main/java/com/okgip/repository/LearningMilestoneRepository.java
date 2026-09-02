package com.okgip.repository;

import com.okgip.entity.LearningMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningMilestoneRepository extends JpaRepository<LearningMilestone, Long> {
    List<LearningMilestone> findByCourseIdOrderBySequenceOrderAsc(Long courseId);
}
