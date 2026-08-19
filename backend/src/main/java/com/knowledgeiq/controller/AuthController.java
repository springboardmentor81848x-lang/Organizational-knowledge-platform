package com.knowledgeiq.controller;

import com.knowledgeiq.dto.AuthRequest;
import com.knowledgeiq.dto.AuthResponse;
import com.knowledgeiq.dto.RegistrationRequest;
import com.knowledgeiq.model.User;
import com.knowledgeiq.model.Organization;
import com.knowledgeiq.model.Department;
import com.knowledgeiq.service.AuthService;
import com.knowledgeiq.repository.OrganizationRepository;
import com.knowledgeiq.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private com.knowledgeiq.repository.UserRepository userRepository;

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "knowledgeiq-backend");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(health);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.authenticateUser(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody com.knowledgeiq.dto.RegistrationRequest request) {
        try {
            AuthResponse response = authService.registerUser(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody com.knowledgeiq.dto.GoogleAuthRequest request) {
        try {
            AuthResponse response = authService.authenticateWithGoogle(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }

        String userIdStr = (String) authentication.getPrincipal();
        User user = authService.getUserById(userIdStr);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        userData.put("fullName", user.getFullName());
        userData.put("systemRole", user.getSystemRole().name());
        userData.put("avatarUrl", user.getAvatarUrl());
        userData.put("department", user.getDepartment() != null ? user.getDepartment().getName() : null);
        userData.put("title", user.getRole() != null ? user.getRole().getTitle() : null);
        userData.put("company", user.getCompany());
        userData.put("organizationId", user.getOrganization() != null ? user.getOrganization().getId() : null);
        userData.put("bio", user.getBio());
        userData.put("experience", user.getExperience());
        userData.put("education", user.getEducation());

        // Resolve Manager
        User manager = user.getManager();
        if (manager == null && user.getDepartment() != null && user.getOrganization() != null) {
            manager = userRepository.findFirstBySystemRoleAndOrganizationIdAndDepartmentId(
                    com.knowledgeiq.model.SystemRole.MANAGER, user.getOrganization().getId(), user.getDepartment().getId()
            ).orElse(null);
        }

        if (manager != null) {
            Map<String, Object> managerData = new HashMap<>();
            managerData.put("fullName", manager.getFullName());
            managerData.put("email", manager.getEmail());
            managerData.put("roleTitle", manager.getRoleTitle());
            userData.put("manager", managerData);
        } else {
            userData.put("manager", null);
        }

        return ResponseEntity.ok(userData);
    }

    @GetMapping("/organizations")
    public ResponseEntity<?> getOrganizations() {
        return ResponseEntity.ok(authService.getManagerCompanies());
    }

    @GetMapping("/departments")
    public ResponseEntity<?> getDepartmentsByOrganization(@RequestParam("orgName") String orgName) {
        if (orgName == null || orgName.isBlank()) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        Optional<Organization> orgOpt = organizationRepository.findByNameIgnoreCase(orgName.trim());
        if (orgOpt.isEmpty()) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        java.util.List<Department> depts = departmentRepository.findByOrganizationId(orgOpt.get().getId());
        java.util.List<String> deptNames = depts.stream().map(Department::getName).distinct().collect(Collectors.toList());
        return ResponseEntity.ok(deptNames);
    }

    @PutMapping(value = "/profile", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProfileMultipart(
            @RequestPart("profileData") Map<String, Object> profileData,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return handleProfileUpdate(profileData);
    }

    @PutMapping(value = "/profile", consumes = {"application/json"})
    public ResponseEntity<?> updateProfileJson(@RequestBody Map<String, Object> profileData) {
        return handleProfileUpdate(profileData);
    }

    private ResponseEntity<?> handleProfileUpdate(Map<String, Object> profileData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }

        String userIdStr = (String) authentication.getPrincipal();
        User user = authService.updateUserProfile(userIdStr, profileData);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        userData.put("fullName", user.getFullName());
        userData.put("systemRole", user.getSystemRole().name());
        userData.put("avatarUrl", user.getAvatarUrl());
        userData.put("bio", user.getBio());
        userData.put("company", user.getCompany());
        userData.put("experience", user.getExperience());
        userData.put("education", user.getEducation());
        userData.put("department", user.getDepartment() != null ? user.getDepartment().getName() : null);
        userData.put("title", user.getRole() != null ? user.getRole().getTitle() : null);

        return ResponseEntity.ok(userData);
    }
}
