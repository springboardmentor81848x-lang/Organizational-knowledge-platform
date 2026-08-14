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
        User employee = ensureUserExists("employee@northwind.io", "Ava Chen", SystemRole.EMPLOYEE, "Engineering", "Senior Product Engineer");
        User softwareEngineer = ensureUserExists("swe@northwind.io", "Liam Harper", SystemRole.EMPLOYEE, "Engineering", "Software Engineer");
        User juniorDeveloper = ensureUserExists("juniordev@northwind.io", "Chloe Adams", SystemRole.EMPLOYEE, "Engineering", "Junior Developer");
        User jordanTaylor = ensureUserExists("jordan.taylor@knowledgeiq.com", "Jordan Taylor", SystemRole.EMPLOYEE, "Engineering", "DevOps & Security Specialist");
        User raviShah = ensureUserExists("ravi.shah@knowledgeiq.com", "Ravi Shah", SystemRole.EMPLOYEE, "Engineering", "Full Stack Engineer I");
        User graceKim = ensureUserExists("grace.kim@knowledgeiq.com", "Grace Kim", SystemRole.EMPLOYEE, "Engineering", "Backend Engineer II");
        User sofiaRuiz = ensureUserExists("sofia.ruiz@knowledgeiq.com", "Sofia Ruiz", SystemRole.EMPLOYEE, "Engineering", "Lead UI/UX Engineer");
        User danielOsei = ensureUserExists("daniel.osei@knowledgeiq.com", "Daniel Osei", SystemRole.EMPLOYEE, "Engineering", "Cloud Infrastructure Engineer");
        User manager = ensureUserExists("manager@northwind.io", "Marcus Lee", SystemRole.MANAGER, "Engineering", "Manager");
        User hr = ensureUserExists("hr@northwind.io", "Priya Nair", SystemRole.HR_SPECIALIST, "HR & Operations", "HR Operations Lead");
        User depthead = ensureUserExists("depthead@northwind.io", "David Vance", SystemRole.DEPARTMENT_HEAD, "Engineering", "Head of Department");
        User ldadmin = ensureUserExists("ldadmin@northwind.io", "Elena Rostova", SystemRole.L_AND_D_ADMIN, "HR & Operations", "L&D Program Lead");
        User admin = ensureUserExists("admin@northwind.io", "Noah Bennett", SystemRole.SYSTEM_ADMIN, "Platform", "Platform Administrator");
        
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
    }

    private User ensureUserExists(String email, String fullName, SystemRole systemRole, String deptName, String roleTitle) {
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

            Department dept = departmentRepository.findByNameAndOrganizationId(deptName, defaultOrg.getId())
                    .orElseGet(() -> {
                        Department d = new Department(deptName, deptName + " Department");
                        d.setOrganization(defaultOrg);
                        return departmentRepository.save(d);
                    });
            user.setDepartment(dept);

            Role role = roleRepository.findByTitle(roleTitle)
                    .orElseGet(() -> roleRepository.save(new Role(roleTitle, dept, roleTitle)));
            user.setRole(role);

            if (systemRole == SystemRole.EMPLOYEE) {
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
