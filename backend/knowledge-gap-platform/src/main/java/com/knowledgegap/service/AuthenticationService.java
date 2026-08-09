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
import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.CompetencyRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.SkillRepository;

import java.util.List;
import com.knowledgegap.security.JWTService;

@Service
public class AuthenticationService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final CompetencyRepository competencyRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public AuthenticationService(EmployeeRepository employeeRepository,
                             RoleRepository roleRepository,
                             PasswordEncoder passwordEncoder,
                             JWTService jwtService,
                             CompetencyRepository competencyRepository,
                             SkillRepository skillRepository,
                             EmployeeSkillRepository employeeSkillRepository) {

    this.employeeRepository = employeeRepository;
    this.roleRepository = roleRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;

    this.competencyRepository = competencyRepository;
    this.skillRepository = skillRepository;
    this.employeeSkillRepository = employeeSkillRepository;
}

    // LOGIN
    // LOGIN
public AuthResponse login(LoginRequest request) {

    System.out.println("========== LOGIN REQUEST ==========");
    System.out.println("Email Entered: " + request.getEmail());
    System.out.println("Password Entered: " + request.getPassword());

    Employee employee = employeeRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> {
                System.out.println("Employee not found!");
                return new RuntimeException("Employee not found");
            });

    System.out.println("Employee Found: " + employee.getFirstName());
    System.out.println("Stored Password: " + employee.getPassword());

    boolean passwordMatches = passwordEncoder.matches(
            request.getPassword(),
            employee.getPassword()
    );

    System.out.println("Password Match: " + passwordMatches);

    if (!passwordMatches) {
        throw new RuntimeException("Invalid password");
    }

    String role = employee.getRole().getRoleName();

    System.out.println("Role: " + role);

    String token = jwtService.generateToken(
            employee.getEmail(),
            role
    );

    System.out.println("Login Successful!");
    System.out.println("==============================");

        return new AuthResponse(
                token,
                role,
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmployeeId(),
                employee.getDesignation()
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
        // Get all competencies for the employee's designation
List<Competency> competencies =
        competencyRepository.findByDesignation(employee.getDesignation());

// Assign default skills
for (Competency competency : competencies) {

    Skill skill = skillRepository
            .findBySkillName(competency.getDescription())
            .orElse(null);

    if (skill != null) {

        EmployeeSkill employeeSkill = new EmployeeSkill();

        employeeSkill.setEmployee(employee);
        employeeSkill.setSkill(skill);

        // Every new employee starts as Beginner
        employeeSkill.setCurrentLevel(1);

        employeeSkillRepository.save(employeeSkill);
    }
}

        String token = jwtService.generateToken(
                employee.getEmail(),
                role.getRoleName()
        );

        return new AuthResponse(
                token,
                role.getRoleName(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmployeeId(),
                employee.getDesignation()
        );
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return "EMPLOYEE";
        }
        return roleName.trim().toUpperCase();
    }
}