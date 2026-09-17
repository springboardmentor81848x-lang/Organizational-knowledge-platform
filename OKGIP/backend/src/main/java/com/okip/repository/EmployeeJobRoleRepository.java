package com.okip.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Employee;
import com.okip.entity.master.JobRole;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.enums.AssignmentType;

public interface EmployeeJobRoleRepository
        extends JpaRepository<EmployeeJobRole, Long> {

    List<EmployeeJobRole> findByEmployee(Employee employee);

    List<EmployeeJobRole> findByEmployeeAndActiveTrue(
            Employee employee);

    Optional<EmployeeJobRole> findByEmployeeAndAssignmentTypeAndActiveTrue(
            Employee employee,
            AssignmentType assignmentType);

    Optional<EmployeeJobRole> findByEmployeeAndJobRoleAndActiveTrue(
            Employee employee,
            JobRole jobRole);

    List<EmployeeJobRole> findByJobRole(JobRole jobRole);

    List<EmployeeJobRole> findByAssignedByAndActiveTrue(Employee assignedBy);

    List<EmployeeJobRole> findByAssignedByAndEmployeeAndActiveTrue(
            Employee assignedBy, Employee employee);

}