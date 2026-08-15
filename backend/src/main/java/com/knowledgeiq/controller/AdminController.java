package com.knowledgeiq.controller;

import com.knowledgeiq.model.Organization;
import com.knowledgeiq.model.SystemRole;
import com.knowledgeiq.model.User;
import com.knowledgeiq.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard(Authentication auth) {
        UUID adminId = UUID.fromString((String) auth.getPrincipal());
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Organization org = admin.getOrganization();
        Map<String, Object> data = new HashMap<>();

        data.put("name", admin.getFullName());
        data.put("title", admin.getRoleTitle() != null ? admin.getRoleTitle() : "Platform Administrator");
        data.put("initials", admin.getFullName() != null && admin.getFullName().length() > 0 ?
                admin.getFullName().substring(0, 1).toUpperCase() : "AD");

        if (org == null) {
            data.put("totalUsers", 0);
            data.put("activeSessions", 0);
            data.put("uptime", "99.99%");
            data.put("pendingApprovals", 0);
            data.put("roleDist", Collections.emptyList());
            data.put("users", Collections.emptyList());
            data.put("roles", Collections.emptyList());
            data.put("audit", Collections.emptyList());
            return ResponseEntity.ok(data);
        }

        UUID orgId = org.getId();
        List<User> orgUsers = userRepository.findByOrganizationId(orgId);

        data.put("totalUsers", orgUsers.size());
        data.put("activeSessions", orgUsers.stream().filter(User::getIsActive).count());
        data.put("uptime", "99.98%");
        data.put("pendingApprovals", 0);

        // Role distribution statistics
        Map<SystemRole, Long> roleCounts = orgUsers.stream()
                .collect(Collectors.groupingBy(User::getSystemRole, Collectors.counting()));

        List<Map<String, Object>> roleDist = Arrays.asList(
                Map.of("name", "Employee", "value", roleCounts.getOrDefault(SystemRole.EMPLOYEE, 0L), "color", "#65D46E"),
                Map.of("name", "Manager", "value", roleCounts.getOrDefault(SystemRole.MANAGER, 0L), "color", "#818CF8"),
                Map.of("name", "HR", "value", roleCounts.getOrDefault(SystemRole.HR_SPECIALIST, 0L), "color", "#F59E0B"),
                Map.of("name", "Admin", "value", roleCounts.getOrDefault(SystemRole.SYSTEM_ADMIN, 0L), "color", "#3B82F6")
        );
        data.put("roleDist", roleDist);

        // Users mapping
        List<Map<String, String>> usersList = orgUsers.stream()
                .map(u -> {
                    Map<String, String> m = new HashMap<>();
                    m.put("id", u.getId().toString());
                    m.put("name", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("role", u.getSystemRole().toString());
                    m.put("status", u.getIsActive() ? "Active" : "Suspended");
                    m.put("last", "Active");
                    return m;
                }).collect(Collectors.toList());
        data.put("users", usersList);

        // System configuration status
        List<Map<String, Object>> rolesSummary = Arrays.asList(
                Map.of("name", "Admin", "users", roleCounts.getOrDefault(SystemRole.SYSTEM_ADMIN, 0L), "perms", "Full system access"),
                Map.of("name", "HR", "users", roleCounts.getOrDefault(SystemRole.HR_SPECIALIST, 0L), "perms", "People, reports, org data"),
                Map.of("name", "Manager", "users", roleCounts.getOrDefault(SystemRole.MANAGER, 0L), "perms", "Team dashboards, approvals"),
                Map.of("name", "Employee", "users", roleCounts.getOrDefault(SystemRole.EMPLOYEE, 0L), "perms", "Self-service learning")
        );
        data.put("roles", rolesSummary);

        // Simulated audit log based on users
        List<Map<String, String>> audit = Arrays.asList(
                Map.of("actor", admin.getFullName(), "action", "Admin dashboard loaded", "time", "Just now"),
                Map.of("actor", "System", "action", "Database synchronization completed", "time", "1h ago"),
                Map.of("actor", admin.getFullName(), "action", "System configurations verified", "time", "Yesterday")
        );
        data.put("audit", audit);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers(Authentication auth) {
        UUID adminId = UUID.fromString((String) auth.getPrincipal());
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getOrganization() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<User> orgUsers = userRepository.findByOrganizationId(admin.getOrganization().getId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : orgUsers) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName());
            map.put("email", u.getEmail());
            map.put("systemRole", u.getSystemRole().name());
            map.put("department", u.getDepartment() != null ? u.getDepartment().getName() : "N/A");
            map.put("roleTitle", u.getRoleTitle() != null ? u.getRoleTitle() : "N/A");
            map.put("isActive", u.getIsActive() != null ? u.getIsActive() : true);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/users/{id}/status")
    @Transactional
    public ResponseEntity<Map<String, Object>> toggleUserStatus(@PathVariable UUID id, Authentication auth) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        target.setIsActive(!target.getIsActive());
        userRepository.save(target);
        return ResponseEntity.ok(Map.of("success", true, "isActive", target.getIsActive()));
    }

    @Autowired
    private com.knowledgeiq.repository.SkillRepository skillRepository;

    @Autowired
    private com.knowledgeiq.repository.SkillCategoryRepository skillCategoryRepository;

    @PutMapping("/users/{id}/role")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateUserRole(@PathVariable UUID id, @RequestBody Map<String, String> request, Authentication auth) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        String roleStr = request.get("role");
        SystemRole newRole = SystemRole.valueOf(roleStr.toUpperCase());
        target.setSystemRole(newRole);
        userRepository.save(target);
        return ResponseEntity.ok(Map.of("success", true, "systemRole", target.getSystemRole().name()));
    }

    @PostMapping("/skills")
    @Transactional
    public ResponseEntity<com.knowledgeiq.model.Skill> createSkill(@RequestBody Map<String, String> payload, Authentication auth) {
        String name = payload.get("name");
        String categoryName = payload.getOrDefault("categoryName", "Technical");
        String description = payload.getOrDefault("description", "Platform competency skill");

        com.knowledgeiq.model.SkillCategory cat = skillCategoryRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase(categoryName))
                .findFirst()
                .orElseGet(() -> {
                    com.knowledgeiq.model.SkillCategory newCat = new com.knowledgeiq.model.SkillCategory();
                    newCat.setName(categoryName);
                    newCat.setDescription(categoryName + " Category");
                    return skillCategoryRepository.save(newCat);
                });

        com.knowledgeiq.model.Skill skill = new com.knowledgeiq.model.Skill();
        skill.setName(name);
        skill.setDescription(description);
        skill.setCategory(cat);
        return ResponseEntity.ok(skillRepository.save(skill));
    }

    @DeleteMapping("/skills/{id}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteSkill(@PathVariable UUID id, Authentication auth) {
        skillRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Skill removed from organization taxonomy."));
    }
}
