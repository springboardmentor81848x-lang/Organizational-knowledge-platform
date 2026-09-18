package com.knowledgegap.repository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.KnowledgeGap;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
@Transactional
public interface KnowledgeGapRepository
        extends JpaRepository<KnowledgeGap, Long> {

    List<KnowledgeGap> findByEmployee(Employee employee);

    void deleteByEmployee(Employee employee);

    // =========================================================
    // DEPARTMENT HEAD DASHBOARD
    // =========================================================

    // Find all knowledge gaps belonging to employees
    // in a particular department
    List<KnowledgeGap> findByEmployeeDepartmentId(
            Long departmentId
    );
}