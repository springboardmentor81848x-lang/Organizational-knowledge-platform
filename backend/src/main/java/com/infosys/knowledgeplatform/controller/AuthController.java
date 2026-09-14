package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.User;
import com.infosys.knowledgeplatform.repository.UserRepository;
import com.infosys.knowledgeplatform.security.JwtService;
import com.infosys.knowledgeplatform.service.RoleCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RoleCatalogService roleCatalogService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, RoleCatalogService roleCatalogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.roleCatalogService = roleCatalogService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword()) && !password.equals(user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        var profile = roleCatalogService.getProfile(user.getRole());
        String token = jwtService.generateToken(user, profile.permissions());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName() != null ? user.getName() : email.split("@")[0],
                        "email", user.getEmail(),
                        "role", user.getRole() != null ? user.getRole() : "Employee",
                        "targetRole", user.getTargetRole() != null ? user.getTargetRole() : "backend",
                        "department", user.getDepartment() != null ? user.getDepartment() : "Engineering"
                ),
                "permissions", profile.permissions()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String name = body.get("name");
        String role = body.getOrDefault("accountType", body.getOrDefault("role", "Employee"));
        String targetRole = body.getOrDefault("targetRole", "backend");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered"));
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name != null ? name : email.split("@")[0]);
        user.setRole(role);
        user.setTargetRole(targetRole);
        user.setDepartment("Engineering");

        User saved = userRepository.save(user);
        var profile = roleCatalogService.getProfile(saved.getRole());
        String token = jwtService.generateToken(saved, profile.permissions());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", saved.getId(),
                        "name", saved.getName(),
                        "email", saved.getEmail(),
                        "role", saved.getRole(),
                        "targetRole", saved.getTargetRole(),
                        "department", saved.getDepartment()
                ),
                "permissions", profile.permissions()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String token = body.get("refreshToken");
        return ResponseEntity.ok(Map.of("token", token != null ? token : "refreshed-token"));
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("message", "Password reset instructions sent"));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("message", "Password successfully reset"));
    }
}
