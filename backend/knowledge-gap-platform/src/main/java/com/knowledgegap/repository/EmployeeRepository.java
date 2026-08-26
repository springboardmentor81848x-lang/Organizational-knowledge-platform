package com.knowledgegap.repository;

import com.knowledgegap.entity.Employee;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long> {

    // Find employee by email
    Optional<Employee> findByEmail(String email);

    // Find employee by employee ID
    Optional<Employee> findByEmployeeId(String employeeId);

    // Find employees whose role name is one of the given roles
    List<Employee> findByRoleRoleNameIn(
            List<String> roleNames
    );

    // Find employees by exact role name
    List<Employee> findByRoleRoleName(
            String roleName
    );

    // =========================================================
    // DEPARTMENT DASHBOARD
    // =========================================================

    List<Employee> findByDepartmentId(
            Long departmentId
    );
}