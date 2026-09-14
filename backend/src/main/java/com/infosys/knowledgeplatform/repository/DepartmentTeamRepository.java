package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.DepartmentTeam;
import com.infosys.knowledgeplatform.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DepartmentTeamRepository extends JpaRepository<DepartmentTeam, Long> {
    Optional<DepartmentTeam> findByName(String name);
    List<DepartmentTeam> findByDepartment(Department department);
    List<DepartmentTeam> findByTeamLeadEmail(String teamLeadEmail);
    
    @Query("SELECT dt FROM DepartmentTeam dt WHERE dt.department.id = :departmentId AND dt.status = 'ACTIVE'")
    List<DepartmentTeam> findActiveTeamsByDepartmentId(@Param("departmentId") Long departmentId);
}
