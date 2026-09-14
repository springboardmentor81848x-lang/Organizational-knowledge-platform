package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.TeamLeaderReport;
import com.infosys.knowledgeplatform.model.Department;
import com.infosys.knowledgeplatform.model.DepartmentTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeamLeaderReportRepository extends JpaRepository<TeamLeaderReport, Long> {
    List<TeamLeaderReport> findByDepartment(Department department);
    List<TeamLeaderReport> findByTeam(DepartmentTeam team);
    
    @Query("SELECT tlr FROM TeamLeaderReport tlr WHERE tlr.department.id = :departmentId AND tlr.status = :status")
    List<TeamLeaderReport> findByDepartmentAndStatus(@Param("departmentId") Long departmentId, @Param("status") String status);
    
    @Query("SELECT tlr FROM TeamLeaderReport tlr WHERE tlr.department.id = :departmentId ORDER BY tlr.submittedDate DESC")
    List<TeamLeaderReport> findRecentByDepartment(@Param("departmentId") Long departmentId);
}
