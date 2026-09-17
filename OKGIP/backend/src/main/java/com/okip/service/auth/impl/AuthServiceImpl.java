package com.okip.service.auth.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.okip.exception.AuthenticationFailedException;

import com.okip.dto.auth.LoginRequestDTO;
import com.okip.dto.auth.LoginResponseDTO;
import com.okip.dto.auth.RegisterRequestDTO;
import com.okip.dto.auth.RegisterResponseDTO;
import com.okip.entity.master.Department;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Role;
import com.okip.enums.AccountStatus;
import com.okip.enums.RoleType;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.DepartmentRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.RoleRepository;
import com.okip.security.jwt.JwtService;
import com.okip.service.auth.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService) {

        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public RegisterResponseDTO registerEmployee(RegisterRequestDTO request) {

        if (employeeRepository.existsByOfficialEmail(request.getOfficialEmail())) {
            throw new ResourceAlreadyExistsException(
                    "Official email already registered.");
        }

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found."));

        Role role = roleRepository
                .findByRoleName(RoleType.ROLE_EMPLOYEE)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee role not found."));

        Employee employee = new Employee();

        employee.setEmployeeCode(generateEmployeeCode());

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setOfficialEmail(request.getOfficialEmail());

        employee.setPassword(
                passwordEncoder.encode(request.getPassword()));

        employee.setDepartment(department);
        employee.setRole(role);

        employee.setStatus(AccountStatus.PENDING);

        employee = employeeRepository.save(employee);

        RegisterResponseDTO response = new RegisterResponseDTO();

        response.setEmployeeId(employee.getEmployeeId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setMessage(
                "Registration submitted successfully. Awaiting HR approval.");

        return response;
    }
    private String generateEmployeeCode() {

        long count = employeeRepository.count() + 1;

        return String.format("EMP%04d", count);
    }
    
    @Override 
    public LoginResponseDTO loginEmployee(LoginRequestDTO request) {

        Employee employee = employeeRepository
                .findByOfficialEmail(request.getOfficialEmail())
                .orElseThrow(() ->
                        new AuthenticationFailedException(
                                "Invalid email or password."));

        try {

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getOfficialEmail(),
                            request.getPassword()));

        } catch (Exception ex) {

            throw new AuthenticationFailedException(
                    "Invalid email or password.");
        }

        if (employee.getStatus() != AccountStatus.APPROVED) {

            throw new AuthenticationFailedException(
                    "Your account is awaiting HR approval.");
        }

        String token =
                jwtService.generateToken(
                        employee.getOfficialEmail(),
                        employee.getRole().getRoleName().name());

        LoginResponseDTO response = new LoginResponseDTO();

        response.setToken(token);
        response.setMessage("Login Successful.");

        return response;
    }

}