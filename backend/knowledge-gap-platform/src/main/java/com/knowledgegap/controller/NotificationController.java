package com.knowledgegap.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Notification;
import com.knowledgegap.service.EmployeeService;
import com.knowledgegap.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final EmployeeService employeeService;

    public NotificationController(
            NotificationService notificationService,
            EmployeeService employeeService) {

        this.notificationService = notificationService;
        this.employeeService = employeeService;
    }

    // =========================================================
    // GET ALL NOTIFICATIONS FOR EMPLOYEE
    // EXISTING ENDPOINT - DO NOT REMOVE
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<List<Notification>>
    getEmployeeNotifications(
            @PathVariable String employeeIdentifier) {

        Optional<Employee> employee =
                employeeService.getEmployeeByIdentifier(
                        employeeIdentifier
                );

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                notificationService.getNotifications(
                        employee.get()
                )
        );
    }

    // =========================================================
    // GET UNREAD NOTIFICATIONS FOR EMPLOYEE
    // EXISTING ENDPOINT - DO NOT REMOVE
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}/unread")
    public ResponseEntity<List<Notification>>
    getUnreadNotifications(
            @PathVariable String employeeIdentifier) {

        Optional<Employee> employee =
                employeeService.getEmployeeByIdentifier(
                        employeeIdentifier
                );

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(
                        employee.get()
                )
        );
    }

    // =========================================================
    // DEPARTMENT HEAD
    // GET ALL NOTIFICATIONS FOR LOGGED-IN DEPARTMENT HEAD
    // =========================================================

    @GetMapping("/department-head")
    public ResponseEntity<List<Notification>>
    getDepartmentHeadNotifications(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();

        Optional<Employee> employee =
                employeeService.getEmployeeByEmail(email);

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                notificationService.getNotifications(
                        employee.get()
                )
        );
    }

    // =========================================================
    // DEPARTMENT HEAD
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    @GetMapping("/department-head/unread")
    public ResponseEntity<List<Notification>>
    getUnreadDepartmentHeadNotifications(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();

        Optional<Employee> employee =
                employeeService.getEmployeeByEmail(email);

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(
                        employee.get()
                )
        );
    }

    // =========================================================
    // MARK NOTIFICATION AS READ
    // EXISTING ENDPOINT - DO NOT REMOVE
    // =========================================================

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id) {

        try {

            Notification notification =
                    notificationService.markAsRead(id);

            return ResponseEntity.ok(notification);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}