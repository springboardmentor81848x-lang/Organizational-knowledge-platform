package com.knowledgegap.service;

import com.knowledgegap.dto.AuthResponse;
import com.knowledgegap.dto.LoginRequest;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.security.JWTService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

    public AuthenticationService(EmployeeRepository employeeRepository,
                                 PasswordEncoder passwordEncoder,
                                 JWTService jwtService) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    public AuthResponse login(LoginRequest request) {

        Employee employee = employeeRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String role = employee.getRole().getRoleName();

        String token = jwtService.generateToken(
                employee.getEmail(),
                role
        );
    return new AuthResponse(
        token,
        employee.getRole().getRoleName()
);
    }
}