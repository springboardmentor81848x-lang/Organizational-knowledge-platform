package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.LearningPath;
import com.knowledgegap.entity.LearningPathCourse;

public interface LearningPathCourseRepository extends JpaRepository<LearningPathCourse, Long> {

    List<LearningPathCourse> findByLearningPathOrderBySequenceOrderAsc(LearningPath learningPath);

}