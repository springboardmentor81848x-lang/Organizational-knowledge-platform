package com.okip.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.KnowledgeGap;

public interface KnowledgeGapRepository
        extends JpaRepository<KnowledgeGap, Long> {

    List<KnowledgeGap> findByEmployeeJobRole(
            EmployeeJobRole employeeJobRole);

    List<KnowledgeGap> findByEmployeeJobRoleIn(
            List<EmployeeJobRole> employeeJobRoles);

    void deleteByEmployeeJobRole(
            EmployeeJobRole employeeJobRole);
    
    List<KnowledgeGap> findByEmployeeJobRole_Employee_EmployeeId(
            Long employeeId);
}