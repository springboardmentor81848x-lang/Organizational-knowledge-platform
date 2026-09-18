package com.knowledgegap.controller;

import com.knowledgegap.dto.MentorRecommendationDTO;
import com.knowledgegap.dto.MentorshipResponse;
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
    public ResponseEntity<List<MentorshipResponse>>
    getAllMentorships() {

        List<Mentorship> mentorships =
                mentorshipService.getAllMentorships();

        return ResponseEntity.ok(
                mentorships.stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    // =========================================================
    // GET MENTORSHIPS FOR EMPLOYEE / MENTEE
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<List<MentorshipResponse>>
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

        List<Mentorship> mentorships =
                mentorshipService.getMentorshipsByMentee(
                        employee.get()
                );

        return ResponseEntity.ok(
                mentorships.stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    // =========================================================
    // GET MENTOR REQUESTS
    // =========================================================

    @GetMapping("/mentor/{employeeIdentifier}")
    public ResponseEntity<List<MentorshipResponse>>
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

        List<Mentorship> mentorships =
                mentorshipService.getMentorshipsByMentor(
                        mentor.get()
                );

        return ResponseEntity.ok(
                mentorships.stream()
                        .map(this::toResponse)
                        .toList()
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
                mentorshipService.getMentorRecommendations(
                        employee.get()
                );

        return ResponseEntity.ok(mentors);
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
                    employeeService.getEmployeeByIdentifier(
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
                    employeeService.getEmployeeByIdentifier(
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
                    toResponse(mentorship)
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
                    toResponse(mentorship)
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
                    toResponse(mentorship)
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
                    toResponse(mentorship)
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
                    toResponse(mentorship)
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
    // CONVERT MENTORSHIP ENTITY TO SAFE RESPONSE DTO
    // =========================================================

    private MentorshipResponse toResponse(
            Mentorship mentorship) {

        Employee mentee = mentorship.getMentee();
        Employee mentor = mentorship.getMentor();

        String menteeName = null;

        if (mentee != null) {

            String firstName =
                    mentee.getFirstName() != null
                            ? mentee.getFirstName()
                            : "";

            String lastName =
                    mentee.getLastName() != null
                            ? mentee.getLastName()
                            : "";

            menteeName =
                    (firstName + " " + lastName).trim();
        }

        String mentorName = null;

        if (mentor != null) {

            String firstName =
                    mentor.getFirstName() != null
                            ? mentor.getFirstName()
                            : "";

            String lastName =
                    mentor.getLastName() != null
                            ? mentor.getLastName()
                            : "";

            mentorName =
                    (firstName + " " + lastName).trim();
        }

        Long skillId = null;
        String skillName = null;

        if (mentorship.getSkill() != null) {

            skillId =
                    mentorship.getSkill().getId();

            skillName =
                    mentorship.getSkill().getSkillName();
        }

        return new MentorshipResponse(
                mentorship.getId(),

                mentee != null
                        ? mentee.getEmployeeId()
                        : null,

                menteeName,

                mentor != null
                        ? mentor.getEmployeeId()
                        : null,

                mentorName,

                skillId,
                skillName,

                mentorship.getGoal(),
                mentorship.getStatus(),
                mentorship.getStartDate(),
                mentorship.getEndDate()
        );
    }
}