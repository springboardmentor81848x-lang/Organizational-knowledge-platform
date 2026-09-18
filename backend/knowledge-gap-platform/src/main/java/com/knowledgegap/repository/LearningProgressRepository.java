package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.LearningProgress;

public interface LearningProgressRepository
        extends JpaRepository<LearningProgress, Long> {

    List<LearningProgress> findByEmployee(Employee employee);

    Optional<LearningProgress> findByEmployeeAndCourse(
            Employee employee,
            Course course
    );

    List<LearningProgress> findByCourse(Course course);
}