package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.service.EmployeeSkillService;

@RestController
@RequestMapping("/employee-skills")
public class EmployeeSkillController {

    private final EmployeeSkillService employeeSkillService;

    public EmployeeSkillController(
            EmployeeSkillService employeeSkillService) {

        this.employeeSkillService = employeeSkillService;
    }

    // =========================================================
    // CREATE EMPLOYEE SKILL
    // =========================================================

    @PostMapping
    public ResponseEntity<EmployeeSkill> createEmployeeSkill(
            @RequestBody EmployeeSkill employeeSkill) {

        return ResponseEntity.ok(
                employeeSkillService.createEmployeeSkill(
                        employeeSkill));
    }

    // =========================================================
    // GET ALL EMPLOYEE SKILLS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<EmployeeSkill>>
    getAllEmployeeSkills() {

        return ResponseEntity.ok(
                employeeSkillService.getAllEmployeeSkills());
    }

    // =========================================================
    // GET SKILLS FOR ONE EMPLOYEE
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeSkill>>
    getEmployeeSkillsByEmployeeId(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                employeeSkillService
                        .getEmployeeSkillsByEmployeeId(
                                employeeId));
    }

    // =========================================================
    // GET ONE EMPLOYEE SKILL RECORD BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeSkill>
    getEmployeeSkillById(
            @PathVariable Long id) {

        return employeeSkillService
                .getEmployeeSkillById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================
    // GET EMPLOYEE SKILL BY EMPLOYEE ID + SKILL ID
    // =========================================================

    @GetMapping(
            "/employee/{employeeId}/skill/{skillId}")
    public ResponseEntity<EmployeeSkill>
    getEmployeeSkillByEmployeeAndSkill(
            @PathVariable Long employeeId,
            @PathVariable Long skillId) {

        return employeeSkillService
                .getEmployeeSkillByEmployeeAndSkill(
                        employeeId,
                        skillId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================
    // UPDATE EMPLOYEE SKILL
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeSkill>
    updateEmployeeSkill(
            @PathVariable Long id,
            @RequestBody EmployeeSkill employeeSkill) {

        return ResponseEntity.ok(
                employeeSkillService
                        .updateEmployeeSkill(
                                id,
                                employeeSkill));
    }

    // =========================================================
    // DELETE EMPLOYEE SKILL
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteEmployeeSkill(
            @PathVariable Long id) {

        employeeSkillService.deleteEmployeeSkill(id);

        return ResponseEntity.ok(
                "Employee skill record deleted successfully!");
    }
}