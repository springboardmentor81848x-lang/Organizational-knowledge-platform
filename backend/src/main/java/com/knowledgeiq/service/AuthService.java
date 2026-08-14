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

    @org.springframework.transaction.annotation.Transactional
    public AuthResponse registerUser(RegistrationRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("A user with this email already exists");
        }

        SystemRole systemRole;
        String roleStr = req.getRole();
        if (roleStr == null || roleStr.isBlank()) {
            systemRole = SystemRole.EMPLOYEE;
        } else {
            switch (roleStr.toUpperCase()) {
                case "MANAGER" -> systemRole = SystemRole.MANAGER;
                case "HR", "HR_SPECIALIST" -> systemRole = SystemRole.HR_SPECIALIST;
                case "DEPARTMENT_HEAD", "DEPT_HEAD", "DEPTHEAD" -> systemRole = SystemRole.DEPARTMENT_HEAD;
                case "L_AND_D_ADMIN", "LD_ADMIN", "LDADMIN" -> systemRole = SystemRole.L_AND_D_ADMIN;
                case "ADMIN", "SYSTEM_ADMIN" -> systemRole = SystemRole.SYSTEM_ADMIN;
                default -> systemRole = SystemRole.EMPLOYEE;
            }
        }

        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setSystemRole(systemRole);
        user.setIsActive(true);
        // Resolve Organization
        String orgName = req.getCompany() != null && !req.getCompany().isBlank() 
                ? req.getCompany().trim() 
                : "KnowledgeIQ Enterprise";
        Organization organization = organizationRepository.findByNameIgnoreCase(orgName)
                .orElseGet(() -> {
                    Organization org = new Organization(orgName, orgName + " Organization");
                    return organizationRepository.save(org);
                });
        user.setOrganization(organization);
        user.setCompany(orgName);
        user.setBio(req.getBio());
        user.setEducation(req.getEducation());
        user.setExperience(req.getExperience());

        // Resolve Department (scoped to Organization)
        String deptName = req.getDepartmentName() != null && !req.getDepartmentName().isBlank()
                ? req.getDepartmentName().trim()
                : "Engineering";
        final Organization finalOrg = organization;
        Department dept = departmentRepository.findByNameAndOrganizationId(deptName, organization.getId())
                .orElseGet(() -> {
                    Department d = new Department(deptName, deptName + " Department");
                    d.setOrganization(finalOrg);
                    return departmentRepository.save(d);
                });
        user.setDepartment(dept);

        // Resolve Role
        String roleTitle = req.getRoleTitle() != null && !req.getRoleTitle().isBlank()
                ? req.getRoleTitle()
                : (systemRole == SystemRole.HR_SPECIALIST ? "HR Specialist" : "Software Engineer");
        Role role = roleRepository.findAllByTitle(roleTitle).stream().findFirst()
                .orElseGet(() -> roleRepository.save(new Role(roleTitle, dept, roleTitle)));
        user.setRole(role);

        // Map employee to manager within organization and department
        if (systemRole == SystemRole.EMPLOYEE) {
            userRepository.findFirstBySystemRoleAndOrganizationIdAndDepartmentId(
                    SystemRole.MANAGER, organization.getId(), dept.getId()
            ).ifPresent(user::setManager);
        }

        user = userRepository.save(user);

        // Map existing unmanaged employees to this manager within organization and department
        if (systemRole == SystemRole.MANAGER) {
            java.util.List<User> unmanaged = userRepository.findBySystemRoleAndOrganizationIdAndDepartmentIdAndManagerIsNull(
                    SystemRole.EMPLOYEE, organization.getId(), dept.getId()
            );
            for (User emp : unmanaged) {
                emp.setManager(user);
                userRepository.save(emp);
            }
        }

        // Save initial skills if provided
        if (req.getSkills() != null && !req.getSkills().isEmpty()) {
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

        // Generate initial gap snapshot on registration
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

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getSystemRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getSystemRole().name(),
                role.getTitle(),
                dept.getName()
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

        if (profileData.containsKey("roleTitle") || profileData.containsKey("role")) {
            String roleTitle = (String) profileData.getOrDefault("roleTitle", profileData.get("role"));
            if (roleTitle != null && !roleTitle.isBlank() && user.getDepartment() != null) {
                Role role = roleRepository.findAllByTitle(roleTitle).stream().findFirst().orElse(null);
                if (role == null) {
                    role = roleRepository.save(new Role(roleTitle, user.getDepartment(), roleTitle));
                }
                user.setRole(role);
            }
        }

        boolean companyOrDeptChanged = profileData.containsKey("company") || profileData.containsKey("departmentName") || profileData.containsKey("department");
        if (companyOrDeptChanged && user.getOrganization() != null && user.getDepartment() != null) {
            if (user.getSystemRole() == SystemRole.EMPLOYEE) {
                java.util.Optional<User> mgrOpt = userRepository.findFirstBySystemRoleAndOrganizationIdAndDepartmentId(
                        SystemRole.MANAGER, user.getOrganization().getId(), user.getDepartment().getId()
                );
                if (mgrOpt.isPresent()) {
                    user.setManager(mgrOpt.get());
                } else {
                    user.setManager(null);
                }
            } else if (user.getSystemRole() == SystemRole.MANAGER) {
                java.util.List<User> unmanaged = userRepository.findBySystemRoleAndOrganizationIdAndDepartmentIdAndManagerIsNull(
                        SystemRole.EMPLOYEE, user.getOrganization().getId(), user.getDepartment().getId()
                );
                for (User emp : unmanaged) {
                    emp.setManager(user);
                    userRepository.save(emp);
                }
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
