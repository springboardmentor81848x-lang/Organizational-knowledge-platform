package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.KnowledgeApproval;
import com.infosys.knowledgeplatform.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface KnowledgeApprovalRepository extends JpaRepository<KnowledgeApproval, Long> {
    List<KnowledgeApproval> findByDepartment(Department department);
    
    @Query("SELECT ka FROM KnowledgeApproval ka WHERE ka.department.id = :departmentId AND ka.status = :status")
    List<KnowledgeApproval> findByDepartmentAndStatus(@Param("departmentId") Long departmentId, @Param("status") String status);
    
    @Query("SELECT ka FROM KnowledgeApproval ka WHERE ka.department.id = :departmentId ORDER BY ka.createdAt DESC")
    List<KnowledgeApproval> findRecentByDepartment(@Param("departmentId") Long departmentId);
}
