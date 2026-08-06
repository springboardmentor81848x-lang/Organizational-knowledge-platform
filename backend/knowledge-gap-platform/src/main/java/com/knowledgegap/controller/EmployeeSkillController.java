package com.knowledgegap.controller;

import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.service.EmployeeSkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employee-skills")
@CrossOrigin(origins = "*")
public class EmployeeSkillController {

    private final EmployeeSkillService employeeSkillService;

    public EmployeeSkillController(EmployeeSkillService employeeSkillService) {
        this.employeeSkillService = employeeSkillService;
    }

    // Create Employee Skill
    @PostMapping
    public EmployeeSkill saveEmployeeSkill(@RequestBody EmployeeSkill employeeSkill) {
        return employeeSkillService.saveEmployeeSkill(employeeSkill);
    }

    // Get All Employee Skills
    @GetMapping
    public List<EmployeeSkill> getAllEmployeeSkills() {
        return employeeSkillService.getAllEmployeeSkills();
    }

    // Get Employee Skill by ID
    @GetMapping("/{id}")
    public Optional<EmployeeSkill> getEmployeeSkillById(@PathVariable Long id) {
        return employeeSkillService.getEmployeeSkillById(id);
    }

    // Delete Employee Skill
    @DeleteMapping("/{id}")
    public String deleteEmployeeSkill(@PathVariable Long id) {
        employeeSkillService.deleteEmployeeSkill(id);
        return "Employee Skill deleted successfully!";
    }
    @GetMapping("/employee/{employeeId}")
public List<EmployeeSkill> getEmployeeSkillsByEmployee(@PathVariable Long employeeId) {
    return employeeSkillService.getEmployeeSkillsByEmployee(employeeId);
}
}