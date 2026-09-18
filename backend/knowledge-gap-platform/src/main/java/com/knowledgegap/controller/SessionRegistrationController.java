package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.SessionRegistration;
import com.knowledgegap.service.SessionRegistrationService;

@RestController
@RequestMapping("/api/session-registrations")
@CrossOrigin(origins = "http://localhost:5173")
public class SessionRegistrationController {

    private final SessionRegistrationService registrationService;

    public SessionRegistrationController(
            SessionRegistrationService registrationService) {

        this.registrationService = registrationService;
    }

    // =====================================================
    // REGISTER EMPLOYEE FOR SESSION
    // =====================================================

    @PostMapping("/session/{sessionId}/employee/{employeeId}")
    public ResponseEntity<SessionRegistration> registerForSession(
            @PathVariable Long sessionId,
            @PathVariable String employeeId) {

        SessionRegistration registration =
                registrationService.registerForSession(
                        sessionId,
                        employeeId);

        return new ResponseEntity<>(
                registration,
                HttpStatus.CREATED);
    }

    // =====================================================
    // CANCEL EMPLOYEE REGISTRATION
    // =====================================================

    @PutMapping("/session/{sessionId}/employee/{employeeId}/cancel")
    public ResponseEntity<SessionRegistration> cancelRegistration(
            @PathVariable Long sessionId,
            @PathVariable String employeeId) {

        return ResponseEntity.ok(
                registrationService.cancelRegistration(
                        sessionId,
                        employeeId));
    }

    // =====================================================
    // GET ALL REGISTRATIONS FOR SESSION
    // MENTOR USES THIS
    // =====================================================

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<SessionRegistration>>
    getRegistrationsBySession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                registrationService.getSessionRegistrations(
                        sessionId));
    }

    // =====================================================
    // GET ALL REGISTRATIONS FOR EMPLOYEE
    // =====================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<SessionRegistration>>
    getRegistrationsByEmployee(
            @PathVariable String employeeId) {

        return ResponseEntity.ok(
                registrationService.getEmployeeRegistrations(
                        employeeId));
    }

    // =====================================================
    // GET ACTIVE REGISTRATIONS FOR SESSION
    // =====================================================

    @GetMapping("/session/{sessionId}/active")
    public ResponseEntity<List<SessionRegistration>>
    getActiveRegistrations(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                registrationService
                        .getActiveSessionRegistrations(
                                sessionId));
    }

    // =====================================================
    // GET REGISTERED PARTICIPANT COUNT
    // =====================================================

    @GetMapping("/session/{sessionId}/count")
    public ResponseEntity<Long> getRegisteredCount(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                registrationService
                        .getRegisteredCount(sessionId));
    }

    // =====================================================
    // CHECK EMPLOYEE REGISTRATION
    // =====================================================

    @GetMapping("/session/{sessionId}/employee/{employeeId}/registered")
    public ResponseEntity<Boolean> isEmployeeRegistered(
            @PathVariable Long sessionId,
            @PathVariable String employeeId) {

        return ResponseEntity.ok(
                registrationService.isEmployeeRegistered(
                        sessionId,
                        employeeId));
    }

    // =====================================================
    // MARK ATTENDANCE
    // MENTOR USES THIS
    // =====================================================

    @PutMapping("/{registrationId}/attendance")
    public ResponseEntity<SessionRegistration> markAttendance(
            @PathVariable Long registrationId,
            @RequestParam Boolean attended) {

        return ResponseEntity.ok(
                registrationService.markAttendance(
                        registrationId,
                        attended));
    }

    // =====================================================
    // GET ONE REGISTRATION
    // =====================================================

    @GetMapping("/{registrationId}")
    public ResponseEntity<SessionRegistration>
    getRegistrationById(
            @PathVariable Long registrationId) {

        return ResponseEntity.ok(
                registrationService
                        .getRegistrationById(
                                registrationId));
    }
}