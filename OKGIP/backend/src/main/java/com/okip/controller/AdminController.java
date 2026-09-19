package com.okip.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.admin.CreateUserRequestDTO;
import com.okip.dto.admin.CreateUserResponseDTO;
import com.okip.enums.AccountStatus;
import com.okip.service.admin.AdminService;
import com.okip.dto.notification.NotificationResponseDTO;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/users")
    public ResponseEntity<CreateUserResponseDTO> createUser(@RequestBody CreateUserRequestDTO request) {
        return new ResponseEntity<>(adminService.createUser(request), HttpStatus.CREATED);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() { return ResponseEntity.ok(adminService.getDashboard()); }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> users() { return ResponseEntity.ok(adminService.getUsers()); }

    @PutMapping("/users/{employeeId}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long employeeId, @RequestParam AccountStatus status) {
        return ResponseEntity.ok(adminService.updateUserStatus(employeeId, status));
    }

    @PutMapping("/users/{employeeId}/role/{roleId}")
    public ResponseEntity<Map<String, Object>> updateRole(@PathVariable Long employeeId, @PathVariable Long roleId) {
        return ResponseEntity.ok(adminService.updateUserRole(employeeId, roleId));
    }
    @GetMapping("/notifications")
public ResponseEntity<List<NotificationResponseDTO>> notifications() {
    return ResponseEntity.ok(adminService.getNotifications());
}

    @GetMapping("/roles")
    public ResponseEntity<List<Map<String, Object>>> roles() { return ResponseEntity.ok(adminService.getRoles()); }

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> departments() { return ResponseEntity.ok(adminService.getDepartments()); }

    @GetMapping("/skills")
    public ResponseEntity<List<Map<String, Object>>> skills() { return ResponseEntity.ok(adminService.getSkills()); }

    @GetMapping("/job-roles")
    public ResponseEntity<List<Map<String, Object>>> jobRoles() { return ResponseEntity.ok(adminService.getJobRoles()); }

    @GetMapping("/gaps")
    public ResponseEntity<List<Map<String, Object>>> gaps() { return ResponseEntity.ok(adminService.getGaps()); }

    @GetMapping("/assessments")
    public ResponseEntity<List<Map<String, Object>>> assessments() { return ResponseEntity.ok(adminService.getAssessments()); }

    @GetMapping("/mentorships")
    public ResponseEntity<List<Map<String, Object>>> mentorships() { return ResponseEntity.ok(adminService.getMentorships()); }

    @GetMapping("/system/health")
    public ResponseEntity<Map<String, Object>> systemHealth() { return ResponseEntity.ok(adminService.getSystemHealth()); }

    @GetMapping("/system/configuration")
    public ResponseEntity<Map<String, Object>> systemConfiguration() { return ResponseEntity.ok(adminService.getSystemConfiguration()); }
}
