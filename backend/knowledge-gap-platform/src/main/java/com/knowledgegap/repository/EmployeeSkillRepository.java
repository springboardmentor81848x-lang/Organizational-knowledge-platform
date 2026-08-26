package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;

public interface EmployeeSkillRepository
        extends JpaRepository<EmployeeSkill, Long> {

    // =========================================================
    // EMPLOYEE SKILLS
    // =========================================================

    List<EmployeeSkill> findByEmployee(Employee employee);

    Optional<EmployeeSkill> findByEmployeeAndSkill(
            Employee employee,
            Skill skill
    );

    // =========================================================
    // SKILL
    // =========================================================

    List<EmployeeSkill> findBySkill(Skill skill);

    // =========================================================
    // DEPARTMENT SKILL COVERAGE
    // =========================================================
    // Fetch all employee skills for employees
    // belonging to a particular department.

    List<EmployeeSkill> findByEmployeeDepartmentId(
            Long departmentId
    );

    // =========================================================
    // DELETE EMPLOYEE SKILLS
    // =========================================================

    void deleteByEmployee(Employee employee);
}