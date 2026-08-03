package com.team7.knowledge_gap_platform.controller;

import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.service.EmployeeSkillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee-skills")
public class EmployeeSkillController {

    private final EmployeeSkillService employeeSkillService;

    public EmployeeSkillController(EmployeeSkillService employeeSkillService) {
        this.employeeSkillService = employeeSkillService;
    }

    @PostMapping
    public EmployeeSkill createEmployeeSkill(
            @RequestBody EmployeeSkill employeeSkill) {

        return employeeSkillService.createEmployeeSkill(employeeSkill);
    }

    @GetMapping
    public List<EmployeeSkill> getAllEmployeeSkills() {
        return employeeSkillService.getAllEmployeeSkills();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeSkill> getEmployeeSkillById(
            @PathVariable Long id) {

        return employeeSkillService.getEmployeeSkillById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public EmployeeSkill updateEmployeeSkill(
            @PathVariable Long id,
            @RequestBody EmployeeSkill employeeSkill) {

        return employeeSkillService.updateEmployeeSkill(id, employeeSkill);
    }

    @DeleteMapping("/{id}")
    public String deleteEmployeeSkill(@PathVariable Long id) {
        employeeSkillService.deleteEmployeeSkill(id);
        return "Employee skill record deleted successfully!";
    }
}