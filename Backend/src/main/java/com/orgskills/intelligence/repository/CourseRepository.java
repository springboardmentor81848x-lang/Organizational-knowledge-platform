package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findBySkillCoveredId(Long skillId);
    List<Course> findByIsInternal(Boolean isInternal);
    List<Course> findByIsInternalFalse();

    Optional<Course> findByTitleIgnoreCaseAndProviderIgnoreCaseAndExternalUrl(String title, String provider, String externalUrl);
    Optional<Course> findByTitleIgnoreCaseAndProviderIgnoreCase(String title, String provider);

    List<Course> findByIsInternalFalseAndProviderIgnoreCase(String provider);
    List<Course> findByIsInternalFalseAndSkillCoveredId(Long skillId);
    List<Course> findByIsInternalFalseAndSkillCoveredNameIgnoreCase(String skillName);
}
