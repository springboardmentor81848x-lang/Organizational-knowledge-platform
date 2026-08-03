package com.team7.knowledge_gap_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository;

@Service
public class EmployeeSkillService {

    private final EmployeeSkillRepository employeeSkillRepository;

    public EmployeeSkillService(EmployeeSkillRepository employeeSkillRepository) {
        this.employeeSkillRepository = employeeSkillRepository;
    }

    public EmployeeSkill createEmployeeSkill(EmployeeSkill employeeSkill) {
        return employeeSkillRepository.save(employeeSkill);
    }

    public List<EmployeeSkill> getAllEmployeeSkills() {
        return employeeSkillRepository.findAll();
    }

    public Optional<EmployeeSkill> getEmployeeSkillById(Long id) {
        return employeeSkillRepository.findById(id);
    }

    public EmployeeSkill updateEmployeeSkill(Long id, EmployeeSkill updatedEmployeeSkill) {
        return employeeSkillRepository.findById(id)
                .map(employeeSkill -> {
                    employeeSkill.setEmployeeId(updatedEmployeeSkill.getEmployeeId());
                    employeeSkill.setSkillId(updatedEmployeeSkill.getSkillId());
                    employeeSkill.setProficiencyLevel(updatedEmployeeSkill.getProficiencyLevel());

                    return employeeSkillRepository.save(employeeSkill);
                })
                .orElseThrow(() -> new RuntimeException("Employee skill record not found"));
    }

    public void deleteEmployeeSkill(Long id) {
        employeeSkillRepository.deleteById(id);
    }
}