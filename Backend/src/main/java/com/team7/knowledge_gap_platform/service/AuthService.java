package com.team7.knowledge_gap_platform.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.dto.AuthResponse;
import com.team7.knowledge_gap_platform.dto.LoginRequest;
import com.team7.knowledge_gap_platform.dto.RegisterRequest;
import com.team7.knowledge_gap_platform.entity.User;
import com.team7.knowledge_gap_platform.repository.UserRepository;
import com.team7.knowledge_gap_platform.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(normalizeRole(request.getRole()));

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(
                savedUser.getEmail(),
                savedUser.getRole());

        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole());

        return new AuthResponse(token);
    }

    private String normalizeRole(String role) {

        if (role == null || role.isBlank()) {
            return "EMPLOYEE";
        }

        String normalizedRole = role.trim().toUpperCase();

        return switch (normalizedRole) {
            case "EMPLOYEE", "MANAGER", "HR", "ADMIN" -> normalizedRole;
            default -> throw new IllegalArgumentException(
                    "Role must be EMPLOYEE, MANAGER, HR, or ADMIN");
        };
    }
}