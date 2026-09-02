package com.okgip.repository;

import com.okgip.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findBySkillId(Long skillId);
    List<Course> findByCategory(String category);
}
