package com.okgip.repository;

import com.okgip.entity.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {
    List<CourseProgress> findByEmployeeId(Long employeeId);
    List<CourseProgress> findByCourseId(Long courseId);
    Optional<CourseProgress> findByEmployeeIdAndCourseId(Long employeeId, Long courseId);
    List<CourseProgress> findByStatus(String status);
}
