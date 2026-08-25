package com.knowledgegap.controller;

import com.knowledgegap.dto.MentorRecommendationDTO;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.MentorAllocation;
import com.knowledgegap.service.EmployeeService;
import com.knowledgegap.service.MentorAllocationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mentor-allocations")
@CrossOrigin(origins = "*")
public class MentorAllocationController {

    private final MentorAllocationService allocationService;
    private final EmployeeService employeeService;

    public MentorAllocationController(
            MentorAllocationService allocationService,
            EmployeeService employeeService) {

        this.allocationService = allocationService;
        this.employeeService = employeeService;
    }

    // =========================================================
    // ADMIN / HR ALLOCATE / RECOMMEND MENTOR
    // =========================================================

    @PostMapping
    public ResponseEntity<?> allocateMentor(

            @RequestParam String employeeIdentifier,

            @RequestParam String mentorIdentifier,

            @RequestParam Long skillId,

            @RequestParam(required = false)
            String recommendedByIdentifier,

            @RequestParam(required = false)
            String reason) {

        try {

            // -------------------------------------------------
            // Find employee
            // -------------------------------------------------

            Optional<Employee> employee =
                    employeeService.getEmployeeByIdentifier(
                            employeeIdentifier
                    );

            if (employee.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Employee not found.");
            }

            // -------------------------------------------------
            // Find mentor
            // -------------------------------------------------

            Optional<Employee> mentor =
                    employeeService.getEmployeeByIdentifier(
                            mentorIdentifier
                    );

            if (mentor.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Mentor not found.");
            }

            // -------------------------------------------------
            // Find Admin / HR who recommended
            // -------------------------------------------------

            Employee recommendedBy = null;

            if (recommendedByIdentifier != null &&
                    !recommendedByIdentifier.isBlank()) {

                recommendedBy =
                        employeeService
                                .getEmployeeByIdentifier(
                                        recommendedByIdentifier
                                )
                                .orElse(null);
            }

            // -------------------------------------------------
            // Allocate mentor
            // -------------------------------------------------

            MentorAllocation allocation =
                    allocationService.allocateMentor(
                            employee.get(),
                            mentor.get(),
                            skillId,
                            recommendedBy,
                            reason
                    );

            return ResponseEntity.ok(allocation);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET MENTORS FOR A PARTICULAR SKILL
    //
    // Used by HR:
    //
    // Employee
    //    ↓
    // Knowledge Gap
    //    ↓
    // Skill
    //    ↓
    // Mentors having that skill
    // =========================================================

    @GetMapping("/mentors/skill/{skillId}")
    public ResponseEntity<?> getMentorsForSkill(
            @PathVariable Long skillId) {

        try {

            List<MentorRecommendationDTO> mentors =
                    allocationService.getMentorsForSkill(
                            skillId
                    );

            return ResponseEntity.ok(mentors);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // EMPLOYEE VIEW RECOMMENDED MENTORS
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<?> getEmployeeRecommendations(
            @PathVariable String employeeIdentifier) {

        Optional<Employee> employee =
                employeeService.getEmployeeByIdentifier(
                        employeeIdentifier
                );

        if (employee.isEmpty()) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        List<MentorRecommendationDTO> recommendations =
                allocationService.getEmployeeRecommendations(
                        employee.get()
                );

        return ResponseEntity.ok(
                recommendations
        );
    }

    // =========================================================
    // ADMIN / HR VIEW ALL ALLOCATIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<MentorAllocation>>
    getAllAllocations() {

        return ResponseEntity.ok(
                allocationService.getAllAllocations()
        );
    }

    // =========================================================
    // EMPLOYEE VIEW ALL THEIR ALLOCATIONS
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}/all")
    public ResponseEntity<?> getEmployeeAllocations(
            @PathVariable String employeeIdentifier) {

        Optional<Employee> employee =
                employeeService.getEmployeeByIdentifier(
                        employeeIdentifier
                );

        if (employee.isEmpty()) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                allocationService
                        .getAllocationsForEmployee(
                                employee.get()
                        )
        );
    }

    // =========================================================
    // MENTOR VIEW THEIR ALLOCATIONS
    // =========================================================

    @GetMapping("/mentor/{mentorIdentifier}")
    public ResponseEntity<?> getMentorAllocations(
            @PathVariable String mentorIdentifier) {

        Optional<Employee> mentor =
                employeeService.getEmployeeByIdentifier(
                        mentorIdentifier
                );

        if (mentor.isEmpty()) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                allocationService
                        .getAllocationsForMentor(
                                mentor.get()
                        )
        );
    }
}