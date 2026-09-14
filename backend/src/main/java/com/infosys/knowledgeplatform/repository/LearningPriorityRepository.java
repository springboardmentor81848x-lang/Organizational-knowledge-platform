package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.LearningPriority;
import com.infosys.knowledgeplatform.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LearningPriorityRepository extends JpaRepository<LearningPriority, Long> {
    List<LearningPriority> findByDepartment(Department department);
    
    @Query("SELECT lp FROM LearningPriority lp WHERE lp.department.id = :departmentId AND lp.status = :status")
    List<LearningPriority> findByDepartmentAndStatus(@Param("departmentId") Long departmentId, @Param("status") String status);
    
    @Query("SELECT lp FROM LearningPriority lp WHERE lp.department.id = :departmentId ORDER BY lp.priority DESC, lp.createdAt DESC")
    List<LearningPriority> findActivePrioritiesByDepartment(@Param("departmentId") Long departmentId);
}
