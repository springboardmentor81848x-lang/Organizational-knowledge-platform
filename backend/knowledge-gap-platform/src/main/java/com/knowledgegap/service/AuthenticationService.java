package com.knowledgegap.service;

import com.knowledgegap.dto.AuthResponse;
import com.knowledgegap.dto.LoginRequest;
import com.knowledgegap.dto.SignupRequest;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Role;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.RoleRepository;
import com.knowledgegap.security.JWTService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

        return new AuthResponse(
                token,
                role,
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmployeeId()
        );
    }

    // SIGNUP
    public AuthResponse signup(SignupRequest request) {

        if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        String normalizedRoleName = normalizeRoleName(request.getRole());
        Role role = roleRepository.findByRoleName(normalizedRoleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleName(normalizedRoleName);
                    newRole.setDescription("Auto-created role for signup");
                    return roleRepository.save(newRole);
                });

        Employee employee = new Employee();

        employee.setEmployeeId(request.getEmployeeId());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setDesignation(request.getDesignation());

        employee.setRole(role);

        employeeRepository.save(employee);

        String token = jwtService.generateToken(
                employee.getEmail(),
                role.getRoleName()
        );

        return new AuthResponse(
                token,
                role.getRoleName(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmployeeId()
        );
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return "EMPLOYEE";
        }
        return roleName.trim().toUpperCase();
    }
}