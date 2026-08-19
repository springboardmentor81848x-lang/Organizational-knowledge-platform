package com.knowledgeiq.config;

import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private RoleSkillBenchmarkRepository benchmarkRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TrainingCourseRepository courseRepository;

    @Autowired
    private com.knowledgeiq.service.GapAnalysisService gapAnalysisService;

    @Autowired
    private com.knowledgeiq.service.NotificationService notificationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // --- 1. Engineering Department ---
        User manager = ensureUserExists("manager@northwind.io", "Marcus King", SystemRole.MANAGER, "Engineering", null, "Engineering Manager");
        User employee = ensureUserExists("employee@northwind.io", "Ava Chen", SystemRole.EMPLOYEE, "Engineering", "Java", "Senior Product Engineer");
        User softwareEngineer = ensureUserExists("swe@northwind.io", "Liam Harper", SystemRole.EMPLOYEE, "Engineering", "Java", "Software Engineer");
        User juniorDeveloper = ensureUserExists("juniordev@northwind.io", "Chloe Adams", SystemRole.EMPLOYEE, "Engineering", "Java", "Junior Developer");
        User jordanTaylor = ensureUserExists("jordan.taylor@knowledgeiq.com", "Jordan Taylor", SystemRole.EMPLOYEE, "Engineering", "DevOps", "DevOps & Security Specialist");
        User raviShah = ensureUserExists("ravi.shah@knowledgeiq.com", "Ravi Shah", SystemRole.EMPLOYEE, "Engineering", "Frontend", "Full Stack Engineer I");
        User graceKim = ensureUserExists("grace.kim@knowledgeiq.com", "Grace Kim", SystemRole.EMPLOYEE, "Engineering", "Java", "Backend Engineer II");
        User sofiaRuiz = ensureUserExists("sofia.ruiz@knowledgeiq.com", "Sofia Ruiz", SystemRole.EMPLOYEE, "Engineering", "Frontend", "Lead UI/UX Engineer");
        User danielOsei = ensureUserExists("daniel.osei@knowledgeiq.com", "Daniel Osei", SystemRole.EMPLOYEE, "Engineering", "DevOps", "Cloud Infrastructure Engineer");
        User alexRivera = ensureUserExists("alex.rivera@knowledgeiq.com", "Alex Rivera", SystemRole.EMPLOYEE, "Engineering", "Python", "Python Developer");
        User depthead = ensureUserExists("depthead@northwind.io", "Krrish", SystemRole.DEPARTMENT_HEAD, "Engineering", null, "Head of Department");
        User deptheadMkt = ensureUserExists("strange@northwind.io", "Stephen Strange", SystemRole.DEPARTMENT_HEAD, "Marketing", null, "Head of Department");

        // --- 2. Marketing Department ---
        User financeMgr = ensureUserExists("finance.mgr@northwind.io", "Elena Vance", SystemRole.MANAGER, "Marketing", null, "Marketing Manager");
        User thomasCole = ensureUserExists("thomas.cole@knowledgeiq.com", "Thomas Cole", SystemRole.EMPLOYEE, "Marketing", "Accounting", "Senior Accountant");
        User mayaPatel = ensureUserExists("maya.patel@knowledgeiq.com", "Maya Patel", SystemRole.EMPLOYEE, "Marketing", "Accounting", "Payroll Specialist");
        User lucasScott = ensureUserExists("lucas.scott@knowledgeiq.com", "Lucas Scott", SystemRole.EMPLOYEE, "Marketing", "Analysis", "Financial Analyst");
        User sarahJenkins = ensureUserExists("sarah.jenkins@knowledgeiq.com", "Sarah Jenkins", SystemRole.EMPLOYEE, "Marketing", "Analysis", "Budget & Planning Analyst");

        // --- 3. Marketing Department ---
        User marketingMgr = ensureUserExists("marketing.mgr@northwind.io", "Rachel Green", SystemRole.MANAGER, "Marketing", null, "Marketing Manager");
        User evanWright = ensureUserExists("evan.wright@knowledgeiq.com", "Evan Wright", SystemRole.EMPLOYEE, "Marketing", "Digital Marketing", "Digital Marketing Specialist");
        User zoeChen = ensureUserExists("zoe.chen@knowledgeiq.com", "Zoe Chen", SystemRole.EMPLOYEE, "Marketing", "Digital Marketing", "Growth & SEO Strategist");
        User emmaWatson = ensureUserExists("emma.watson@knowledgeiq.com", "Emma Watson", SystemRole.EMPLOYEE, "Marketing", "Content", "Content & Copywriting Lead");
        User oliverReed = ensureUserExists("oliver.reed@knowledgeiq.com", "Oliver Reed", SystemRole.EMPLOYEE, "Marketing", "Content", "Brand Copywriter");

        // --- 4. Organization-wide Roles ---
        User hr = ensureUserExists("hr@northwind.io", "Vijay", SystemRole.HR_SPECIALIST, null, null, "HR Specialist");
        User ldadmin = ensureUserExists("ldadmin@northwind.io", "Nobita Nobi", SystemRole.L_AND_D_ADMIN, null, null, "L&D Admin");
        User admin = ensureUserExists("admin@northwind.io", "Krishna", SystemRole.SYSTEM_ADMIN, null, null, "System Administrator");
        
        SkillCategory techCategory = ensureCategory("Technical", "Engineering and software development skills");
        SkillCategory mktCategory = ensureCategory("Marketing", "Digital marketing, SEO, content, and analytics");
        SkillCategory hrCategory = ensureCategory("Human Resources", "People operations, recruiting, and compliance");
        SkillCategory softCategory = ensureCategory("Soft Skills", "Interpersonal and communication skills");

        // Technical Skills
        Skill reactSkill = ensureSkill("React", "Frontend framework", techCategory);
        Skill javaSkill = ensureSkill("Java Spring Boot", "Backend framework", techCategory);
        Skill sqlSkill = ensureSkill("SQL", "Database querying", techCategory);
        Skill awsSkill = ensureSkill("Cloud / AWS", "Cloud infrastructure", techCategory);

        // Seed Core Training Courses with Verified External Learning Resource URLs
        ensureCourse("Spring Boot & Microservices Development", "Learn modern Java enterprise application architecture and REST API development with Spring Boot.", javaSkill, 5, "Spring / VMware", "https://spring.io/guides/gs/spring-boot", 8);
        ensureCourse("Modern React Architecture & Component Design", "Comprehensive guide to React 18/19, custom hooks, state management, and modern component patterns.", reactSkill, 4, "React / Meta", "https://react.dev/learn", 6);
        ensureCourse("Advanced SQL Query Optimization & Relational Modeling", "Master complex relational database queries, indexing strategies, and PostgreSQL optimization.", sqlSkill, 4, "PostgreSQL", "https://www.postgresql.org/docs/current/tutorial.html", 5);
        ensureCourse("AWS Cloud Solutions Architect Foundations", "Hands-on cloud architecture fundamentals, IAM security, VPC networking, and compute scaling.", awsSkill, 4, "Amazon Web Services", "https://aws.amazon.com/getting-started/", 10);
        ensureCourse("Executive Communication & Stakeholder Alignment", "Structured communication frameworks for technical leadership, cross-functional collaboration, and alignment.", ensureSkill("Communication & Stakeholder Management", "Clear oral and written communication", softCategory), 4, "Coursera", "https://www.coursera.org/learn/executive-presence", 4);

        // Marketing Skills
        Skill contentSkill = ensureSkill("Content Strategy & Copywriting", "Content creation and messaging", mktCategory);
        Skill seoSkill = ensureSkill("SEO & Digital Advertising", "Search engine optimization & PPC", mktCategory);
        Skill socialSkill = ensureSkill("Social Media Analytics & Growth", "Social channels and user growth", mktCategory);
        Skill campaignSkill = ensureSkill("Campaign Management & ROI", "Marketing campaign optimization", mktCategory);
        Skill brandSkill = ensureSkill("Brand Strategy", "Brand identity and positioning", mktCategory);

        // HR Skills
        Skill recruitingSkill = ensureSkill("Talent Acquisition & Recruiting", "Sourcing and interviewing candidates", hrCategory);
        Skill perfSkill = ensureSkill("Performance Management", "Employee evaluations and career progression", hrCategory);
        Skill hrComplianceSkill = ensureSkill("HR Compliance & Policy", "Labor laws and organizational policies", hrCategory);

        // Soft Skills
        Skill comSkill = ensureSkill("Communication & Stakeholder Management", "Clear oral and written communication", softCategory);

        if (benchmarkRepository.count() == 0) {
            // Benchmarks for Software Engineer (Ava Chen)
            RoleSkillBenchmark b1 = new RoleSkillBenchmark(); b1.setRole(employee.getRole()); b1.setSkill(reactSkill); b1.setRequiredLevel(4); b1.setIsCritical(true); benchmarkRepository.save(b1);
            RoleSkillBenchmark b2 = new RoleSkillBenchmark(); b2.setRole(employee.getRole()); b2.setSkill(javaSkill); b2.setRequiredLevel(5); b2.setIsCritical(true); benchmarkRepository.save(b2);
            RoleSkillBenchmark b3 = new RoleSkillBenchmark(); b3.setRole(employee.getRole()); b3.setSkill(sqlSkill); b3.setRequiredLevel(3); b3.setIsCritical(false); benchmarkRepository.save(b3);
            RoleSkillBenchmark b4 = new RoleSkillBenchmark(); b4.setRole(employee.getRole()); b4.setSkill(awsSkill); b4.setRequiredLevel(4); b4.setIsCritical(true); benchmarkRepository.save(b4);
            RoleSkillBenchmark b5 = new RoleSkillBenchmark(); b5.setRole(employee.getRole()); b5.setSkill(comSkill); b5.setRequiredLevel(4); b5.setIsCritical(false); benchmarkRepository.save(b5);

            EmployeeSkill e1 = new EmployeeSkill(); e1.setUser(employee); e1.setSkill(reactSkill); e1.setProficiencyLevel(4); employeeSkillRepository.save(e1);
            EmployeeSkill e2 = new EmployeeSkill(); e2.setUser(employee); e2.setSkill(javaSkill); e2.setProficiencyLevel(3); employeeSkillRepository.save(e2);
            EmployeeSkill e3 = new EmployeeSkill(); e3.setUser(employee); e3.setSkill(sqlSkill); e3.setProficiencyLevel(4); employeeSkillRepository.save(e3);
            EmployeeSkill e4 = new EmployeeSkill(); e4.setUser(employee); e4.setSkill(awsSkill); e4.setProficiencyLevel(2); employeeSkillRepository.save(e4);
            EmployeeSkill e5 = new EmployeeSkill(); e5.setUser(employee); e5.setSkill(comSkill); e5.setProficiencyLevel(3); employeeSkillRepository.save(e5);

            // Benchmarks for HR Lead (Priya Nair)
            RoleSkillBenchmark b6 = new RoleSkillBenchmark(); b6.setRole(hr.getRole()); b6.setSkill(recruitingSkill); b6.setRequiredLevel(4); b6.setIsCritical(true); benchmarkRepository.save(b6);
            RoleSkillBenchmark b7 = new RoleSkillBenchmark(); b7.setRole(hr.getRole()); b7.setSkill(perfSkill); b7.setRequiredLevel(5); b7.setIsCritical(true); benchmarkRepository.save(b7);
            RoleSkillBenchmark b8 = new RoleSkillBenchmark(); b8.setRole(hr.getRole()); b8.setSkill(hrComplianceSkill); b8.setRequiredLevel(4); b8.setIsCritical(true); benchmarkRepository.save(b8);
            RoleSkillBenchmark b9 = new RoleSkillBenchmark(); b9.setRole(hr.getRole()); b9.setSkill(comSkill); b9.setRequiredLevel(5); b9.setIsCritical(false); benchmarkRepository.save(b9);
            EmployeeSkill e6 = new EmployeeSkill(); e6.setUser(hr); e6.setSkill(comSkill); e6.setProficiencyLevel(4); employeeSkillRepository.save(e6);
        }

        if (notificationRepository.count() == 0) {
            try {
                notificationService.createNotification(
                        manager,
                        "CRITICAL_GAP",
                        "Critical Risk Alert: Java Spring Boot Shortage",
                        "Liam Harper (Team 1) has a 60% proficiency discrepancy in Java Spring Boot, flagged as Critical Risk.",
                        "CRITICAL",
                        "SKILL_GAP",
                        softwareEngineer.getId().toString(),
                        "/interventions"
                );
                notificationService.createNotification(
                        manager,
                        "GAP_ALERT",
                        "At Risk Warning: DevOps & Container Security Gap",
                        "Jordan Taylor (Team 2) requires skill elevation in DevOps & Container Security (50% gap score).",
                        "HIGH",
                        "SKILL_GAP",
                        jordanTaylor.getId().toString(),
                        "/interventions"
                );
                notificationService.createNotification(
                        manager,
                        "GAP_RESOLVED",
                        "On Track Achievement: Role Benchmarks Met",
                        "Chloe Adams (Team 1) achieved target benchmark level (score 18/20, 60% target mastery) with zero critical shortages.",
                        "LOW",
                        "SKILL_GAP",
                        juniorDeveloper.getId().toString(),
                        "/interventions"
                );
                notificationService.createNotification(
                        manager,
                        "RECOMMENDATION",
                        "Course Assigned: Enterprise Spring Boot Microservices Security",
                        "Marcus Lee assigned 'Enterprise Spring Boot Microservices Security' course to Liam Harper (Team 1).",
                        "MEDIUM",
                        "COURSE",
                        softwareEngineer.getId().toString(),
                        "/interventions"
                );
                notificationService.createNotification(
                        manager,
                        "RECOMMENDATION",
                        "Course Assigned: Advanced Container & Docker Security",
                        "Marcus Lee assigned 'Advanced Container & Docker Security' course to Jordan Taylor (Team 2).",
                        "MEDIUM",
                        "COURSE",
                        jordanTaylor.getId().toString(),
                        "/interventions"
                );
                notificationService.createNotification(
                        manager,
                        "RECOMMENDATION",
                        "Course Assigned: Figma & Micro-Frontend Design Systems",
                        "Marcus Lee assigned 'Figma & Micro-Frontend Design Systems' course to Sofia Ruiz (Team 3).",
                        "LOW",
                        "COURSE",
                        sofiaRuiz.getId().toString(),
                        "/interventions"
                );
            } catch (Exception e) {
                System.err.println("Initial notifications seeding skipped: " + e.getMessage());
            }
        }

        // Custom Data Correction: Update Victor and change Finance to Marketing
        try {
            Organization defaultOrg = organizationRepository.findByNameIgnoreCase("KnowledgeIQ Enterprise")
                    .orElseGet(() -> organizationRepository.save(new Organization("KnowledgeIQ Enterprise", "Default organization")));

            // Find or create Marketing department safely
            Department mktDept = departmentRepository.findAll().stream()
                    .filter(d -> "Marketing".equalsIgnoreCase(d.getName()))
                    .findFirst()
                    .orElseGet(() -> {
                        Department d = new Department("Marketing", "Marketing Department");
                        d.setOrganization(defaultOrg);
                        return departmentRepository.save(d);
                    });

            // Find or create Marketing Manager role safely
            Role mktRole = roleRepository.findAll().stream()
                    .filter(r -> "Marketing Manager".equalsIgnoreCase(r.getTitle()))
                    .findFirst()
                    .orElseGet(() -> roleRepository.save(new Role("Marketing Manager", mktDept, "Marketing Manager")));

            // Rename existing Finance department to Marketing if it exists
            departmentRepository.findAll().forEach(dept -> {
                if ("Finance".equalsIgnoreCase(dept.getName()) || "Markating".equalsIgnoreCase(dept.getName())) {
                    dept.setName("Marketing");
                    dept.setDescription("Marketing Department");
                    departmentRepository.save(dept);
                }
            });

            // Rename Finance Manager role to Marketing Manager
            roleRepository.findAll().forEach(role -> {
                String title = role.getTitle();
                if (title != null) {
                    if (title.equalsIgnoreCase("Finance Manager")) {
                        role.setTitle("Marketing Manager");
                        role.setDepartment(mktDept);
                        roleRepository.save(role);
                    } else if (title.toLowerCase().contains("finance")) {
                        role.setTitle(title.replaceAll("(?i)finance", "Marketing"));
                        role.setDepartment(mktDept);
                        roleRepository.save(role);
                    }
                }
            });

            // Update Victor and any other users referencing Finance
            userRepository.findAll().forEach(u -> {
                boolean updated = false;
                
                // If it is Victor
                if ("doom@gmail.com".equalsIgnoreCase(u.getEmail()) || "Victor".equalsIgnoreCase(u.getFullName())) {
                    u.setDepartment(mktDept);
                    u.setRole(mktRole);
                    u.setBio(u.getBio() != null ? u.getBio().replaceAll("(?i)finance", "Marketing") : null);
                    updated = true;
                }
                
                // Move anyone in Finance department to Marketing
                if (u.getDepartment() != null && ("Finance".equalsIgnoreCase(u.getDepartment().getName()) || "Markating".equalsIgnoreCase(u.getDepartment().getName()))) {
                    u.setDepartment(mktDept);
                    updated = true;
                }

                // If their role is Finance Manager, change it to Marketing Manager
                if (u.getRole() != null && "Finance Manager".equalsIgnoreCase(u.getRole().getTitle())) {
                    u.setRole(mktRole);
                    updated = true;
                }

                if (updated) {
                    userRepository.save(u);
                }
            });

            // Update L&D Admin name to Nobita Nobi
            userRepository.findByEmail("ldadmin@northwind.io").ifPresent(u -> {
                if (!"Nobita Nobi".equalsIgnoreCase(u.getFullName())) {
                    u.setFullName("Nobita Nobi");
                    userRepository.save(u);
                }
            });

            // Update Engineering Manager name to Marcus King
            userRepository.findByEmail("manager@northwind.io").ifPresent(u -> {
                if (!"Marcus King".equalsIgnoreCase(u.getFullName())) {
                    u.setFullName("Marcus King");
                    userRepository.save(u);
                }
            });

            // Update HR Specialist name to Vijay
            userRepository.findByEmail("hr@northwind.io").ifPresent(u -> {
                if (!"Vijay".equalsIgnoreCase(u.getFullName())) {
                    u.setFullName("Vijay");
                    userRepository.save(u);
                }
            });

            // Update Department Head name to Krrish
            userRepository.findByEmail("depthead@northwind.io").ifPresent(u -> {
                if (!"Krrish".equalsIgnoreCase(u.getFullName())) {
                    u.setFullName("Krrish");
                    userRepository.save(u);
                }
            });

            // Ensure Department Head Stephen Strange exists dynamically
            if (!userRepository.findByEmail("strange@northwind.io").isPresent()) {
                User strange = new User();
                strange.setEmail("strange@northwind.io");
                strange.setFullName("Stephen Strange");
                strange.setSystemRole(com.knowledgeiq.model.SystemRole.DEPARTMENT_HEAD);
                strange.setDepartment(mktDept);
                strange.setOrganization(defaultOrg);
                // Try to find Head of Department role
                strange.setRole(roleRepository.findAll().stream()
                        .filter(r -> "Head of Department".equalsIgnoreCase(r.getTitle()))
                        .findFirst().orElse(null));
                userRepository.save(strange);
            } else {
                userRepository.findByEmail("strange@northwind.io").ifPresent(u -> {
                    if (!"Stephen Strange".equalsIgnoreCase(u.getFullName())) {
                        u.setFullName("Stephen Strange");
                        userRepository.save(u);
                    }
                });
            }

            // Update System Administrator name to Krishna
            userRepository.findByEmail("admin@northwind.io").ifPresent(u -> {
                if (!"Krishna".equalsIgnoreCase(u.getFullName())) {
                    u.setFullName("Krishna");
                    userRepository.save(u);
                }
            });
        } catch (Exception e) {
            System.err.println("Error updating Finance to Marketing & Nobita/Vijay/Krrish/Strange/Krishna: " + e.getMessage());
        }
    }

    private User ensureUserExists(String email, String fullName, SystemRole systemRole, String deptName, String teamName, String roleTitle) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            Organization defaultOrg = organizationRepository.findByNameIgnoreCase("KnowledgeIQ Enterprise")
                    .orElseGet(() -> organizationRepository.save(new Organization("KnowledgeIQ Enterprise", "Default organization")));

            User user = new User();
            user.setEmail(email);
            user.setFullName(fullName);
            user.setPasswordHash(passwordEncoder.encode("password123"));
            user.setSystemRole(systemRole);
            user.setIsActive(true);
            user.setOrganization(defaultOrg);
            user.setCompany(defaultOrg.getName());

            Department dept = null;
            if (deptName != null && !deptName.isBlank()) {
                final String targetDeptName = deptName;
                dept = departmentRepository.findAll().stream()
                        .filter(d -> targetDeptName.equalsIgnoreCase(d.getName()))
                        .findFirst()
                        .orElseGet(() -> {
                            Department d = new Department(targetDeptName, targetDeptName + " Department");
                            d.setOrganization(defaultOrg);
                            return departmentRepository.save(d);
                        });
                user.setDepartment(dept);
            } else {
                user.setDepartment(null);
            }

            if (systemRole == SystemRole.EMPLOYEE) {
                user.setTeamName(teamName != null ? teamName : "Java");
            } else {
                user.setTeamName(null);
            }

            final Department finalDept = dept;
            Role role = roleRepository.findByTitle(roleTitle)
                    .orElseGet(() -> roleRepository.save(new Role(roleTitle, finalDept, roleTitle)));
            user.setRole(role);

            if (systemRole == SystemRole.EMPLOYEE && dept != null) {
                userRepository.findFirstBySystemRoleAndOrganizationIdAndDepartmentId(
                        SystemRole.MANAGER, defaultOrg.getId(), dept.getId()
                ).ifPresent(user::setManager);
            }

            return userRepository.save(user);
        });
    }

    private SkillCategory ensureCategory(String name, String description) {
        return skillCategoryRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    SkillCategory cat = new SkillCategory();
                    cat.setName(name);
                    cat.setDescription(description);
                    return skillCategoryRepository.save(cat);
                });
    }

    private Skill ensureSkill(String name, String description, SkillCategory category) {
        return skillRepository.findAll().stream()
                .filter(s -> s.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Skill skill = new Skill();
                    skill.setName(name);
                    skill.setDescription(description);
                    skill.setCategory(category);
                    return skillRepository.save(skill);
                });
    }

    private TrainingCourse ensureCourse(String title, String description, Skill targetSkill, int targetLevel, String provider, String courseUrl, int durationHours) {
        return courseRepository.findAll().stream()
                .filter(c -> c.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .orElseGet(() -> {
                    TrainingCourse tc = new TrainingCourse();
                    tc.setTitle(title);
                    tc.setDescription(description);
                    tc.setTargetSkill(targetSkill);
                    tc.setTargetLevel(targetLevel);
                    tc.setProvider(provider);
                    tc.setCourseUrl(courseUrl);
                    tc.setDurationHours(durationHours);
                    return courseRepository.save(tc);
                });
    }
}
