package com.team7.knowledge_gap_platform.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.service.RolePermissionService;

/**
 * Controller for role and permission management endpoints.
 * Provides information about available roles, their permissions, and role descriptions.
 */
@RestController
@RequestMapping("/roles")
public class RoleController {

    private final RolePermissionService rolePermissionService;

    public RoleController(RolePermissionService rolePermissionService) {
        this.rolePermissionService = rolePermissionService;
    }

    /**
     * Get all available roles.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<Map<String, Object>> getAllRoles() {
        Set<String> roles = rolePermissionService.getAllRoles();

        Map<String, Object> response = new HashMap<>();
        response.put("roles", roles);
        response.put("count", roles.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Get permissions for a specific role.
     */
    @GetMapping("/{role}/permissions")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<Map<String, Object>> getRolePermissions(@PathVariable String role) {
        Set<String> permissions = rolePermissionService.getPermissionsForRole(role);
        String description = rolePermissionService.getRoleDescription(role);

        Map<String, Object> response = new HashMap<>();
        response.put("role", role);
        response.put("description", description);
        response.put("permissions", permissions);
        response.put("permissionCount", permissions.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Get detailed role information including description.
     */
    @GetMapping("/{role}")
    public ResponseEntity<Map<String, Object>> getRoleDetails(@PathVariable String role) {
        String description = rolePermissionService.getRoleDescription(role);
        Set<String> permissions = rolePermissionService.getPermissionsForRole(role);

        Map<String, Object> response = new HashMap<>();
        response.put("role", role);
        response.put("description", description);
        response.put("permissions", permissions);

        return ResponseEntity.ok(response);
    }

    /**
     * Get all roles with their descriptions and permissions.
     */
    @GetMapping("/info/all")
    public ResponseEntity<Map<String, Object>> getAllRolesInfo() {
        Set<String> roles = rolePermissionService.getAllRoles();

        Map<String, Object> rolesInfo = new HashMap<>();
        for (String role : roles) {
            Map<String, Object> roleInfo = new HashMap<>();
            roleInfo.put("description", rolePermissionService.getRoleDescription(role));
            roleInfo.put("permissions", rolePermissionService.getPermissionsForRole(role));
            rolesInfo.put(role, roleInfo);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("roles", rolesInfo);

        return ResponseEntity.ok(response);
    }

    /**
     * Check if a user with a specific role has a permission.
     */
    @GetMapping("/{role}/has-permission/{permission}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<Map<String, Object>> checkPermission(
            @PathVariable String role,
            @PathVariable String permission) {

        boolean hasPermission = rolePermissionService.hasPermission(role, permission);

        Map<String, Object> response = new HashMap<>();
        response.put("role", role);
        response.put("permission", permission);
        response.put("hasPermission", hasPermission);

        return ResponseEntity.ok(response);
    }
}
