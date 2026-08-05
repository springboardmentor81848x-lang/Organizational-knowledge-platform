package com.knowledgegap.service;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.repository.EmployeeSkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeSkillService {

    private final EmployeeSkillRepository employeeSkillRepository;

    public EmployeeSkillService(EmployeeSkillRepository employeeSkillRepository) {
        this.employeeSkillRepository = employeeSkillRepository;
    }

    public EmployeeSkill saveEmployeeSkill(EmployeeSkill employeeSkill) {
        return employeeSkillRepository.save(employeeSkill);
    }

    public List<EmployeeSkill> getAllEmployeeSkills() {
        return employeeSkillRepository.findAll();
    }

    public Optional<EmployeeSkill> getEmployeeSkillById(Long id) {
        return employeeSkillRepository.findById(id);
    }

    public List<EmployeeSkill> getSkillsByEmployee(Employee employee) {
        return employeeSkillRepository.findByEmployee(employee);
    }

    public void deleteEmployeeSkill(Long id) {
        employeeSkillRepository.deleteById(id);
    }
}