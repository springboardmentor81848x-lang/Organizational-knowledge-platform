package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.admin.AdminPasswordResetRequest;
import com.orgskills.intelligence.dto.admin.AuditLogResponse;
import com.orgskills.intelligence.dto.admin.JobAssignmentRequest;
import com.orgskills.intelligence.dto.admin.SystemHealthResponse;
import com.orgskills.intelligence.dto.admin.UpdateRoleRequest;
import com.orgskills.intelligence.dto.admin.UpdateUserStatusRequest;
import com.orgskills.intelligence.dto.auth.UserProfileResponse;
import com.orgskills.intelligence.dto.role.RoleRequest;
import com.orgskills.intelligence.dto.role.RoleResponse;
import com.orgskills.intelligence.entity.AuditLog;
import com.orgskills.intelligence.entity.RoleEntity;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.RoleEntityRepository;
import com.orgskills.intelligence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RoleEntityRepository roleEntityRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    // ── User Management ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers(String department) {
        List<User> users;
        if (department != null && !department.isBlank()) {
            users = userRepository.findByDepartmentIgnoreCase(department.trim());
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(this::toProfile).toList();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + id));
        return toProfile(user);
    }

    @Transactional
    public UserProfileResponse updateUserRole(Long actorUserId, Long userId, UpdateRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));

        user.setRole(request.getRole());
        User saved = userRepository.save(user);

        auditLogService.logEvent(actorUserId, actorEmail(actorUserId), "UPDATE_USER_ROLE", "User", saved.getId().toString(), "Updated role of " + saved.getEmail() + " to " + request.getRole());
        return toProfile(saved);
    }

    @Transactional
    public UserProfileResponse updateUserStatus(Long actorUserId, Long userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));

        user.setActive(request.getActive());
        User saved = userRepository.save(user);

        String action = request.getActive() ? "ACTIVATE_USER" : "DEACTIVATE_USER";
        auditLogService.logEvent(actorUserId, actorEmail(actorUserId), action, "User", saved.getId().toString(), action + " for " + saved.getEmail());
        return toProfile(saved);
    }

    @Transactional
    public void resetUserPassword(Long actorUserId, Long userId, AdminPasswordResetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.logEvent(actorUserId, actorEmail(actorUserId), "RESET_USER_PASSWORD", "User", user.getId().toString(), "Reset password for " + user.getEmail());
    }

    @Transactional
    public UserProfileResponse updateUserJobAssignment(Long actorUserId, Long userId, JobAssignmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));

        user.setJobTitle(request.getJobTitle().trim());
        user.setDepartment(request.getDepartment().trim());

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found for id: " + request.getManagerId()));
            user.setManager(manager);
        }

        User saved = userRepository.save(user);
        auditLogService.logEvent(actorUserId, actorEmail(actorUserId), "UPDATE_JOB_ASSIGNMENT", "User", saved.getId().toString(), "Updated job title to " + saved.getJobTitle() + ", department to " + saved.getDepartment());
        return toProfile(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found for id: " + id);
        }
        userRepository.deleteById(id);
    }

    // ── Role Management ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleEntityRepository.findAll().stream().map(this::toRoleResponse).toList();
    }

    @Transactional
    public RoleResponse createRole(Long actorUserId, RoleRequest request) {
        if (roleEntityRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new ValidationException("Role name already exists");
        }

        RoleEntity role = new RoleEntity();
        role.setName(request.getName().trim().toUpperCase());
        role.setDescription(request.getDescription());
        role.setActive(request.getActive() != null ? request.getActive() : true);

        RoleEntity saved = roleEntityRepository.save(role);
        auditLogService.logEvent(actorUserId, actorEmail(actorUserId), "CREATE_ROLE", "RoleEntity", saved.getId().toString(), "Created role: " + saved.getName());
        return toRoleResponse(saved);
    }

    @Transactional
    public RoleResponse updateRole(Long actorUserId, Long id, RoleRequest request) {
        RoleEntity role = roleEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found for id: " + id));

        role.setName(request.getName().trim().toUpperCase());
        role.setDescription(request.getDescription());
        if (request.getActive() != null) {
            role.setActive(request.getActive());
        }

        RoleEntity saved = roleEntityRepository.save(role);
        auditLogService.logEvent(actorUserId, actorEmail(actorUserId), "UPDATE_ROLE", "RoleEntity", saved.getId().toString(), "Updated role: " + saved.getName());
        return toRoleResponse(saved);
    }

    // ── Monitoring & Audit ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public SystemHealthResponse getSystemHealth() {
        long total = userRepository.count();
        long active = userRepository.countByActiveTrue();

        return SystemHealthResponse.builder()
                .status("UP")
                .activeUserCount(active)
                .totalUserCount(total)
                .databaseStatus("CONNECTED (PostgreSQL)")
                .timestamp(Instant.now())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogs() {
        return auditLogService.getRecentAuditLogs().stream().map(this::toAuditLogResponse).toList();
    }

    // ── Helper mapping ──────────────────────────────────────────────────────────

    /**
     * The email of the administrator performing the action. Entries used to record the literal
     * string "ADMIN", so the trail showed that an account had been deactivated but never by whom
     * - which is most of what an audit trail is for.
     */
    private String actorEmail(Long actorUserId) {
        if (actorUserId == null) {
            return "SYSTEM";
        }
        return userRepository.findById(actorUserId).map(User::getEmail).orElse("SYSTEM");
    }

    private UserProfileResponse toProfile(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .department(user.getDepartment())
                .jobTitle(user.getJobTitle())
                .avatarUrl(user.getAvatarUrl())
                .active(user.getActive())
                .build();
    }

    private RoleResponse toRoleResponse(RoleEntity r) {
        return RoleResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .active(r.getActive())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private AuditLogResponse toAuditLogResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .actorUserId(log.getActorUserId())
                .actorEmail(log.getActorEmail())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .timestamp(log.getTimestamp())
                .build();
    }
}
