package com.team7.knowledge_gap_platform.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.dto.AuthResponse;
import com.team7.knowledge_gap_platform.dto.LoginRequest;
import com.team7.knowledge_gap_platform.dto.RegisterRequest;
import com.team7.knowledge_gap_platform.entity.User;
import com.team7.knowledge_gap_platform.entity.Employee;
import com.team7.knowledge_gap_platform.repository.UserRepository;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;
import com.team7.knowledge_gap_platform.security.JwtService;

@Service
public class  AuthService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        String normalizedRole = normalizeRole(request.getRole());

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(normalizedRole);

        User savedUser = userRepository.save(user);

        // Ensure a corresponding Employee profile exists for all roles
        Employee employee = employeeRepository.findByEmail(savedUser.getEmail())
                .orElseGet(() -> {
                    Employee newEmp = new Employee();
                    String fullName = request.getFullName();
                    if (fullName != null && fullName.contains(" ")) {
                        int lastSpaceIndex = fullName.lastIndexOf(" ");
                        newEmp.setFirstName(fullName.substring(0, lastSpaceIndex));
                        newEmp.setLastName(fullName.substring(lastSpaceIndex + 1));
                    } else {
                        newEmp.setFirstName(fullName != null ? fullName : "User");
                        newEmp.setLastName("");
                    }
                    newEmp.setEmail(savedUser.getEmail());
                    newEmp.setRole(normalizedRole);
                    newEmp.setJobRoleId(1L);
                    newEmp.setDepartment("Software Engineering");
                    return employeeRepository.save(newEmp);
                });

        String token = jwtService.generateToken(
                savedUser.getEmail(),
                savedUser.getRole());

        return new AuthResponse(employee.getId(), token, savedUser.getRole(), savedUser.getFullName(), savedUser.getEmail());
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Ensure Employee record exists for logging in user
        Employee employee = employeeRepository.findByEmail(user.getEmail())
                .orElseGet(() -> {
                    Employee newEmp = new Employee();
                    String fullName = user.getFullName();
                    if (fullName != null && fullName.contains(" ")) {
                        int lastSpaceIndex = fullName.lastIndexOf(" ");
                        newEmp.setFirstName(fullName.substring(0, lastSpaceIndex));
                        newEmp.setLastName(fullName.substring(lastSpaceIndex + 1));
                    } else {
                        newEmp.setFirstName(fullName != null ? fullName : "User");
                        newEmp.setLastName("");
                    }
                    newEmp.setEmail(user.getEmail());
                    newEmp.setRole(user.getRole());
                    newEmp.setJobRoleId(1L);
                    newEmp.setDepartment("Software Engineering");
                    return employeeRepository.save(newEmp);
                });

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole());

        return new AuthResponse(employee.getId(), token, user.getRole(), user.getFullName(), user.getEmail());
    }

    private String normalizeRole(String role) {

        if (role == null || role.isBlank()) {
            return "EMPLOYEE";
        }

        String normalizedRole = role.trim().toUpperCase();

        return switch (normalizedRole) {
            case "EMPLOYEE" -> "EMPLOYEE";
            case "MANAGER" -> "MANAGER";
            case "HR", "HR SPECIALIST" -> "HR";
            case "ADMIN", "SYSTEM ADMINISTRATOR" -> "ADMIN";
            case "DEPARTMENT_HEAD", "DEPARTMENT HEAD", "DEPT HEAD" -> "DEPARTMENT_HEAD";
            case "LEARNING_DEVELOPMENT_ADMIN", "L&D ADMIN", "L&D SPECIALIST", "LEARNING & DEVELOPMENT ADMIN" -> "LEARNING_DEVELOPMENT_ADMIN";
            case "MENTOR" -> "MENTOR";
            default -> throw new IllegalArgumentException(
                    "Role must be EMPLOYEE, MANAGER, HR, ADMIN, DEPARTMENT_HEAD, LEARNING_DEVELOPMENT_ADMIN, or MENTOR");
        };
    }
}