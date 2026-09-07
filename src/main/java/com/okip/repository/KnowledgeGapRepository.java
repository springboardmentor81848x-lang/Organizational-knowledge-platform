package com.okip.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.KnowledgeGap;

public interface KnowledgeGapRepository
        extends JpaRepository<KnowledgeGap, Long> {

    List<KnowledgeGap> findByEmployeeJobRole(
            EmployeeJobRole employeeJobRole);

    List<KnowledgeGap> findByEmployeeJobRoleIn(
            List<EmployeeJobRole> employeeJobRoles);

    @Modifying
    @Query("DELETE FROM KnowledgeGap kg WHERE kg.employeeJobRole = :employeeJobRole")
    void deleteByEmployeeJobRole(
            @Param("employeeJobRole") EmployeeJobRole employeeJobRole);
    
    List<KnowledgeGap> findByEmployeeJobRole_Employee_EmployeeId(
            Long employeeId);
}