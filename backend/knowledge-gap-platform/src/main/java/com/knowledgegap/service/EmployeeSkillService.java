package com.knowledgegap.service;

import com.knowledgegap.dto.EmployeeSkillRequest;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.SkillRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeSkillService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;

    public EmployeeSkillService(
        EmployeeSkillRepository employeeSkillRepository,
        EmployeeRepository employeeRepository,
        SkillRepository skillRepository) {

    this.employeeSkillRepository = employeeSkillRepository;
    this.employeeRepository = employeeRepository;
    this.skillRepository = skillRepository;
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

    // Get skills using Employee Code (EMP001, EMP002...)
    public List<EmployeeSkill> getEmployeeSkillsByEmployee(String employeeId) {

        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return employeeSkillRepository.findByEmployee(employee);
    }
    public EmployeeSkill updateEmployeeSkill(Long id, EmployeeSkill updatedSkill) {

    EmployeeSkill employeeSkill = employeeSkillRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee Skill not found"));

    employeeSkill.setCurrentLevel(updatedSkill.getCurrentLevel());

    if (updatedSkill.getSkill() != null) {
        employeeSkill.setSkill(updatedSkill.getSkill());
    }

    return employeeSkillRepository.save(employeeSkill);
    
}
public EmployeeSkill addEmployeeSkill(EmployeeSkillRequest request) {

    Employee employee = employeeRepository.findByEmployeeId(request.getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    Skill skill = skillRepository.findById(request.getSkillId())
            .orElseThrow(() -> new RuntimeException("Skill not found"));

    EmployeeSkill employeeSkill = new EmployeeSkill();
    employeeSkill.setEmployee(employee);
    employeeSkill.setSkill(skill);
    employeeSkill.setCurrentLevel(request.getCurrentLevel());

    return employeeSkillRepository.save(employeeSkill);
}
}