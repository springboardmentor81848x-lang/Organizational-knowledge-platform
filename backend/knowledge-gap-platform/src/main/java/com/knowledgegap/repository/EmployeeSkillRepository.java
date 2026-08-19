package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;

public interface EmployeeSkillRepository
        extends JpaRepository<EmployeeSkill, Long> {

    List<EmployeeSkill> findByEmployee(Employee employee);

    Optional<EmployeeSkill> findByEmployeeAndSkill(
            Employee employee,
            Skill skill
    );

    List<EmployeeSkill> findBySkill(Skill skill);

    void deleteByEmployee(Employee employee);
}