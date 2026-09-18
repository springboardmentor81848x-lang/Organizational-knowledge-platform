package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.LearningPathStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningPathStepRepository extends JpaRepository<LearningPathStep, Long> {
    List<LearningPathStep> findByLearningPathIdOrderByStepOrderAsc(Long learningPathId);
    List<LearningPathStep> findByLearningPathEmployeeIdAndCourseIdAndStatusNot(Long employeeId, Long courseId, String status);
}
