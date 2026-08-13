package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;

@Repository
public interface EmployeeSkillRepository
        extends JpaRepository<EmployeeSkill, Long> {

    List<EmployeeSkill> findByEmployee(Employee employee);

    List<EmployeeSkill> findByEmployeeEmployeeId(String employeeId);

    Optional<EmployeeSkill> findByEmployeeAndSkill(
            Employee employee,
            com.knowledgegap.entity.Skill skill
    );
}