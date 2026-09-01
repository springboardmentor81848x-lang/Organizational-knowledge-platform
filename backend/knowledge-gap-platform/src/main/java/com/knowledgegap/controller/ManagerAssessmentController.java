package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.dto.ManagerAssessmentRequest;
import com.knowledgegap.dto.ManagerAssessmentResponse;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.service.ManagerAssessmentService;

@RestController
@RequestMapping("/api/manager-assessment")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class ManagerAssessmentController {

    private final ManagerAssessmentService managerAssessmentService;

    public ManagerAssessmentController(
            ManagerAssessmentService managerAssessmentService) {

        this.managerAssessmentService =
                managerAssessmentService;
    }

    // =========================================================
    // GET EMPLOYEE SKILLS
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}/skills")
    public ResponseEntity<?> getEmployeeSkills(
            @PathVariable String employeeIdentifier) {

        try {

            System.out.println(
                    "=============================================="
            );

            System.out.println(
                    "MANAGER ASSESSMENT - GET EMPLOYEE SKILLS"
            );

            System.out.println(
                    "Employee Identifier: "
                            + employeeIdentifier
            );

            System.out.println(
                    "=============================================="
            );

            List<EmployeeSkill> employeeSkills =
                    managerAssessmentService
                            .getEmployeeSkills(
                                    employeeIdentifier
                            );

            System.out.println(
                    "Employee skills found: "
                            + employeeSkills.size()
            );

            return ResponseEntity.ok(employeeSkills);

        } catch (Exception e) {

            System.err.println(
                    "=============================================="
            );

            System.err.println(
                    "ERROR LOADING EMPLOYEE SKILLS"
            );

            System.err.println(
                    "Employee Identifier: "
                            + employeeIdentifier
            );

            System.err.println(
                    "Exception: "
                            + e.getClass().getName()
            );

            System.err.println(
                    "Message: "
                            + e.getMessage()
            );

            e.printStackTrace();

            System.err.println(
                    "=============================================="
            );

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Failed to load employee skills: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // SUBMIT MANAGER ASSESSMENT
    // =========================================================

    @PostMapping("/submit")
    public ResponseEntity<?> submitManagerAssessment(
            @RequestBody ManagerAssessmentRequest request) {

        try {

            System.out.println(
                    "================================================"
            );

            System.out.println(
                    "MANAGER ASSESSMENT SUBMISSION"
            );

            System.out.println(
                    "================================================"
            );

            // -------------------------------------------------
            // PRINT REQUEST INFORMATION
            // -------------------------------------------------

            if (request == null) {

                System.err.println(
                        "Request body is NULL"
                );

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Manager assessment request cannot be null."
                        );
            }

            System.out.println(
                    "Employee Identifier: "
                            + request.getEmployeeIdentifier()
            );

            System.out.println(
                    "Manager Identifier: "
                            + request.getManagerIdentifier()
            );

            System.out.println(
                    "Assessment ID: "
                            + request.getAssessmentId()
            );

            if (request.getSkills() == null) {

                System.out.println(
                        "Skills: NULL"
                );

            } else {

                System.out.println(
                        "Number of Skills: "
                                + request.getSkills().size()
                );

                request.getSkills().forEach(skill -> {

                    System.out.println(
                            "Skill: "
                                    + skill.getSkillName()
                                    + " | Rating: "
                                    + skill.getRating()
                    );

                });
            }

            System.out.println(
                    "================================================"
            );

            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (request.getEmployeeIdentifier() == null
                    || request.getEmployeeIdentifier()
                            .trim()
                            .isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Employee identifier is required."
                        );
            }

            if (request.getManagerIdentifier() == null
                    || request.getManagerIdentifier()
                            .trim()
                            .isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Manager identifier is required."
                        );
            }

            if (request.getSkills() == null
                    || request.getSkills().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "At least one skill rating is required."
                        );
            }

            // -------------------------------------------------
            // SUBMIT TO SERVICE
            // -------------------------------------------------

            ManagerAssessmentResponse response =
                    managerAssessmentService
                            .submitManagerAssessment(
                                    request
                            );

            System.out.println(
                    "================================================"
            );

            System.out.println(
                    "MANAGER ASSESSMENT SUCCESSFULLY COMPLETED"
            );

            System.out.println(
                    "================================================"
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            // -------------------------------------------------
            // BAD REQUEST
            // -------------------------------------------------

            System.err.println(
                    "================================================"
            );

            System.err.println(
                    "MANAGER ASSESSMENT - INVALID REQUEST"
            );

            System.err.println(
                    "Message: "
                            + e.getMessage()
            );

            e.printStackTrace();

            System.err.println(
                    "================================================"
            );

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Invalid manager assessment request: "
                                    + e.getMessage()
                    );

        } catch (Exception e) {

            // -------------------------------------------------
            // REAL SERVER ERROR
            // -------------------------------------------------

            System.err.println(
                    "================================================"
            );

            System.err.println(
                    "MANAGER ASSESSMENT - SERVER ERROR"
            );

            System.err.println(
                    "================================================"
            );

            System.err.println(
                    "Employee Identifier: "
                            + (
                                request != null
                                    ? request.getEmployeeIdentifier()
                                    : "NULL"
                              )
            );

            System.err.println(
                    "Manager Identifier: "
                            + (
                                request != null
                                    ? request.getManagerIdentifier()
                                    : "NULL"
                              )
            );

            System.err.println(
                    "Exception Type: "
                            + e.getClass().getName()
            );

            System.err.println(
                    "Exception Message: "
                            + e.getMessage()
            );

            System.err.println(
                    "FULL STACK TRACE:"
            );

            e.printStackTrace();

            System.err.println(
                    "================================================"
            );

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Manager assessment failed: "
                                    + (
                                        e.getMessage() != null
                                            ? e.getMessage()
                                            : e.getClass().getSimpleName()
                                      )
                    );
        }
    }

    // =========================================================
    // GLOBAL EXCEPTION HANDLER
    // =========================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(
            Exception e) {

        System.err.println(
                "================================================"
        );

        System.err.println(
                "UNHANDLED MANAGER ASSESSMENT EXCEPTION"
        );

        System.err.println(
                "Exception Type: "
                        + e.getClass().getName()
        );

        System.err.println(
                "Message: "
                        + e.getMessage()
        );

        e.printStackTrace();

        System.err.println(
                "================================================"
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        "Server error: "
                                + (
                                    e.getMessage() != null
                                        ? e.getMessage()
                                        : e.getClass().getSimpleName()
                                  )
                );
    }
}