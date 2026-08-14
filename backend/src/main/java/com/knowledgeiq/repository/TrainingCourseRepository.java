package com.knowledgeiq.repository;

import com.knowledgeiq.model.TrainingCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrainingCourseRepository extends JpaRepository<TrainingCourse, UUID> {
    List<TrainingCourse> findByTargetSkillId(UUID skillId);
    java.util.Optional<TrainingCourse> findByTitle(String title);
}
