package com.knowledgeiq.repository;

import com.knowledgeiq.model.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, UUID> {
    List<CourseEnrollment> findByUserId(UUID userId);
    Optional<CourseEnrollment> findByUserIdAndCourseId(UUID userId, UUID courseId);
}
