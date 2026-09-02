package com.knowledgegap.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
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
    // GET UNREAD NOTIFICATIONS
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
    // MARK NOTIFICATION AS READ
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