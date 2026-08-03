package com.knowledgegap.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.knowledgegap.dto.AuthResponse;
import com.knowledgegap.dto.LoginRequest;
import com.knowledgegap.dto.SignupRequest;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Role;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.RoleRepository;
import com.knowledgegap.security.JWTService;

@Service
public class AuthenticationService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

    public AuthenticationService(EmployeeRepository employeeRepository,
                                 RoleRepository roleRepository,
                                 PasswordEncoder passwordEncoder,
                                 JWTService jwtService) {
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // LOGIN
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

        return new AuthResponse(token);
    }

    // SIGNUP
    public AuthResponse signup(SignupRequest request) {

        if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Role role = roleRepository.findByRoleName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        Employee employee = new Employee();

        employee.setEmployeeId(request.getEmployeeId());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setDesignation(request.getDesignation());

        // Department is left null
        employee.setRole(role);

        employeeRepository.save(employee);

        String token = jwtService.generateToken(
                employee.getEmail(),
                role.getRoleName()
        );

        return new AuthResponse(token);
    }
}