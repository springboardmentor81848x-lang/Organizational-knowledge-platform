package com.knowledgegap.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.knowledgegap.dto.AuthResponse;
import com.knowledgegap.dto.LoginRequest;
import com.knowledgegap.dto.SignupRequest;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Role;
import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;

import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.RoleRepository;
import com.knowledgegap.repository.CompetencyRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.SkillRepository;

import com.knowledgegap.security.JWTService;

import java.util.List;

@Service
public class AuthenticationService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final CompetencyRepository competencyRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public AuthenticationService(
            EmployeeRepository employeeRepository,
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

    // ============================================================
    // LOGIN
    // ============================================================

    public AuthResponse login(LoginRequest request) {

        System.out.println("========== LOGIN REQUEST ==========");
        System.out.println("Email Entered: " + request.getEmail());

        Employee employee = employeeRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        System.out.println(
                "Employee Found: " + employee.getFirstName()
        );

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                employee.getPassword()
        );

        System.out.println(
                "Password Match: " + passwordMatches
        );

        if (!passwordMatches) {
            throw new RuntimeException("Invalid password");
        }

        // --------------------------------------------------------
        // SYSTEM ROLE
        // --------------------------------------------------------

        String role = employee.getRole().getRoleName();

        System.out.println("System Role: " + role);

        // --------------------------------------------------------
        // TARGET ROLE
        // --------------------------------------------------------

        Long targetRoleId = employee.getTargetRoleId();

        System.out.println(
                "Employee Target Role ID: " + targetRoleId
        );

        // --------------------------------------------------------
        // EMPLOYEE DATABASE ID
        // --------------------------------------------------------

        Long employeeDatabaseId = employee.getId();

        System.out.println(
                "Employee Database ID: " + employeeDatabaseId
        );

        // --------------------------------------------------------
        // JWT
        // --------------------------------------------------------

        String token = jwtService.generateToken(
                employee.getEmail(),
                role
        );

        System.out.println("Login Successful!");
        System.out.println("==============================");

        // --------------------------------------------------------
        // RETURN EMPLOYEE DATA + TARGET ROLE + DATABASE ID
        // --------------------------------------------------------

        return new AuthResponse(
                token,
                role,
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmployeeId(),
                employee.getDesignation(),
                targetRoleId,
                employeeDatabaseId
        );
    }

    // ============================================================
    // SIGNUP
    // ============================================================

    public AuthResponse signup(SignupRequest request) {

        // --------------------------------------------------------
        // 1. CHECK EMAIL
        // --------------------------------------------------------

        if (employeeRepository
                .findByEmail(request.getEmail())
                .isPresent()) {

            throw new RuntimeException("Email already exists");
        }

        // --------------------------------------------------------
        // 2. NORMALIZE SYSTEM ROLE
        // --------------------------------------------------------

        String normalizedRoleName =
                normalizeRoleName(request.getRole());

        System.out.println(
                "Signup Role: " + request.getRole()
        );

        System.out.println(
                "Normalized Role: " + normalizedRoleName
        );

        // --------------------------------------------------------
        // 3. FIND EXISTING SYSTEM ROLE
        // --------------------------------------------------------

        Role role =
                findExistingSystemRole(normalizedRoleName);

        // --------------------------------------------------------
        // 4. CREATE EMPLOYEE
        // --------------------------------------------------------

        Employee employee = new Employee();

        employee.setEmployeeId(request.getEmployeeId());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());

        employee.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        employee.setDesignation(
                request.getDesignation()
        );

        employee.setRole(role);

        // --------------------------------------------------------
        // 5. SET TARGET ROLE
        // --------------------------------------------------------

        Long targetRoleId = null;

        if ("EMPLOYEE".equals(normalizedRoleName)) {

            if (request.getTargetRole() == null
                    || request.getTargetRole().isBlank()) {

                throw new RuntimeException(
                        "Target Role is required for Employee"
                );
            }

            targetRoleId =
                    getTargetRoleId(
                            request.getTargetRole()
                    );

            employee.setTargetRoleId(targetRoleId);

            System.out.println(
                    "Selected Target Role: "
                            + request.getTargetRole()
            );

            System.out.println(
                    "Target Role ID: "
                            + targetRoleId
            );
        }

        // --------------------------------------------------------
        // 6. SAVE EMPLOYEE
        // --------------------------------------------------------

        employeeRepository.save(employee);

        // --------------------------------------------------------
        // 7. DEFAULT SKILLS
        // --------------------------------------------------------

        if (employee.getDesignation() != null
                && !employee.getDesignation().isBlank()) {

            List<Competency> competencies =
                    competencyRepository.findByDesignation(
                            employee.getDesignation()
                    );

            for (Competency competency : competencies) {

                Skill skill =
                        skillRepository
                                .findBySkillName(
                                        competency.getDescription()
                                )
                                .orElse(null);

                if (skill != null) {

                    EmployeeSkill employeeSkill =
                            new EmployeeSkill();

                    employeeSkill.setEmployee(employee);
                    employeeSkill.setSkill(skill);

                    // New employee starts at Beginner
                    employeeSkill.setCurrentLevel(1);

                    employeeSkillRepository.save(
                            employeeSkill
                    );
                }
            }
        }

        // --------------------------------------------------------
        // 8. GENERATE JWT
        // --------------------------------------------------------

        String token =
                jwtService.generateToken(
                        employee.getEmail(),
                        role.getRoleName()
                );

        // --------------------------------------------------------
        // 9. RETURN RESPONSE
        // --------------------------------------------------------

        return new AuthResponse(
                token,
                role.getRoleName(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmployeeId(),
                employee.getDesignation(),
                employee.getTargetRoleId(),
                employee.getId()
        );
    }

    // ============================================================
    // FIND EXISTING SYSTEM ROLE
    // ============================================================

    private Role findExistingSystemRole(
            String normalizedRoleName) {

        String databaseRoleName;

        switch (normalizedRoleName) {

            case "EMPLOYEE":
                databaseRoleName = "EMPLOYEE";
                break;

            case "HR":
                databaseRoleName = "HR";
                break;

            case "MANAGER":
                databaseRoleName = "MANAGER";
                break;

            case "DEPARTMENT_HEAD":
                databaseRoleName = "DEPARTMENT_HEAD";
                break;

            case "MENTOR":
                databaseRoleName = "MENTOR";
                break;

            case "SYSTEM_ADMINISTRATOR":
                databaseRoleName = "SYSTEM_ADMINISTRATOR";
                break;

            default:
                throw new RuntimeException(
                        "Invalid system role: "
                                + normalizedRoleName
                );
        }

        return roleRepository
                .findByRoleName(databaseRoleName)
                .orElseThrow(() ->
                        new RuntimeException(
                                "System role not found in database: "
                                        + databaseRoleName
                        )
                );
    }

    // ============================================================
    // TARGET ROLE ID MAPPING
    // ============================================================

    private Long getTargetRoleId(String targetRole) {

        if (targetRole == null
                || targetRole.isBlank()) {

            throw new RuntimeException(
                    "Target Role cannot be empty"
            );
        }

        String normalizedTargetRole =
                targetRole.trim().toLowerCase();

        switch (normalizedTargetRole) {

            case "software developer":
                return 2L;

            case "software tester":
                return 3L;

            case "data analyst":
                return 4L;

            case "data scientist":
                return 5L;

            case "devops engineer":
                return 6L;

            case "ui/ux designer":
                return 7L;

            case "cybersecurity analyst":
                return 8L;

            case "database administrator":
                return 9L;

            default:
                throw new RuntimeException(
                        "Invalid Target Role: "
                                + targetRole
                );
        }
    }

    // ============================================================
    // NORMALIZE SYSTEM ROLE
    // ============================================================

    private String normalizeRoleName(String roleName) {

        if (roleName == null
                || roleName.isBlank()) {

            return "EMPLOYEE";
        }

        return roleName.trim().toUpperCase();
    }
}