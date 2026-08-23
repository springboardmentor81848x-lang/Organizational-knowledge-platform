package com.team7.knowledge_gap_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository;

@Service
public class EmployeeSkillService {

    private final EmployeeSkillRepository employeeSkillRepository;

    public EmployeeSkillService(
            EmployeeSkillRepository employeeSkillRepository) {

        this.employeeSkillRepository = employeeSkillRepository;
    }

    // =========================================================
    // CREATE EMPLOYEE SKILL
    // =========================================================

    public EmployeeSkill createEmployeeSkill(
            EmployeeSkill employeeSkill) {

        return employeeSkillRepository.save(employeeSkill);
    }

    // =========================================================
    // GET ALL EMPLOYEE SKILLS
    // =========================================================

    public List<EmployeeSkill> getAllEmployeeSkills() {

        return employeeSkillRepository.findAll();
    }

    // =========================================================
    // GET EMPLOYEE SKILLS BY EMPLOYEE ID
    // =========================================================

    public List<EmployeeSkill> getEmployeeSkillsByEmployeeId(
            Long employeeId) {

        return employeeSkillRepository.findByEmployeeId(employeeId);
    }

    // =========================================================
    // GET EMPLOYEE SKILL BY ID
    // =========================================================

    public Optional<EmployeeSkill> getEmployeeSkillById(
            Long id) {

        return employeeSkillRepository.findById(id);
    }

    // =========================================================
    // GET EMPLOYEE SKILL BY EMPLOYEE + SKILL
    // =========================================================

    public Optional<EmployeeSkill> getEmployeeSkillByEmployeeAndSkill(
            Long employeeId,
            Long skillId) {

        return employeeSkillRepository
                .findByEmployeeIdAndSkillId(
                        employeeId,
                        skillId);
    }

    // =========================================================
    // UPDATE EMPLOYEE SKILL
    // =========================================================

    public EmployeeSkill updateEmployeeSkill(
            Long id,
            EmployeeSkill updatedEmployeeSkill) {

        return employeeSkillRepository.findById(id)
                .map(employeeSkill -> {

                    employeeSkill.setEmployeeId(
                            updatedEmployeeSkill.getEmployeeId());

                    employeeSkill.setSkillId(
                            updatedEmployeeSkill.getSkillId());

                    employeeSkill.setProficiencyLevel(
                            updatedEmployeeSkill.getProficiencyLevel());

                    employeeSkill.setProficiencyScore(
                            updatedEmployeeSkill.getProficiencyScore());

                    return employeeSkillRepository.save(
                            employeeSkill);
                })
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee skill record not found"));
    }

    // =========================================================
    // DELETE EMPLOYEE SKILL
    // =========================================================

    public void deleteEmployeeSkill(Long id) {

        if (!employeeSkillRepository.existsById(id)) {
            throw new RuntimeException(
                    "Employee skill record not found");
        }

        employeeSkillRepository.deleteById(id);
    }
}