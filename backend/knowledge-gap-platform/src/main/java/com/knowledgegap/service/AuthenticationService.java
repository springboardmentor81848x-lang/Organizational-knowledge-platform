
package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.knowledgegap.dto.AuthResponse;
import com.knowledgegap.dto.ForgotPasswordRequest;
import com.knowledgegap.dto.LoginRequest;
import com.knowledgegap.dto.ResetPasswordRequest;
import com.knowledgegap.dto.SignupRequest;
import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Role;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.CompetencyRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.RoleRepository;
import com.knowledgegap.repository.SkillRepository;
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
    private final NotificationService notificationService;
    private final JavaMailSender mailSender;

    // =========================================================
    // OTP STORAGE
    // =========================================================

    private final Map<String, String> otpStorage =
            new ConcurrentHashMap<>();

    private final Map<String, LocalDateTime> otpExpiryStorage =
            new ConcurrentHashMap<>();

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AuthenticationService(
            EmployeeRepository employeeRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JWTService jwtService,
            CompetencyRepository competencyRepository,
            SkillRepository skillRepository,
            EmployeeSkillRepository employeeSkillRepository,
            NotificationService notificationService,
            JavaMailSender mailSender) {

        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.competencyRepository = competencyRepository;
        this.skillRepository = skillRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.notificationService = notificationService;
        this.mailSender = mailSender;
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
        // RETURN EMPLOYEE DATA
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
        // 6.1 NOTIFY SYSTEM ADMINISTRATORS
        // --------------------------------------------------------

        notificationService.notifySystemAdministrators(
                "NEW_USER",
                "A new employee, "
                        + employee.getFirstName()
                        + " "
                        + employee.getLastName()
                        + ", has registered on the platform."
        );

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
    // FORGOT PASSWORD
    // SEND OTP
    // ============================================================

    public void forgotPassword(
            ForgotPasswordRequest request) {

        if (request == null
                || request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        // --------------------------------------------------------
        // FIND EMPLOYEE
        // --------------------------------------------------------

        Employee employee =
                employeeRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No account found with this email"
                                )
                        );

        // --------------------------------------------------------
        // GENERATE 6 DIGIT OTP
        // --------------------------------------------------------

        String otp = String.format(
                "%06d",
                new java.util.Random()
                        .nextInt(1_000_000)
        );

        // --------------------------------------------------------
        // CREATE EMAIL
        // --------------------------------------------------------

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "Password Reset OTP - Organizational Knowledge Platform"
        );

        message.setText(
                "Hello "
                        + employee.getFirstName()
                        + ",\n\n"

                        + "Your OTP for resetting your password is:\n\n"

                        + otp
                        + "\n\n"

                        + "This OTP is valid for 10 minutes.\n\n"

                        + "If you did not request a password reset, "
                        + "please ignore this email.\n\n"

                        + "Regards,\n"
                        + "Organizational Knowledge Intelligence Platform"
        );

        // --------------------------------------------------------
        // SEND EMAIL
        // --------------------------------------------------------

        try {

            System.out.println(
                    "======================================"
            );

            System.out.println(
                    "ATTEMPTING TO SEND PASSWORD RESET OTP"
            );

            System.out.println(
                    "Recipient: " + email
            );

            mailSender.send(message);

            // Store OTP only after successful email sending
            otpStorage.put(
                    email,
                    otp
            );

            otpExpiryStorage.put(
                    email,
                    LocalDateTime.now()
                            .plusMinutes(10)
            );

            System.out.println(
                    "PASSWORD RESET OTP SENT SUCCESSFULLY"
            );

            System.out.println(
                    "Email: " + email
            );

            System.out.println(
                    "======================================"
            );

        } catch (Exception e) {

            System.err.println(
                    "======================================"
            );

            System.err.println(
                    "FAILED TO SEND PASSWORD RESET OTP"
            );

            System.err.println(
                    "Recipient: " + email
            );

            System.err.println(
                    "Error Type: "
                            + e.getClass().getName()
            );

            System.err.println(
                    "Error Message: "
                            + e.getMessage()
            );

            e.printStackTrace();

            System.err.println(
                    "======================================"
            );

            throw new RuntimeException(
                    "Unable to send OTP. Please check email configuration.",
                    e
            );
        }
    }

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    public void resetPassword(
            ResetPasswordRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Invalid request"
            );
        }

        String email = request.getEmail();
        String otp = request.getOtp();
        String newPassword = request.getNewPassword();

        // --------------------------------------------------------
        // VALIDATE INPUT
        // --------------------------------------------------------

        if (email == null
                || email.isBlank()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (otp == null
                || otp.isBlank()) {

            throw new RuntimeException(
                    "OTP is required"
            );
        }

        if (newPassword == null
                || newPassword.isBlank()) {

            throw new RuntimeException(
                    "New password is required"
            );
        }

        email = email
                .trim()
                .toLowerCase();

        otp = otp.trim();

        // --------------------------------------------------------
        // GET STORED OTP
        // --------------------------------------------------------

        String storedOtp =
                otpStorage.get(email);

        if (storedOtp == null) {

            throw new RuntimeException(
                    "OTP not found or expired"
            );
        }

        // --------------------------------------------------------
        // CHECK EXPIRY
        // --------------------------------------------------------

        LocalDateTime expiry =
                otpExpiryStorage.get(email);

        if (expiry == null
                || LocalDateTime.now()
                        .isAfter(expiry)) {

            otpStorage.remove(email);
            otpExpiryStorage.remove(email);

            throw new RuntimeException(
                    "OTP has expired"
            );
        }

        // --------------------------------------------------------
        // CHECK OTP
        // --------------------------------------------------------

        if (!storedOtp.equals(otp)) {

            throw new RuntimeException(
                    "Invalid OTP"
            );
        }

        // --------------------------------------------------------
        // PASSWORD VALIDATION
        // --------------------------------------------------------

        if (newPassword.length() < 6) {

            throw new RuntimeException(
                    "Password must contain at least 6 characters"
            );
        }

        // --------------------------------------------------------
        // FIND EMPLOYEE
        // --------------------------------------------------------

        Employee employee =
                employeeRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                        );

        // --------------------------------------------------------
        // ENCODE NEW PASSWORD
        // --------------------------------------------------------

        employee.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        // --------------------------------------------------------
        // SAVE
        // --------------------------------------------------------

        employeeRepository.save(employee);

        // --------------------------------------------------------
        // REMOVE OTP
        // PREVENT REUSE
        // --------------------------------------------------------

        otpStorage.remove(email);

        otpExpiryStorage.remove(email);

        System.out.println(
                "Password successfully reset for: "
                        + email
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

    private Long getTargetRoleId(
            String targetRole) {

        if (targetRole == null
                || targetRole.isBlank()) {

            throw new RuntimeException(
                    "Target Role cannot be empty"
            );
        }

        String normalizedTargetRole =
                targetRole
                        .trim()
                        .toLowerCase();

        switch (normalizedTargetRole) {

            case "software developer":
                return 1L;

            case "software tester":
                return 2L;

            case "data analyst":
                return 3L;

            case "data scientist":
                return 4L;

            case "devops engineer":
                return 5L;

            case "ui/ux designer":
                return 6L;

            case "cybersecurity analyst":
                return 7L;

            case "database administrator":
                return 8L;

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

    private String normalizeRoleName(
            String roleName) {

        if (roleName == null
                || roleName.isBlank()) {

            return "EMPLOYEE";
        }

        return roleName
                .trim()
                .toUpperCase();
    }
}
