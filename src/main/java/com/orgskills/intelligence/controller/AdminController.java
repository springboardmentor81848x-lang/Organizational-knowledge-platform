package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.auth.UserProfileResponse;
import com.orgskills.intelligence.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.orgskills.intelligence.dto.admin.AdminPasswordResetRequest;
import com.orgskills.intelligence.dto.admin.AuditLogResponse;
import com.orgskills.intelligence.dto.admin.EndpointPermissionResponse;
import com.orgskills.intelligence.dto.admin.JobAssignmentRequest;
import com.orgskills.intelligence.dto.admin.SystemHealthResponse;
import com.orgskills.intelligence.dto.admin.UpdateRoleRequest;
import com.orgskills.intelligence.dto.admin.UpdateUserStatusRequest;
import com.orgskills.intelligence.dto.auth.UserProfileResponse;
import com.orgskills.intelligence.dto.role.RoleRequest;
import com.orgskills.intelligence.dto.role.RoleResponse;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.AdminService;
import com.orgskills.intelligence.service.EndpointPermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final EndpointPermissionService endpointPermissionService;

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers(
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(adminService.getAllUsers(department));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserProfileResponse> updateUserRole(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        Long actorId = getActorId(authentication);
        return ResponseEntity.ok(adminService.updateUserRole(actorId, id, request));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserProfileResponse> updateUserStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        Long actorId = getActorId(authentication);
        return ResponseEntity.ok(adminService.updateUserStatus(actorId, id, request));
    }

    @PutMapping("/users/{id}/password-reset")
    public ResponseEntity<Void> resetUserPassword(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AdminPasswordResetRequest request) {
        Long actorId = getActorId(authentication);
        adminService.resetUserPassword(actorId, id, request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/job-assignment")
    public ResponseEntity<UserProfileResponse> updateUserJobAssignment(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody JobAssignmentRequest request) {
        Long actorId = getActorId(authentication);
        return ResponseEntity.ok(adminService.updateUserJobAssignment(actorId, id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(adminService.getAllRoles());
    }

    @PostMapping("/roles")
    public ResponseEntity<RoleResponse> createRole(
            Authentication authentication,
            @Valid @RequestBody RoleRequest request) {
        Long actorId = getActorId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createRole(actorId, request));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<RoleResponse> updateRole(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody RoleRequest request) {
        Long actorId = getActorId(authentication);
        return ResponseEntity.ok(adminService.updateRole(actorId, id, request));
    }

    /**
     * Which roles may reach which endpoints, read off the authorization rules the running
     * application is enforcing rather than from a separate list that could disagree with them.
     */
    @GetMapping("/permissions")
    public ResponseEntity<List<EndpointPermissionResponse>> getPermissions() {
        return ResponseEntity.ok(endpointPermissionService.getEndpointPermissions());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    @GetMapping("/system/health")
    public ResponseEntity<SystemHealthResponse> getSystemHealth() {
        return ResponseEntity.ok(adminService.getSystemHealth());
    }

    private Long getActorId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal p) {
            return p.getUserId();
        }
        return 1L;
    }
}
