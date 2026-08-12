package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.ExternalCourse;

@Repository
public interface ExternalCourseRepository
        extends JpaRepository<ExternalCourse, Long> {

    List<ExternalCourse> findBySkillNameIgnoreCase(String skillName);

    List<ExternalCourse> findByLevelIgnoreCase(String level);

    List<ExternalCourse> findByProviderIgnoreCase(String provider);
}