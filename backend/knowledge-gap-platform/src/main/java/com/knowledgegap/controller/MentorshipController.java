package com.knowledgegap.controller;

import com.knowledgegap.dto.MentorRecommendationDTO;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Mentorship;
import com.knowledgegap.service.EmployeeService;
import com.knowledgegap.service.MentorshipService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mentorships")
@CrossOrigin(origins = "*")
public class MentorshipController {

    private final MentorshipService mentorshipService;
    private final EmployeeService employeeService;

    public MentorshipController(
            MentorshipService mentorshipService,
            EmployeeService employeeService) {

        this.mentorshipService = mentorshipService;
        this.employeeService = employeeService;
    }

    // =========================================================
    // GET ALL MENTORSHIPS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Mentorship>>
    getAllMentorships() {

        return ResponseEntity.ok(
                mentorshipService.getAllMentorships()
        );
    }

    // =========================================================
    // GET MENTORSHIPS FOR EMPLOYEE / MENTEE
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<List<Mentorship>>
    getEmployeeMentorships(
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
                mentorshipService
                        .getMentorshipsByMentee(
                                employee.get()
                        )
        );
    }

    // =========================================================
    // GET MENTOR REQUESTS
    // =========================================================

    @GetMapping("/mentor/{employeeIdentifier}")
    public ResponseEntity<List<Mentorship>>
    getMentorRequests(
            @PathVariable String employeeIdentifier) {

        Optional<Employee> mentor =
                employeeService.getEmployeeByIdentifier(
                        employeeIdentifier
                );

        if (mentor.isEmpty()) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                mentorshipService
                        .getMentorshipsByMentor(
                                mentor.get()
                        )
        );
    }

    // =========================================================
    // GET MENTOR RECOMMENDATIONS
    // =========================================================

    @GetMapping("/recommendations/{employeeIdentifier}")
    public ResponseEntity<List<MentorRecommendationDTO>>
    getMentorRecommendations(
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

        List<MentorRecommendationDTO> mentors =
                mentorshipService
                        .getMentorRecommendations(
                                employee.get()
                        );

        return ResponseEntity.ok(
                mentors
        );
    }

    // =========================================================
    // CREATE MENTORSHIP REQUEST
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createMentorship(
            @RequestParam String menteeIdentifier,
            @RequestParam String mentorIdentifier,
            @RequestParam Long skillId,
            @RequestParam(required = false) String goal) {

        try {

            // -------------------------------------------------
            // Find mentee
            // -------------------------------------------------

            Optional<Employee> mentee =
                    employeeService
                            .getEmployeeByIdentifier(
                                    menteeIdentifier
                            );

            if (mentee.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Mentee employee not found."
                        );
            }

            // -------------------------------------------------
            // Find mentor
            // -------------------------------------------------

            Optional<Employee> mentor =
                    employeeService
                            .getEmployeeByIdentifier(
                                    mentorIdentifier
                            );

            if (mentor.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Mentor employee not found."
                        );
            }

            // -------------------------------------------------
            // Create mentorship
            // -------------------------------------------------

            Mentorship mentorship =
                    mentorshipService.createMentorship(
                            mentee.get(),
                            mentor.get(),
                            skillId,
                            goal
                    );

            return ResponseEntity.ok(
                    mentorship
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    // =========================================================
    // ACCEPT MENTORSHIP
    // =========================================================

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptMentorship(
            @PathVariable Long id) {

        try {

            Mentorship mentorship =
                    mentorshipService
                            .acceptMentorship(id);

            return ResponseEntity.ok(
                    mentorship
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    // =========================================================
    // REJECT MENTORSHIP
    // =========================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectMentorship(
            @PathVariable Long id) {

        try {

            Mentorship mentorship =
                    mentorshipService
                            .rejectMentorship(id);

            return ResponseEntity.ok(
                    mentorship
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    // =========================================================
    // ACTIVATE MENTORSHIP
    // =========================================================

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateMentorship(
            @PathVariable Long id) {

        try {

            Mentorship mentorship =
                    mentorshipService
                            .activateMentorship(id);

            return ResponseEntity.ok(
                    mentorship
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    // =========================================================
    // COMPLETE MENTORSHIP
    // =========================================================

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeMentorship(
            @PathVariable Long id) {

        try {

            Mentorship mentorship =
                    mentorshipService
                            .completeMentorship(id);

            return ResponseEntity.ok(
                    mentorship
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }
}