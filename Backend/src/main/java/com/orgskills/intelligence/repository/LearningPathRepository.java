package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.LearningPath;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningPathRepository extends JpaRepository<LearningPath, Long> {
    List<LearningPath> findByTargetRoleIgnoreCaseOrTargetDepartmentIgnoreCase(String targetRole, String targetDepartment);
    List<LearningPath> findByEmployeeId(Long employeeId);
    List<LearningPath> findByEmployeeIdOrderByGeneratedAtDesc(Long employeeId);
    Optional<LearningPath> findByEmployeeIdAndTargetSkillId(Long employeeId, Long skillId);
    Optional<LearningPath> findByIdAndEmployeeId(Long id, Long employeeId);
}
