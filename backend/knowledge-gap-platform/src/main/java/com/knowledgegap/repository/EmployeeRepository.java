package com.knowledgegap.repository;

import com.knowledgegap.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeId(String employeeId);

    List<Employee> findByRoleRoleNameIn(List<String> roleNames);

    List<Employee> findByRoleRoleName(String roleName);
}