package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.User;
import com.infosys.knowledgeplatform.repository.UserRepository;
import com.infosys.knowledgeplatform.security.JwtService;
import com.infosys.knowledgeplatform.service.LearningPathService;
import com.infosys.knowledgeplatform.service.RoleCatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RoleCatalogService roleCatalogService;
    private final LearningPathService learningPathService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, RoleCatalogService roleCatalogService, LearningPathService learningPathService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.roleCatalogService = roleCatalogService;
        this.learningPathService = learningPathService;
    }

    @Autowired
    private com.infosys.knowledgeplatform.repository.RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private com.infosys.knowledgeplatform.repository.AuditLogRepository auditLogRepository;
    @Autowired
    private com.infosys.knowledgeplatform.repository.PasswordResetTokenRepository passwordResetTokenRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
        String email = asString(payload.get("email"));

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "User already exists"));
        }

        User user = new User();
        user.setName(asString(payload.get("name")));
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(asString(payload.get("password"))));
        user.setRole(resolveRole(payload.get("role"), payload.get("accountType")));
        user.setDepartment(asString(payload.get("department")));
        user.setTargetRole(asString(payload.get("targetRole")));

        user = userRepository.save(user);
        // audit register
        try {
            com.infosys.knowledgeplatform.model.AuditLog al = new com.infosys.knowledgeplatform.model.AuditLog();
            al.setUsername(user.getEmail());
            al.setAction("REGISTER");
            al.setEntityType("User");
            al.setEntityId(String.valueOf(user.getId()));
            al.setMetadata("{}");
            auditLogRepository.save(al);
        } catch (Exception ignored) {}
        return ResponseEntity.ok(buildAuthResponse(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, Object> payload) {
        String email = asString(payload.get("email"));
        if (email != null) {
            refreshTokenRepository.deleteByEmail(email);
            try {
                com.infosys.knowledgeplatform.model.AuditLog al = new com.infosys.knowledgeplatform.model.AuditLog();
                al.setUsername(email);
                al.setAction("LOGOUT");
                al.setEntityType("User");
                al.setEntityId(email);
                al.setMetadata("{}");
                auditLogRepository.save(al);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("message", "logged out"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> payload) {
        String email = asString(payload.get("email"));
        String password = asString(payload.get("password"));
        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder.matches(password == null ? "" : password, user.getPassword()))
                .<ResponseEntity<?>>map(user -> {
                    Map<String, Object> resp = buildAuthResponse(user);
                    // generate refresh token
                    String refresh = java.util.UUID.randomUUID().toString();
                    com.infosys.knowledgeplatform.model.RefreshToken rt = new com.infosys.knowledgeplatform.model.RefreshToken();
                    rt.setToken(refresh);
                    rt.setEmail(user.getEmail());
                    rt.setExpiresAt(java.time.Instant.now().plusSeconds(60L * 60 * 24 * 30)); // 30 days
                    refreshTokenRepository.save(rt);
                    resp.put("refreshToken", refresh);
                    // audit login
                    com.infosys.knowledgeplatform.model.AuditLog al = new com.infosys.knowledgeplatform.model.AuditLog();
                    al.setUsername(user.getEmail());
                    al.setAction("LOGIN");
                    al.setEntityType("User");
                    al.setEntityId(String.valueOf(user.getId()));
                    al.setMetadata("{\"ip\":\"local\"}");
                    auditLogRepository.save(al);
                    return ResponseEntity.ok(resp);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials")));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, Object> payload) {
        String refresh = asString(payload.get("refreshToken"));
        if (refresh == null) return ResponseEntity.badRequest().body(Map.of("message", "refreshToken required"));
        return refreshTokenRepository.findByToken(refresh)
                .filter(rt -> rt.getExpiresAt().isAfter(java.time.Instant.now()))
                .map(rt -> {
                    // rotate refresh token: delete old and issue new
                    String email = rt.getEmail();
                    refreshTokenRepository.delete(rt);
                    com.infosys.knowledgeplatform.model.RefreshToken newRt = new com.infosys.knowledgeplatform.model.RefreshToken();
                    String newToken = java.util.UUID.randomUUID().toString();
                    newRt.setToken(newToken);
                    newRt.setEmail(email);
                    newRt.setExpiresAt(java.time.Instant.now().plusSeconds(60L * 60 * 24 * 30));
                    refreshTokenRepository.save(newRt);

                    return userRepository.findByEmail(email).map(user -> {
                        String token = jwtService.generateToken(user, roleCatalogService.getProfile(user.getRole()).permissions());
                        // audit refresh
                        com.infosys.knowledgeplatform.model.AuditLog al = new com.infosys.knowledgeplatform.model.AuditLog();
                        al.setUsername(user.getEmail());
                        al.setAction("REFRESH_TOKEN_ROTATE");
                        al.setEntityType("User");
                        al.setEntityId(String.valueOf(user.getId()));
                        al.setMetadata("{}");
                        auditLogRepository.save(al);
                        return ResponseEntity.ok(Map.of("token", token, "refreshToken", newToken));
                    }).orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found")));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired refresh token")));
    }

    @PostMapping("/revoke")
    public ResponseEntity<?> revoke(@RequestBody Map<String, Object> payload) {
        String refresh = asString(payload.get("refreshToken"));
        if (refresh == null) return ResponseEntity.badRequest().body(Map.of("message", "refreshToken required"));
        return refreshTokenRepository.findByToken(refresh)
                .map(rt -> {
                    refreshTokenRepository.delete(rt);
                    try {
                        com.infosys.knowledgeplatform.model.AuditLog al = new com.infosys.knowledgeplatform.model.AuditLog();
                        al.setUsername(rt.getEmail());
                        al.setAction("REVOKE_REFRESH");
                        al.setEntityType("RefreshToken");
                        al.setEntityId(rt.getToken());
                        al.setMetadata("{}");
                        auditLogRepository.save(al);
                    } catch (Exception ignored) {}
                    return ResponseEntity.ok(Map.of("message", "revoked"));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "token not found")));
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgot(@RequestBody Map<String, Object> payload) {
        String email = asString(payload.get("email"));
        if (email == null) return ResponseEntity.badRequest().body(Map.of("message", "email required"));
        // create reset token
        String token = java.util.UUID.randomUUID().toString();
        com.infosys.knowledgeplatform.model.PasswordResetToken prt = new com.infosys.knowledgeplatform.model.PasswordResetToken();
        prt.setToken(token);
        prt.setEmail(email);
        prt.setExpiresAt(java.time.Instant.now().plusSeconds(60 * 60)); // 1 hour
        passwordResetTokenRepository.save(prt);
        // In real app, send email. Here we return token for convenience (or log it)
        try {
            com.infosys.knowledgeplatform.model.AuditLog al = new com.infosys.knowledgeplatform.model.AuditLog();
            al.setUsername(email);
            al.setAction("PASSWORD_RESET_REQUEST");
            al.setEntityType("User");
            al.setEntityId(email);
            al.setMetadata("{\"token\":\"" + token + "\"}");
            auditLogRepository.save(al);
        } catch (Exception ignored) {}
        return ResponseEntity.ok(Map.of("message", "reset_created", "token", token));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset(@RequestBody Map<String, Object> payload) {
        String token = asString(payload.get("token"));
        String newPassword = asString(payload.get("password"));
        if (token == null || newPassword == null) return ResponseEntity.badRequest().body(Map.of("message", "token and password required"));
        return passwordResetTokenRepository.findByToken(token)
                .filter(p -> p.getExpiresAt().isAfter(java.time.Instant.now()))
                .map(prt -> userRepository.findByEmail(prt.getEmail()))
                .flatMap(u -> u.map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                    // delete all reset tokens and refresh tokens for this user
                    passwordResetTokenRepository.deleteByEmail(user.getEmail());
                    refreshTokenRepository.deleteByEmail(user.getEmail());
                    try {
                        com.infosys.knowledgeplatform.model.AuditLog al = new com.infosys.knowledgeplatform.model.AuditLog();
                        al.setUsername(user.getEmail());
                        al.setAction("PASSWORD_RESET_COMPLETE");
                        al.setEntityType("User");
                        al.setEntityId(String.valueOf(user.getId()));
                        al.setMetadata("{}");
                        auditLogRepository.save(al);
                    } catch (Exception ignored) {}
                    return ResponseEntity.ok(Map.of("message", "password reset"));
                }))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "invalid or expired token")));
    }

    private Map<String, Object> buildAuthResponse(User user) {
        RoleCatalogService.RoleProfile profile = roleCatalogService.getProfile(user.getRole());
        Map<String, Object> safeUser = new HashMap<>();
        safeUser.put("id", user.getId());
        safeUser.put("name", user.getName());
        safeUser.put("email", user.getEmail());
        safeUser.put("role", user.getRole());
        safeUser.put("department", user.getDepartment());
        safeUser.put("targetRole", user.getTargetRole());
        safeUser.put("accountType", user.getRole());
        safeUser.put("permissions", profile.permissions());
        safeUser.put("accessibleRoutes", profile.accessibleRoutes());
        safeUser.put("dashboardModules", profile.dashboardModules());

        return Map.of(
                "token", jwtService.generateToken(user, profile.permissions()),
                "user", safeUser,
                "permissions", profile.permissions(),
                "roleProfile", profile,
                "recommendedCourses", learningPathService.generateCourseRecommendations(user.getRole(), user.getEmail(), 3)
        );
    }

    private String resolveRole(Object role, Object accountType) {
        String requestedRole = asString(role);
        if (requestedRole != null && !requestedRole.isBlank()) {
            return requestedRole;
        }

        String requestedAccountType = asString(accountType);
        if (requestedAccountType != null && !requestedAccountType.isBlank()) {
            return requestedAccountType;
        }

        return "Employee";
    }

    private String asString(Object value) {
        return value == null ? null : value.toString().trim();
    }
}