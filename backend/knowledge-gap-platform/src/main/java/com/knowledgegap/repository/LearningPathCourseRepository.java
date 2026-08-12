package com.knowledgegap.repository;

import com.knowledgegap.entity.LearningPath;
import com.knowledgegap.entity.LearningPathCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningPathCourseRepository extends JpaRepository<LearningPathCourse, Long> {

    List<LearningPathCourse> findByLearningPathOrderBySequenceOrderAsc(LearningPath learningPath);

}