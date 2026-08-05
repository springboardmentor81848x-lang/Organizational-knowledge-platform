package com.knowledgegap.repository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {
    List<EmployeeSkill> findByEmployee(Employee employee);
}