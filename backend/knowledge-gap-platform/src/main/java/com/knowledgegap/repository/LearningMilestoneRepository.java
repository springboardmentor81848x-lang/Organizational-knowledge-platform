package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.LearningMilestone;

public interface LearningMilestoneRepository
        extends JpaRepository<LearningMilestone, Long> {

    List<LearningMilestone> findByCourseOrderByMilestoneOrderAsc(
            Course course
    );
}
