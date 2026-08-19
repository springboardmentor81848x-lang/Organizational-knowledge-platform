package com.knowledgeiq.service;

import com.knowledgeiq.config.JwtTokenProvider;
import com.knowledgeiq.dto.AuthRequest;
import com.knowledgeiq.dto.AuthResponse;
import com.knowledgeiq.dto.RegistrationRequest;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private RoleSkillBenchmarkRepository benchmarkRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private NotificationService notificationService;

    public AuthResponse authenticateUser(AuthRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim() : "";
        String cleanPassword = request.getPassword() != null ? request.getPassword().trim() : "";

        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(cleanPassword, user.getPasswordHash()) && !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // On login: recalculate gaps if needed (deduplicator prevents creating duplicates if state hasn't changed)
        try {
            gapAnalysisService.recalculateUserGaps(user.getId());
        } catch (Exception e) {
            System.err.println("Gap check on login: " + e.getMessage());
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getSystemRole().name());

        String roleTitle = user.getRole() != null ? user.getRole().getTitle() : "N/A";
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : "N/A";

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getSystemRole().name(),
                roleTitle,
                deptName
        );
    }

    public User getUserById(String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public AuthResponse authenticateWithGoogle(com.knowledgeiq.dto.GoogleAuthRequest req) {
        String email = req.getEmail();
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Google account has no email address");
        }

        String fullName = req.getFullName();
        if (fullName == null || fullName.isBlank()) {
            fullName = email.split("@")[0];
        }

        String avatarUrl = req.getAvatarUrl();

        // Find existing user or create a new one
        User user = userRepository.findAllByEmailIgnoreCase(email).stream().findFirst().orElse(null);

        if (user == null) {
            // New user via Google — create with EMPLOYEE role by default
            user = new User();
            user.setEmail(email);
            user.setFullName(fullName);
            user.setSystemRole(SystemRole.EMPLOYEE);
            user.setIsActive(true);
            user.setCompany("Northwind Labs");
            // Set a placeholder hash so the DB NOT NULL constraint is satisfied.
            // Google users cannot log in with a password (the hash is a random UUID).
            user.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            if (avatarUrl != null) user.setAvatarUrl(avatarUrl);

            // Assign a default department and role
            Department dept = departmentRepository.findAllByName("Engineering").stream().findFirst()
                    .orElseGet(() -> departmentRepository.save(new Department("Engineering", "Engineering Department")));
            user.setDepartment(dept);

            Role role = roleRepository.findAllByTitle("Software Engineer").stream().findFirst()
                    .orElseGet(() -> roleRepository.save(new Role("Software Engineer", dept, "Software Engineer")));
            user.setRole(role);

            user = userRepository.save(user);
        } else {
            // Update avatar from Google if not already set
            if (avatarUrl != null && (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank())) {
                user.setAvatarUrl(avatarUrl);
                user = userRepository.save(user);
            }
        }

        String token = tokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getSystemRole().name(),
                user.getOrganization() != null ? user.getOrganization().getId() : null,
                user.getDepartment() != null ? user.getDepartment().getId() : null,
                user.getTeamName()
        );

        String roleTitle = user.getRole() != null ? user.getRole().getTitle() : user.getRoleTitle();
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : null;

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getSystemRole().name(),
                roleTitle,
                deptName,
                user.getTeamName(),
                user.getOrganization() != null ? user.getOrganization().getId() : null,
                user.getOrganization() != null ? user.getOrganization().getName() : user.getCompany()
        );
    }

    private static final Map<String, List<String>> DEPT_TEAMS_MAP = Map.ofEntries(
            Map.entry("Engineering", List.of("Java", "Python", "Frontend", "DevOps", "QA", "Cloud & DevOps", "Full Stack")),
            Map.entry("Finance", List.of("Accounting", "Financial Analysis", "Payroll & Tax", "Budgeting", "Analysis")),
            Map.entry("Marketing", List.of("Digital Marketing", "Content & Copywriting", "SEO & Growth", "Brand Strategy", "Content")),
            Map.entry("Product", List.of("Product Management", "UI/UX Design", "Scrum & Agile", "Design")),
            Map.entry("Data & Analytics", List.of("Data Engineering", "Business Intelligence", "Machine Learning", "Data")),
            Map.entry("Sales", List.of("Enterprise Sales", "Business Development", "Account Management")),
            Map.entry("Sales & Marketing", List.of("Digital Marketing", "Content & Copywriting", "SEO & Growth", "Brand Strategy", "Sales")),
            Map.entry("HR & Operations", List.of("People Operations", "Talent Acquisition", "Operations")),
            Map.entry("Customer Success", List.of("Customer Support", "Client Onboarding", "Support")),
            Map.entry("Legal", List.of("Corporate Legal", "Regulatory Compliance")),
            Map.entry("Other", List.of("General Team", "Operations"))
    );

    public boolean validateTeamForDepartment(String departmentName, String teamName) {
        if (departmentName == null || teamName == null) return false;
        List<String> validTeams = DEPT_TEAMS_MAP.get(departmentName.trim());
        if (validTeams == null) {
            return !teamName.trim().isEmpty();
        }
        String cleanTeam = teamName.trim().toLowerCase();
        return validTeams.stream().anyMatch(t -> t.equalsIgnoreCase(cleanTeam) || cleanTeam.contains(t.toLowerCase()) || t.toLowerCase().contains(cleanTeam));
    }

    @org.springframework.transaction.annotation.Transactional
    public AuthResponse registerUser(RegistrationRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required.");
        }
        if (req.getPassword() == null || req.getPassword().length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters.");
        }
        if (req.getFullName() == null || req.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full name is required.");
        }
        if (userRepository.findByEmailIgnoreCase(req.getEmail().trim()).isPresent()) {
            throw new RuntimeException("A user with this email already exists");
        }

        SystemRole systemRole;
        String roleStr = req.getRole();
        if (roleStr == null || roleStr.isBlank()) {
            systemRole = SystemRole.EMPLOYEE;
        } else {
            switch (roleStr.trim().toUpperCase()) {
                case "MANAGER", "TEAM_LEAD", "TEAM_LEAD_MANAGER" -> systemRole = SystemRole.MANAGER;
                case "HR", "HR_SPECIALIST" -> systemRole = SystemRole.HR_SPECIALIST;
                case "DEPARTMENT_HEAD", "DEPT_HEAD", "DEPTHEAD" -> systemRole = SystemRole.DEPARTMENT_HEAD;
                case "L_AND_D_ADMIN", "LD_ADMIN", "LDADMIN", "L_AND_D_MENTOR", "LD_MENTOR" -> systemRole = SystemRole.L_AND_D_ADMIN;
                case "ADMIN", "SYSTEM_ADMIN" -> systemRole = SystemRole.SYSTEM_ADMIN;
                default -> systemRole = SystemRole.EMPLOYEE;
            }
        }

        // 1. Organization is REQUIRED for ALL roles
        String orgName = req.getCompany();
        if (orgName == null || orgName.trim().isEmpty()) {
            throw new RuntimeException("Organization / Company name is required for registration.");
        }
        orgName = orgName.trim();
        final String finalOrgName = orgName;
        Organization organization = organizationRepository.findByNameIgnoreCase(orgName)
                .orElseGet(() -> organizationRepository.save(new Organization(finalOrgName, finalOrgName + " Organization")));

        User user = new User();
        user.setFullName(req.getFullName().trim());
        user.setEmail(req.getEmail().trim());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setSystemRole(systemRole);
        user.setIsActive(true);
        user.setOrganization(organization);
        user.setCompany(orgName);
        user.setBio(req.getBio());
        user.setEducation(req.getEducation());
        user.setExperience(req.getExperience());

        Department dept = null;
        Role role = null;

        String rawDept = req.getDepartmentName() != null && !req.getDepartmentName().isBlank() ? req.getDepartmentName().trim() : null;
        String rawTeam = req.getTeamName() != null && !req.getTeamName().isBlank() ? req.getTeamName().trim() : null;
        String rawTitle = req.getRoleTitle() != null && !req.getRoleTitle().isBlank() ? req.getRoleTitle().trim() : null;

        // 2. Role-specific validation and assignment
        if (systemRole == SystemRole.EMPLOYEE) {
            if (rawDept == null) {
                throw new RuntimeException("Department is required for Employee registration.");
            }
            if (rawTeam == null) {
                throw new RuntimeException("Team / Domain is required for Employee registration.");
            }
            if (rawTitle == null || rawTitle.isBlank()) {
                if (rawTeam.equalsIgnoreCase("DevOps") || rawTeam.equalsIgnoreCase("Cloud & DevOps")) {
                    rawTitle = "DevOps Engineer";
                } else if (rawTeam.equalsIgnoreCase("Frontend") || rawTeam.equalsIgnoreCase("UI")) {
                    rawTitle = "Frontend Developer";
                } else if (rawTeam.equalsIgnoreCase("Full Stack")) {
                    rawTitle = "Full Stack Engineer";
                } else if (rawTeam.equalsIgnoreCase("QA")) {
                    rawTitle = "QA Automation Engineer";
                } else if (rawTeam.contains("Developer") || rawTeam.contains("Engineer") || rawTeam.contains("Specialist")) {
                    rawTitle = rawTeam;
                } else {
                    rawTitle = rawTeam + " Developer";
                }
            }
            if (!validateTeamForDepartment(rawDept, rawTeam)) {
                throw new RuntimeException("Team '" + rawTeam + "' is not a valid team within the '" + rawDept + "' department.");
            }

            final Organization finalOrg = organization;
            dept = departmentRepository.findByNameAndOrganizationId(rawDept, organization.getId())
                    .orElseGet(() -> {
                        Department d = new Department(rawDept, rawDept + " Department");
                        d.setOrganization(finalOrg);
                        return departmentRepository.save(d);
                    });
            user.setDepartment(dept);
            user.setTeamName(rawTeam);

            final Department finalDept = dept;
            final String finalTitle = rawTitle;
            role = roleRepository.findByTitle(finalTitle)
                    .orElseGet(() -> roleRepository.save(new Role(finalTitle, finalDept, finalTitle)));
            user.setRole(role);

            // Auto-assign to manager in this department
            final String targetDeptName = rawDept;
            User assignedMgr = userRepository.findFirstBySystemRoleAndOrganizationIdAndDepartmentId(
                    SystemRole.MANAGER, organization.getId(), dept.getId()
            ).orElseGet(() -> {
                return userRepository.findAll().stream()
                        .filter(u -> u.getSystemRole() == SystemRole.MANAGER && u.getDepartment() != null && targetDeptName.equalsIgnoreCase(u.getDepartment().getName()))
                        .findFirst().orElse(null);
            });
            if (assignedMgr != null) {
                user.setManager(assignedMgr);
            }

        } else if (systemRole == SystemRole.MANAGER) {
            if (rawDept == null) {
                throw new RuntimeException("Department is required for Manager registration.");
            }
            if (rawTeam != null) {
                throw new RuntimeException("Team/domain must not be specified for Manager. Managers oversee the entire department.");
            }

            final Organization finalOrg = organization;
            dept = departmentRepository.findByNameAndOrganizationId(rawDept, organization.getId())
                    .orElseGet(() -> {
                        Department d = new Department(rawDept, rawDept + " Department");
                        d.setOrganization(finalOrg);
                        return departmentRepository.save(d);
                    });

            // ENFORCE ONE MANAGER PER DEPARTMENT
            boolean managerAlreadyExists = userRepository.existsBySystemRoleAndOrganizationIdAndDepartmentId(
                    SystemRole.MANAGER, organization.getId(), dept.getId()
            );
            if (managerAlreadyExists) {
                throw new RuntimeException("This department already has a Manager.");
            }

            user.setDepartment(dept);
            user.setTeamName(null);

            final Department finalDept = dept;
            String mgrTitle = rawDept + " Manager";
            role = roleRepository.findByTitle(mgrTitle)
                    .orElseGet(() -> roleRepository.save(new Role(mgrTitle, finalDept, "Department Manager")));
            user.setRole(role);

        } else if (systemRole == SystemRole.DEPARTMENT_HEAD) {
            if (rawDept == null) {
                throw new RuntimeException("Department is required for Department Head registration.");
            }
            if (rawTeam != null) {
                throw new RuntimeException("Team/domain must not be specified for Department Head.");
            }

            final Organization finalOrg = organization;
            dept = departmentRepository.findByNameAndOrganizationId(rawDept, organization.getId())
                    .orElseGet(() -> {
                        Department d = new Department(rawDept, rawDept + " Department");
                        d.setOrganization(finalOrg);
                        return departmentRepository.save(d);
                    });
            user.setDepartment(dept);
            user.setTeamName(null);

            final Department finalDept = dept;
            String dhTitle = "Head of " + rawDept;
            role = roleRepository.findByTitle(dhTitle)
                    .orElseGet(() -> roleRepository.save(new Role(dhTitle, finalDept, "Head of Department")));
            user.setRole(role);

        } else if (systemRole == SystemRole.HR_SPECIALIST) {
            if (rawDept != null) {
                throw new RuntimeException("Department must not be specified for HR Specialist. HR operates organization-wide.");
            }
            if (rawTeam != null) {
                throw new RuntimeException("Team/domain must not be specified for HR Specialist.");
            }

            user.setDepartment(null);
            user.setTeamName(null);

            role = roleRepository.findByTitle("HR Specialist")
                    .orElseGet(() -> roleRepository.save(new Role("HR Specialist", null, "Organization-wide HR Specialist")));
            user.setRole(role);

        } else if (systemRole == SystemRole.L_AND_D_ADMIN) {
            if (rawDept != null) {
                throw new RuntimeException("Department must not be specified for L&D Admin. L&D operates organization-wide.");
            }
            if (rawTeam != null) {
                throw new RuntimeException("Team/domain must not be specified for L&D Admin.");
            }

            user.setDepartment(null);
            user.setTeamName(null);

            role = roleRepository.findByTitle("L&D Admin")
                    .orElseGet(() -> roleRepository.save(new Role("L&D Admin", null, "Organization-wide Learning & Development Admin")));
            user.setRole(role);

        } else if (systemRole == SystemRole.SYSTEM_ADMIN) {
            if (rawDept != null) {
                throw new RuntimeException("Department must not be specified for System Administrator. System Administration operates platform-wide.");
            }
            if (rawTeam != null) {
                throw new RuntimeException("Team/domain must not be specified for System Administrator.");
            }

            user.setDepartment(null);
            user.setTeamName(null);

            role = roleRepository.findByTitle("System Administrator")
                    .orElseGet(() -> roleRepository.save(new Role("System Administrator", null, "Platform System Administrator")));
            user.setRole(role);
        }

        user = userRepository.save(user);

        // If newly registered user is a Manager, link to Department and link all unmanaged employees
        if (systemRole == SystemRole.MANAGER && dept != null) {
            dept.setManagerId(user.getId());
            departmentRepository.save(dept);

            java.util.List<User> unmanaged = userRepository.findBySystemRoleAndOrganizationIdAndDepartmentIdAndManagerIsNull(
                    SystemRole.EMPLOYEE, organization.getId(), dept.getId()
            );
            for (User emp : unmanaged) {
                emp.setManager(user);
                userRepository.save(emp);
            }
        }

        // Save initial skills if provided (applicable for Employee)
        if (req.getSkills() != null && !req.getSkills().isEmpty() && systemRole == SystemRole.EMPLOYEE) {
            SkillCategory category = skillCategoryRepository.findAll().stream().findFirst().orElseGet(() -> {
                SkillCategory cat = new SkillCategory();
                cat.setName("Technical");
                cat.setDescription("General skills");
                return skillCategoryRepository.save(cat);
            });

            for (RegistrationRequest.SkillRatingDto rating : req.getSkills()) {
                if (rating.getSkillName() == null || rating.getSkillName().isBlank()) continue;

                Skill skill = null;
                if (rating.getSkillId() != null && !rating.getSkillId().isBlank() && isUuid(rating.getSkillId())) {
                    skill = skillRepository.findById(UUID.fromString(rating.getSkillId())).orElse(null);
                }
                if (skill == null) {
                    final String sName = rating.getSkillName();
                    skill = skillRepository.findAllByName(sName).stream().findFirst()
                            .orElseGet(() -> {
                                Skill newSkill = new Skill();
                                newSkill.setName(sName);
                                newSkill.setCategory(category);
                                newSkill.setDescription(sName + " proficiency");
                                return skillRepository.save(newSkill);
                            });
                }

                int level = rating.getProficiencyLevel() != null ? Math.min(5, Math.max(1, rating.getProficiencyLevel())) : 3;

                EmployeeSkill empSkill = new EmployeeSkill();
                empSkill.setUser(user);
                empSkill.setSkill(skill);
                empSkill.setProficiencyLevel(level);
                employeeSkillRepository.save(empSkill);
            }
        }

        // Process role benchmarks if provided
        if (req.getRoleBenchmarks() != null && !req.getRoleBenchmarks().isEmpty() && role != null) {
            SkillCategory category = skillCategoryRepository.findAll().stream().findFirst().orElse(null);
            for (RegistrationRequest.SkillRatingDto benchmarkDto : req.getRoleBenchmarks()) {
                if (benchmarkDto.getSkillName() == null || benchmarkDto.getSkillName().isBlank()) continue;
                
                final String sName = benchmarkDto.getSkillName();
                Skill skill = skillRepository.findAllByName(sName).stream().findFirst().orElseGet(() -> {
                    Skill newSkill = new Skill();
                    newSkill.setName(sName);
                    newSkill.setCategory(category);
                    newSkill.setDescription(sName + " proficiency");
                    return skillRepository.save(newSkill);
                });

                int expectedLevel = benchmarkDto.getProficiencyLevel() != null ? benchmarkDto.getProficiencyLevel() : 3;
                
                final UUID roleId = role.getId();
                final UUID skillId = skill.getId();
                RoleSkillBenchmark bm = benchmarkRepository.findByRoleIdAndSkillId(roleId, skillId).orElse(null);
                if (bm == null) {
                    bm = new RoleSkillBenchmark();
                    bm.setRole(role);
                    bm.setSkill(skill);
                }
                bm.setRequiredLevel(expectedLevel);
                bm.setIsCritical(expectedLevel >= 4);
                benchmarkRepository.save(bm);
            }
        }

        // Generate initial gap snapshot on registration if Employee
        if (systemRole == SystemRole.EMPLOYEE && role != null) {
            try {
                gapAnalysisService.recalculateUserGaps(user.getId());
                notificationService.createRecommendationNotification(
                        user,
                        "AI Personalized Learning Path Ready",
                        "A personalized learning path has been created for your " + role.getTitle() + " role benchmarks.",
                        "/learning"
                );
            } catch (Exception e) {
                System.err.println("Failed to calculate initial gap snapshot on registration: " + e.getMessage());
            }
        }

        String token = tokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getSystemRole().name(),
                organization.getId(),
                user.getDepartment() != null ? user.getDepartment().getId() : null,
                user.getTeamName()
        );

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getSystemRole().name(),
                role != null ? role.getTitle() : user.getRoleTitle(),
                dept != null ? dept.getName() : null,
                user.getTeamName(),
                organization.getId(),
                organization.getName()
        );
    }

    public AuthResponse registerUser(String fullName, String email, String password, String role) {
        RegistrationRequest req = new RegistrationRequest();
        req.setFullName(fullName);
        req.setEmail(email);
        req.setPassword(password);
        req.setRole(role);
        return registerUser(req);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User updateUserProfile(String userIdStr, Map<String, Object> profileData) {
        User user = getUserById(userIdStr);
        if (profileData.containsKey("fullName") && profileData.get("fullName") != null) {
            user.setFullName((String) profileData.get("fullName"));
        }
        if (profileData.containsKey("bio")) user.setBio((String) profileData.get("bio"));
        if (profileData.containsKey("company")) {
            String orgName = (String) profileData.get("company");
            if (orgName != null && !orgName.isBlank()) {
                Organization organization = organizationRepository.findByNameIgnoreCase(orgName)
                        .orElseGet(() -> organizationRepository.save(new Organization(orgName, orgName + " Organization")));
                user.setOrganization(organization);
                user.setCompany(orgName);
            }
        }
        if (profileData.containsKey("experience")) user.setExperience((String) profileData.get("experience"));
        if (profileData.containsKey("education")) user.setEducation((String) profileData.get("education"));

        // Only allow department / team / role updates if appropriate for role
        SystemRole role = user.getSystemRole();
        if (role == SystemRole.EMPLOYEE || role == SystemRole.MANAGER || role == SystemRole.DEPARTMENT_HEAD) {
            if (profileData.containsKey("departmentName") || profileData.containsKey("department")) {
                String deptName = (String) profileData.getOrDefault("departmentName", profileData.get("department"));
                if (deptName != null && !deptName.isBlank() && user.getOrganization() != null) {
                    final Organization finalOrg = user.getOrganization();
                    Department dept = departmentRepository.findByNameAndOrganizationId(deptName, finalOrg.getId())
                            .orElseGet(() -> {
                                Department d = new Department(deptName, deptName + " Department");
                                d.setOrganization(finalOrg);
                                return departmentRepository.save(d);
                            });
                    user.setDepartment(dept);
                }
            }
            if (role == SystemRole.EMPLOYEE && profileData.containsKey("teamName")) {
                String team = (String) profileData.get("teamName");
                if (team != null && !team.isBlank()) {
                    user.setTeamName(team.trim());
                }
            }
            if (role == SystemRole.EMPLOYEE && (profileData.containsKey("roleTitle") || profileData.containsKey("role"))) {
                String roleTitle = (String) profileData.getOrDefault("roleTitle", profileData.get("role"));
                if (roleTitle != null && !roleTitle.isBlank() && user.getDepartment() != null) {
                    Role r = roleRepository.findAllByTitle(roleTitle).stream().findFirst().orElse(null);
                    if (r == null) {
                        r = roleRepository.save(new Role(roleTitle, user.getDepartment(), roleTitle));
                    }
                    user.setRole(r);
                }
            }
        } else {
            // Organization-wide roles (HR, L&D, Admin) must never be assigned a department or team
            user.setDepartment(null);
            user.setTeamName(null);
        }

        boolean companyOrDeptChanged = profileData.containsKey("company") || profileData.containsKey("departmentName") || profileData.containsKey("department");
        if (user.getSystemRole() == SystemRole.EMPLOYEE && user.getDepartment() != null) {
            if (user.getManager() == null || companyOrDeptChanged) {
                User assignedMgr = null;
                if (user.getOrganization() != null) {
                    assignedMgr = userRepository.findFirstBySystemRoleAndOrganizationIdAndDepartmentId(
                            SystemRole.MANAGER, user.getOrganization().getId(), user.getDepartment().getId()
                    ).orElse(null);
                }
                if (assignedMgr == null) {
                    final String targetDept = user.getDepartment().getName();
                    assignedMgr = userRepository.findAll().stream()
                            .filter(u -> u.getSystemRole() == SystemRole.MANAGER && u.getDepartment() != null && targetDept.equalsIgnoreCase(u.getDepartment().getName()))
                            .findFirst().orElse(null);
                }
                if (assignedMgr != null) {
                    user.setManager(assignedMgr);
                }
            }
        } else if (user.getSystemRole() == SystemRole.MANAGER && user.getOrganization() != null && user.getDepartment() != null) {
            java.util.List<User> unmanaged = userRepository.findBySystemRoleAndOrganizationIdAndDepartmentIdAndManagerIsNull(
                    SystemRole.EMPLOYEE, user.getOrganization().getId(), user.getDepartment().getId()
            );
            for (User emp : unmanaged) {
                emp.setManager(user);
                userRepository.save(emp);
            }
        }

        user = userRepository.save(user);

        if (profileData.containsKey("skills")) {
            Object skillsObj = profileData.get("skills");
            if (skillsObj instanceof List) {
                List<?> skillsList = (List<?>) skillsObj;
                SkillCategory category = skillCategoryRepository.findAll().stream().findFirst().orElseGet(() -> {
                    SkillCategory cat = new SkillCategory();
                    cat.setName("Technical");
                    cat.setDescription("General skills");
                    return skillCategoryRepository.save(cat);
                });

                for (Object item : skillsList) {
                    if (item instanceof Map) {
                        Map<?, ?> rating = (Map<?, ?>) item;
                        String skillName = (String) rating.get("skillName");
                        if (skillName == null || skillName.isBlank()) continue;

                        Skill skill = skillRepository.findAllByName(skillName).stream().findFirst()
                                .orElseGet(() -> {
                                    Skill newSkill = new Skill();
                                    newSkill.setName(skillName);
                                    newSkill.setCategory(category);
                                    newSkill.setDescription(skillName + " proficiency");
                                    return skillRepository.save(newSkill);
                                });

                        Object lvlObj = rating.get("proficiencyLevel");
                        int level = 3;
                        if (lvlObj instanceof Integer) {
                            level = (Integer) lvlObj;
                        } else if (lvlObj instanceof String) {
                            try { level = Integer.parseInt((String) lvlObj); } catch (Exception ignored) {}
                        }
                        level = Math.min(5, Math.max(1, level));

                        final Skill finalSkill = skill;
                        EmployeeSkill empSkill = employeeSkillRepository.findByUserIdAndSkillId(user.getId(), skill.getId()).orElse(null);
                        if (empSkill == null) {
                            empSkill = new EmployeeSkill();
                            empSkill.setUser(user);
                            empSkill.setSkill(finalSkill);
                        }
                        empSkill.setProficiencyLevel(level);
                        employeeSkillRepository.save(empSkill);
                    }
                }
            }
        }

        if (profileData.containsKey("roleBenchmarks")) {
            Object benchmarksObj = profileData.get("roleBenchmarks");
            if (benchmarksObj instanceof List && user.getRole() != null) {
                List<?> benchmarksList = (List<?>) benchmarksObj;
                SkillCategory category = skillCategoryRepository.findAll().stream().findFirst().orElseGet(() -> {
                    SkillCategory cat = new SkillCategory();
                    cat.setName("Technical");
                    cat.setDescription("General skills");
                    return skillCategoryRepository.save(cat);
                });

                for (Object item : benchmarksList) {
                    if (item instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> benchmarkMap = (Map<String, Object>) item;
                        String skillName = (String) benchmarkMap.get("skillName");
                        if (skillName == null) skillName = (String) benchmarkMap.get("name");
                        if (skillName == null || skillName.isBlank()) continue;
                        final String sName = skillName;

                        Skill skill = skillRepository.findAllByName(sName).stream().findFirst()
                                .orElseGet(() -> {
                                    Skill newSkill = new Skill();
                                    newSkill.setName(sName);
                                    newSkill.setCategory(category);
                                    newSkill.setDescription(sName + " proficiency");
                                    return skillRepository.save(newSkill);
                                });

                        Object expectedLvlObj = benchmarkMap.get("expectedLevel");
                        if (expectedLvlObj == null) expectedLvlObj = benchmarkMap.get("proficiencyLevel");
                        int expectedLevel = 3;
                        if (expectedLvlObj instanceof Integer) {
                            expectedLevel = (Integer) expectedLvlObj;
                        } else if (expectedLvlObj instanceof String) {
                            try { expectedLevel = Integer.parseInt((String) expectedLvlObj); } catch (Exception ignored) {}
                        }

                        final UUID roleId = user.getRole().getId();
                        final UUID skillId = skill.getId();
                        RoleSkillBenchmark bm = benchmarkRepository.findByRoleIdAndSkillId(roleId, skillId).orElse(null);
                        if (bm == null) {
                            bm = new RoleSkillBenchmark();
                            bm.setRole(user.getRole());
                            bm.setSkill(skill);
                        }
                        bm.setRequiredLevel(expectedLevel);
                        bm.setIsCritical(expectedLevel >= 4);
                        benchmarkRepository.save(bm);
                    }
                }
            }
        }
        
        if (profileData.containsKey("skills") || profileData.containsKey("roleBenchmarks") || profileData.containsKey("roleTitle") || profileData.containsKey("role")) {
            try {
                gapAnalysisService.recalculateUserGaps(user.getId());
            } catch (Exception e) {
                System.err.println("Failed to recalculate gaps on profile update: " + e.getMessage());
            }
        }
        
        return user;
    }

    private boolean isUuid(String input) {
        if (input == null || input.isBlank()) return false;
        try {
            UUID.fromString(input);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public java.util.List<String> getManagerCompanies() {
        return userRepository.findDistinctCompaniesForManagers();
    }
}
