package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.dto.SelfAssessmentRequest;
import com.knowledgegap.dto.SelfAssessmentResponse;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.service.EmployeeSkillService;
import com.knowledgegap.service.SelfAssessmentService;

@RestController
@RequestMapping("/api/self-assessment")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class SelfAssessmentController {

    private final SelfAssessmentService selfAssessmentService;
    private final EmployeeSkillService employeeSkillService;

    public SelfAssessmentController(
            SelfAssessmentService selfAssessmentService,
            EmployeeSkillService employeeSkillService) {

        this.selfAssessmentService = selfAssessmentService;
        this.employeeSkillService = employeeSkillService;
    }

    // =========================================================
    // GET EMPLOYEE SKILLS
    // =========================================================

    @GetMapping("/{employeeIdentifier}/skills")
    public ResponseEntity<List<EmployeeSkill>> getEmployeeSkills(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                employeeSkillService.getEmployeeSkillsByEmployee(
                        employeeIdentifier
                )
        );
    }

    // =========================================================
    // SUBMIT SELF ASSESSMENT
    // =========================================================

    @PostMapping("/submit/{employeeIdentifier}")
    public ResponseEntity<SelfAssessmentResponse> submitSelfAssessment(
            @PathVariable String employeeIdentifier,
            @RequestBody SelfAssessmentRequest request) {

        return ResponseEntity.ok(
                selfAssessmentService.submitSelfAssessment(
                        employeeIdentifier,
                        request
                )
        );
    }

    // =========================================================
    // GET EMPLOYEE'S SAVED SELF ASSESSMENT
    // =========================================================

    @GetMapping("/{employeeIdentifier}")
    public ResponseEntity<List<SelfAssessmentResponse.SelfSkillRatingResponse>>
            getSelfAssessment(
                    @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                selfAssessmentService.getSelfAssessment(
                        employeeIdentifier
                )
        );
    }
}