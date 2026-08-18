package com.okip.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Employee;
import com.okip.enums.AccountStatus;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByOfficialEmail(String officialEmail);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByOfficialEmail(String officialEmail);

    boolean existsByEmployeeCode(String employeeCode);
    
    List<Employee> findByStatus(AccountStatus status);
    
    
}