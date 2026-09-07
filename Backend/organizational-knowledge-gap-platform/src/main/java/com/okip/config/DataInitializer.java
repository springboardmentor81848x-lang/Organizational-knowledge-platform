package com.okip.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.okip.entity.master.*;
import com.okip.entity.transaction.*;
import com.okip.enums.*;
import com.okip.repository.*;
import com.okip.service.gap.GapAnalysisService;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;
    private final JobRoleRepository jobRoleRepository;
    private final JobRoleCompetencyRepository competencyRepository;
    private final EmployeeJobRoleRepository employeeJobRoleRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingSkillRepository trainingSkillRepository;
    private final TrainingEnrollmentRepository trainingEnrollmentRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final KnowledgeSessionRepository knowledgeSessionRepository;
    private final SessionRegistrationRepository sessionRegistrationRepository;
    private final KnowledgeResourceRepository knowledgeResourceRepository;
    private final SkillAssessmentRepository skillAssessmentRepository;
    private final NotificationRepository notificationRepository;
    private final GapAnalysisService gapAnalysisService;

    public DataInitializer(
            RoleRepository roleRepository,
            DepartmentRepository departmentRepository,
            EmployeeRepository employeeRepository,
            SkillRepository skillRepository,
            JobRoleRepository jobRoleRepository,
            JobRoleCompetencyRepository competencyRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            EmployeeSkillRepository employeeSkillRepository,
            EmployeeProfileRepository employeeProfileRepository,
            TrainingRepository trainingRepository,
            TrainingSkillRepository trainingSkillRepository,
            TrainingEnrollmentRepository trainingEnrollmentRepository,
            MentorshipRequestRepository mentorshipRequestRepository,
            KnowledgeSessionRepository knowledgeSessionRepository,
            SessionRegistrationRepository sessionRegistrationRepository,
            KnowledgeResourceRepository knowledgeResourceRepository,
            SkillAssessmentRepository skillAssessmentRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder,
            GapAnalysisService gapAnalysisService) {

        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.competencyRepository = competencyRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.trainingRepository = trainingRepository;
        this.trainingSkillRepository = trainingSkillRepository;
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.knowledgeSessionRepository = knowledgeSessionRepository;
        this.sessionRegistrationRepository = sessionRegistrationRepository;
        this.knowledgeResourceRepository = knowledgeResourceRepository;
        this.skillAssessmentRepository = skillAssessmentRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.gapAnalysisService = gapAnalysisService;
    }

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeDepartments();
        initializeSkills();
        initializeJobRoles();
        initializeJobRoleCompetencies();
        initializeDefaultUsers();
        initializeTrainings();
        initializeTrainingSkills();
        initializeMilestone3Data();
    }

    private void initializeRoles() {
        for (RoleType roleType : RoleType.values()) {
            if (roleRepository.findByRoleName(roleType).isEmpty()) {
                Role role = new Role();
                role.setRoleName(roleType);
                role.setDescription(roleType.name() + " Role");
                roleRepository.save(role);
            }
        }
    }

    private void initializeDepartments() {
        List<String> departments = Arrays.asList("IT", "HR", "Finance", "Sales");
        for (String departmentName : departments) {
            if (departmentRepository.findByDepartmentName(departmentName).isEmpty()) {
                Department department = new Department();
                department.setDepartmentName(departmentName);
                department.setDescription(departmentName + " Department");
                departmentRepository.save(department);
            }
        }
    }

    private void initializeSkills() {
        createSkill("Java", SkillCategory.PROGRAMMING_LANGUAGE);
        createSkill("Spring Boot", SkillCategory.FRAMEWORK);
        createSkill("Spring Security", SkillCategory.FRAMEWORK);
        createSkill("REST API", SkillCategory.FRAMEWORK);
        createSkill("Microservices", SkillCategory.FRAMEWORK);
        createSkill("MySQL", SkillCategory.DATABASE);
        createSkill("PostgreSQL", SkillCategory.DATABASE);
        createSkill("Git", SkillCategory.TOOL);
        createSkill("Maven", SkillCategory.TOOL);
        createSkill("Docker", SkillCategory.DEVOPS);
        createSkill("Kubernetes", SkillCategory.DEVOPS);
        createSkill("AWS", SkillCategory.CLOUD);
    }

    private void createSkill(String skillName, SkillCategory skillCategory) {
        if (skillRepository.findBySkillNameIgnoreCase(skillName).isPresent()) {
            return;
        }
        Skill skill = new Skill();
        skill.setSkillName(skillName);
        skill.setSkillCategory(skillCategory);
        skill.setDescription(skillName + " Skill");
        skillRepository.save(skill);
    }

    private void initializeJobRoles() {
        createJobRole("Java Developer", "Backend Java Development");
        createJobRole("Backend Developer", "Backend Service Development");
        createJobRole("Full Stack Developer", "Frontend and Backend Development");
        createJobRole("Frontend Developer", "Frontend UI Development");
        createJobRole("DevOps Engineer", "DevOps and CI/CD");
        createJobRole("Data Engineer", "Data Engineering");
        createJobRole("QA Engineer", "Software Testing");
        createJobRole("Engineering Manager", "Engineering Team Management");
        createJobRole("HR Executive", "Human Resource Operations");
        createJobRole("Project Manager", "Project Planning and Delivery");
    }

    private void createJobRole(String jobRoleName, String description) {
        if (jobRoleRepository.findByJobRoleNameIgnoreCase(jobRoleName).isPresent()) {
            return;
        }
        JobRole jobRole = new JobRole();
        jobRole.setJobRoleName(jobRoleName);
        jobRole.setDescription(description);
        jobRoleRepository.save(jobRole);
    }

    private void initializeJobRoleCompetencies() {
        JobRole javaDev = jobRoleRepository.findByJobRoleNameIgnoreCase("Java Developer").orElse(null);
        if (javaDev != null) {
            addCompetency(javaDev, "Java", ProficiencyLevel.ADVANCED, 2.0);
            addCompetency(javaDev, "Spring Boot", ProficiencyLevel.ADVANCED, 2.0);
            addCompetency(javaDev, "MySQL", ProficiencyLevel.INTERMEDIATE, 1.0);
            addCompetency(javaDev, "Git", ProficiencyLevel.INTERMEDIATE, 1.0);
            addCompetency(javaDev, "REST API", ProficiencyLevel.ADVANCED, 2.0);
        }

        JobRole fullStack = jobRoleRepository.findByJobRoleNameIgnoreCase("Full Stack Developer").orElse(null);
        if (fullStack != null) {
            addCompetency(fullStack, "Java", ProficiencyLevel.ADVANCED, 2.0);
            addCompetency(fullStack, "PostgreSQL", ProficiencyLevel.ADVANCED, 2.0);
            addCompetency(fullStack, "Docker", ProficiencyLevel.INTERMEDIATE, 1.0);
            addCompetency(fullStack, "Git", ProficiencyLevel.ADVANCED, 2.0);
        }

        JobRole devops = jobRoleRepository.findByJobRoleNameIgnoreCase("DevOps Engineer").orElse(null);
        if (devops != null) {
            addCompetency(devops, "Docker", ProficiencyLevel.EXPERT, 3.0);
            addCompetency(devops, "Kubernetes", ProficiencyLevel.EXPERT, 3.0);
            addCompetency(devops, "AWS", ProficiencyLevel.ADVANCED, 2.0);
            addCompetency(devops, "Git", ProficiencyLevel.EXPERT, 3.0);
        }
    }

    private void addCompetency(JobRole role, String skillName, ProficiencyLevel level, Double minExp) {
        Skill skill = skillRepository.findBySkillNameIgnoreCase(skillName).orElse(null);
        if (skill == null || role == null) return;

        if (competencyRepository.findByJobRoleAndSkill(role, skill).isEmpty()) {
            JobRoleCompetency comp = new JobRoleCompetency();
            comp.setJobRole(role);
            comp.setSkill(skill);
            comp.setRequiredProficiency(level);
            comp.setMinimumExperience(minExp);
            comp.setMandatory(true);
            competencyRepository.save(comp);
        }
    }

    private void initializeDefaultUsers() {
        createUser("ADMIN001", "System", "Admin", "admin@okip.com", "Password@123", RoleType.ROLE_ADMIN, "IT");
        createUser("HR001", "Default", "HR", "hr@okip.com", "Password@123", RoleType.ROLE_HR, "HR");
        createUser("MGR001", "Default", "Manager", "manager@okip.com", "Password@123", RoleType.ROLE_MANAGER, "IT");

        // Sample employees
        createUser("EMP001", "John", "Doe", "john.doe@okip.com", "Password@123", RoleType.ROLE_EMPLOYEE, "IT");
        createUser("EMP002", "Jane", "Smith", "jane.smith@okip.com", "Password@123", RoleType.ROLE_EMPLOYEE, "IT");
        createUser("EMP003", "Alex", "Chen", "alex.chen@okip.com", "Password@123", RoleType.ROLE_EMPLOYEE, "IT");
        createUser("EMP004", "Sarah", "Connor", "sarah.connor@okip.com", "Password@123", RoleType.ROLE_EMPLOYEE, "Finance");
    }

    private Employee createUser(String employeeCode, String firstName, String lastName, String email, String password,
            RoleType roleType, String departmentName) {

        Employee existing = employeeRepository.findByOfficialEmail(email).orElse(null);
        if (existing != null) {
            return existing;
        }

        Role role = roleRepository.findByRoleName(roleType).orElseThrow();
        Department department = departmentRepository.findByDepartmentName(departmentName).orElseThrow();

        Employee employee = new Employee();
        employee.setEmployeeCode(employeeCode);
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setOfficialEmail(email);
        employee.setPassword(passwordEncoder.encode(password));
        employee.setRole(role);
        employee.setDepartment(department);
        employee.setStatus(AccountStatus.APPROVED);

        return employeeRepository.save(employee);
    }

    private void initializeTrainings() {
        createTraining("Java Fundamentals", "Oracle", "6 Weeks", "BEGINNER",
                "Core Java programming, OOP, collections, exception handling and Java fundamentals.", "https://dev.java/learn/");

        createTraining("Advanced Java Programming", "Oracle", "8 Weeks", "ADVANCED",
                "Advanced Java concepts including streams, concurrency, generics and modern Java features.", "https://dev.java/learn/");

        createTraining("Spring Boot Fundamentals", "Spring", "6 Weeks", "BEGINNER",
                "Spring Boot fundamentals, dependency injection, REST APIs and application configuration.", "https://spring.io/guides/gs/spring-boot");

        createTraining("Spring Boot Advanced Development", "Spring", "8 Weeks", "ADVANCED",
                "Advanced Spring Boot development including Spring Data JPA, security and microservices.", "https://spring.io/guides");

        createTraining("MySQL Fundamentals", "MySQL", "4 Weeks", "BEGINNER",
                "SQL fundamentals, CRUD operations, joins, aggregation and relational database concepts.", "https://dev.mysql.com/doc/mysql-getting-started/en/");

        createTraining("Advanced MySQL and SQL", "MySQL", "6 Weeks", "INTERMEDIATE",
                "Advanced SQL queries, joins, subqueries, indexing and database optimization.", "https://dev.mysql.com/doc/refman/9.7/en/tutorial.html");

        createTraining("Docker Containerization Masterclass", "Docker Inc", "4 Weeks", "INTERMEDIATE",
                "Container basics, Dockerfile optimization, multi-stage builds, networking, and volumes.", "https://docs.docker.com/get-started/");

        createTraining("Kubernetes for Enterprise Systems", "CNCF", "8 Weeks", "ADVANCED",
                "Deploying, scaling, and managing containerized applications on Kubernetes clusters.", "https://kubernetes.io/docs/tutorials/");
    }

    private void createTraining(String trainingName, String provider, String duration, String level, String description, String courseUrl) {
        Training training = trainingRepository.findByTrainingNameIgnoreCase(trainingName).orElseGet(Training::new);
        training.setTrainingName(trainingName);
        training.setProvider(provider);
        training.setDuration(duration);
        training.setLevel(level);
        training.setDescription(description);
        training.setCourseUrl(courseUrl);
        trainingRepository.save(training);
    }

    private void initializeTrainingSkills() {
        mapTrainingToSkill("Java Fundamentals", "Java");
        mapTrainingToSkill("Advanced Java Programming", "Java");
        mapTrainingToSkill("Spring Boot Fundamentals", "Spring Boot");
        mapTrainingToSkill("Spring Boot Advanced Development", "Spring Boot");
        mapTrainingToSkill("MySQL Fundamentals", "MySQL");
        mapTrainingToSkill("Advanced MySQL and SQL", "MySQL");
        mapTrainingToSkill("Docker Containerization Masterclass", "Docker");
        mapTrainingToSkill("Kubernetes for Enterprise Systems", "Kubernetes");
    }

    private void mapTrainingToSkill(String trainingName, String skillName) {
        Training training = trainingRepository.findByTrainingNameIgnoreCase(trainingName).orElse(null);
        Skill skill = skillRepository.findBySkillNameIgnoreCase(skillName).orElse(null);
        if (training == null || skill == null) return;

        if (!trainingSkillRepository.existsByTrainingAndSkill(training, skill)) {
            TrainingSkill trainingSkill = new TrainingSkill();
            trainingSkill.setTraining(training);
            trainingSkill.setSkill(skill);
            trainingSkillRepository.save(trainingSkill);
        }
    }

    private void initializeMilestone3Data() {
        Employee john = employeeRepository.findByOfficialEmail("john.doe@okip.com").orElse(null);
        Employee jane = employeeRepository.findByOfficialEmail("jane.smith@okip.com").orElse(null);
        Employee alex = employeeRepository.findByOfficialEmail("alex.chen@okip.com").orElse(null);
        Employee mgr = employeeRepository.findByOfficialEmail("manager@okip.com").orElse(null);

        if (john == null || jane == null || alex == null) return;

        // Assign Job Roles
        assignRole(john, "Java Developer");
        assignRole(jane, "Full Stack Developer");
        assignRole(alex, "DevOps Engineer");
        if (mgr != null) assignRole(mgr, "Engineering Manager");

        // Assign Profile bios
        setBio(john, "Associate Software Engineer passionate about backend development, Java, and scalable APIs.");
        setBio(jane, "Senior Full Stack Engineer & Mentor with 5+ years experience in Java, Spring, PostgreSQL, and Docker.");
        setBio(alex, "Lead DevOps & Cloud Architect with extensive experience in Kubernetes, Docker, and CI/CD.");

        // Assign Employee Skills
        setSkill(john, "Java", ProficiencyLevel.INTERMEDIATE, 1.5);
        setSkill(john, "Spring Boot", ProficiencyLevel.BEGINNER, 0.5);
        setSkill(john, "MySQL", ProficiencyLevel.INTERMEDIATE, 1.0);

        setSkill(jane, "Java", ProficiencyLevel.ADVANCED, 4.5);
        setSkill(jane, "Spring Boot", ProficiencyLevel.ADVANCED, 4.0);
        setSkill(jane, "PostgreSQL", ProficiencyLevel.EXPERT, 5.0);
        setSkill(jane, "Docker", ProficiencyLevel.ADVANCED, 3.5);
        setSkill(jane, "Git", ProficiencyLevel.ADVANCED, 4.0);

        setSkill(alex, "Docker", ProficiencyLevel.EXPERT, 5.0);
        setSkill(alex, "Kubernetes", ProficiencyLevel.EXPERT, 4.5);
        setSkill(alex, "AWS", ProficiencyLevel.ADVANCED, 3.5);
        setSkill(alex, "Git", ProficiencyLevel.EXPERT, 5.0);

        // Run gap analysis for employees
        try {
            gapAnalysisService.runGapAnalysis(john.getEmployeeId());
            gapAnalysisService.runGapAnalysis(jane.getEmployeeId());
            gapAnalysisService.runGapAnalysis(alex.getEmployeeId());
        } catch (Exception e) {
            // Ignore if gap analysis already ran
        }

        // Training Enrollments for John
        enrollTraining(john, "Java Fundamentals", 100, TrainingStatus.COMPLETED);
        enrollTraining(john, "Spring Boot Fundamentals", 65, TrainingStatus.IN_PROGRESS);
        enrollTraining(john, "Advanced MySQL and SQL", 0, TrainingStatus.NOT_STARTED);
        enrollTraining(jane, "Spring Boot Advanced Development", 100, TrainingStatus.COMPLETED);

        // Mentorship Requests
        Skill springSkill = skillRepository.findBySkillNameIgnoreCase("Spring Boot").orElse(null);
        Skill k8sSkill = skillRepository.findBySkillNameIgnoreCase("Kubernetes").orElse(null);

        if (mentorshipRequestRepository.findByMenteeOrderByCreatedAtDesc(john).isEmpty()) {
            MentorshipRequest req1 = new MentorshipRequest();
            req1.setMentee(john);
            req1.setMentor(jane);
            req1.setSkill(springSkill);
            req1.setTopic("Advanced Spring Boot & Microservices");
            req1.setMessage("Hi Jane, I would love your guidance on architecting resilient microservices using Spring Boot.");
            req1.setStatus(MentorshipStatus.ACCEPTED);
            req1.setRequestedAt(LocalDateTime.now().minusDays(5));
            req1.setRespondedAt(LocalDateTime.now().minusDays(4));
            req1.setNotes("Weekly sync every Tuesday 4 PM.");
            mentorshipRequestRepository.save(req1);

            MentorshipRequest req2 = new MentorshipRequest();
            req2.setMentee(john);
            req2.setMentor(alex);
            req2.setSkill(k8sSkill);
            req2.setTopic("Kubernetes Deployment Pipelines");
            req2.setMessage("Hi Alex, looking to learn Kubernetes pod architecture and Helm deployments.");
            req2.setStatus(MentorshipStatus.PENDING);
            req2.setRequestedAt(LocalDateTime.now().minusDays(1));
            mentorshipRequestRepository.save(req2);
        }

        // Knowledge Sessions
        if (knowledgeSessionRepository.findAll().isEmpty()) {
            KnowledgeSession s1 = new KnowledgeSession();
            s1.setTitle("Mastering Cloud-Native Microservices with Spring Boot & Docker");
            s1.setDescription("Deep dive into service discovery, API gateways, centralized configuration, and Docker containerization.");
            s1.setSpeaker(jane);
            s1.setSkill(springSkill);
            s1.setSessionDate(LocalDateTime.now().plusDays(4).withHour(15).withMinute(0));
            s1.setDurationMinutes(60);
            s1.setMeetingLink("https://meet.google.com/okip-spring-microservices");
            s1.setLocation("Virtual (Google Meet)");
            s1.setMaxParticipants(50);
            s1.setStatus(SessionStatus.UPCOMING);
            KnowledgeSession savedS1 = knowledgeSessionRepository.save(s1);

            // Register John for this session
            SessionRegistration reg1 = new SessionRegistration();
            reg1.setSession(savedS1);
            reg1.setEmployee(john);
            reg1.setAttendanceStatus(AttendanceStatus.REGISTERED);
            reg1.setRegisteredAt(LocalDateTime.now().minusDays(2));
            sessionRegistrationRepository.save(reg1);

            KnowledgeSession s2 = new KnowledgeSession();
            s2.setTitle("Kubernetes in Production: Zero-Downtime CI/CD Deployments");
            s2.setDescription("Practical guide to rolling updates, ingress routing, stateful sets, and production cluster security.");
            s2.setSpeaker(alex);
            s2.setSkill(k8sSkill);
            s2.setSessionDate(LocalDateTime.now().plusDays(10).withHour(16).withMinute(0));
            s2.setDurationMinutes(75);
            s2.setMeetingLink("https://meet.google.com/okip-k8s-prod");
            s2.setLocation("Virtual (Google Meet)");
            s2.setMaxParticipants(40);
            s2.setStatus(SessionStatus.UPCOMING);
            knowledgeSessionRepository.save(s2);

            KnowledgeSession s3 = new KnowledgeSession();
            s3.setTitle("SQL Query Optimization & Database Indexing Strategies");
            s3.setDescription("Hands-on session covering execution plans, composite indexing, and avoiding common N+1 query bottlenecks.");
            s3.setSpeaker(jane);
            s3.setSkill(skillRepository.findBySkillNameIgnoreCase("MySQL").orElse(null));
            s3.setSessionDate(LocalDateTime.now().minusDays(7).withHour(14).withMinute(0));
            s3.setDurationMinutes(60);
            s3.setMeetingLink("https://meet.google.com/okip-sql-opt");
            s3.setLocation("Virtual (Google Meet)");
            s3.setMaxParticipants(30);
            s3.setStatus(SessionStatus.COMPLETED);
            KnowledgeSession savedS3 = knowledgeSessionRepository.save(s3);

            SessionRegistration pastReg = new SessionRegistration();
            pastReg.setSession(savedS3);
            pastReg.setEmployee(john);
            pastReg.setAttendanceStatus(AttendanceStatus.ATTENDED);
            pastReg.setRating(5);
            pastReg.setFeedback("Super practical and insightful! The indexing breakdown helped our project queries significantly.");
            pastReg.setRegisteredAt(LocalDateTime.now().minusDays(10));
            sessionRegistrationRepository.save(pastReg);
        }

        // Knowledge Resources
        if (knowledgeResourceRepository.findAll().isEmpty()) {
            KnowledgeResource r1 = new KnowledgeResource();
            r1.setTitle("Best Practices for RESTful API Design & Versioning in Spring Boot");
            r1.setDescription("Comprehensive guide on URI structures, HTTP status codes, exception handling with ControllerAdvice, and OpenAPI documentation.");
            r1.setUrl("https://spring.io/guides/tutorials/rest/");
            r1.setContent("When designing REST APIs in Spring Boot, follow RESTful conventions, leverage @RestControllerAdvice for global error handling, and maintain OpenAPI 3 schemas for contract consistency.");
            r1.setResourceType(ResourceType.ARTICLE);
            r1.setSkill(springSkill);
            r1.setAuthor(jane);
            knowledgeResourceRepository.save(r1);

            KnowledgeResource r2 = new KnowledgeResource();
            r2.setTitle("Hands-on Docker Containerization Tutorial for Java Services");
            r2.setDescription("Step-by-step tutorial on writing multi-stage Dockerfiles, minimizing image size with distroless bases, and configuring health checks.");
            r2.setUrl("https://docs.docker.com/language/java/");
            r2.setContent("Multi-stage builds allow compiling Maven/Gradle dependencies inside a build container and copying only the lightweight jar into an alpine or distroless runtime container.");
            r2.setResourceType(ResourceType.TUTORIAL);
            r2.setSkill(skillRepository.findBySkillNameIgnoreCase("Docker").orElse(null));
            r2.setAuthor(alex);
            knowledgeResourceRepository.save(r2);

            KnowledgeResource r3 = new KnowledgeResource();
            r3.setTitle("PostgreSQL Performance Tuning & Indexing Architecture");
            r3.setDescription("Whitepaper on B-Tree indexes, BRIN indexes for time-series data, vacuum tuning, and connection pooling with HikariCP.");
            r3.setUrl("https://www.postgresql.org/docs/current/performance-tips.html");
            r3.setContent("Optimizing PostgreSQL involves understanding query plans via EXPLAIN ANALYZE, configuring shared buffers, work_mem, and maintaining clean indexing hygiene.");
            r3.setResourceType(ResourceType.DOCUMENT);
            r3.setSkill(skillRepository.findBySkillNameIgnoreCase("PostgreSQL").orElse(null));
            r3.setAuthor(jane);
            knowledgeResourceRepository.save(r3);
        }

        // Skill Assessments
        if (skillAssessmentRepository.findAll().isEmpty()) {
            Skill javaSkill = skillRepository.findBySkillNameIgnoreCase("Java").orElse(null);

            if (javaSkill != null) {
                SkillAssessment a1 = new SkillAssessment();
                a1.setEmployee(john);
                a1.setEvaluator(john);
                a1.setSkill(javaSkill);
                a1.setAssessmentType(AssessmentType.SELF);
                a1.setAssessedProficiency(ProficiencyLevel.ADVANCED);
                a1.setScore(85);
                a1.setComments("Completed Java Fundamentals training and built multi-threaded data processors. Ready for Advanced verification.");
                a1.setStatus(AssessmentStatus.PENDING_REVIEW);
                skillAssessmentRepository.save(a1);
            }

            if (springSkill != null && mgr != null) {
                SkillAssessment a2 = new SkillAssessment();
                a2.setEmployee(john);
                a2.setEvaluator(mgr);
                a2.setSkill(springSkill);
                a2.setAssessmentType(AssessmentType.MANAGER);
                a2.setAssessedProficiency(ProficiencyLevel.INTERMEDIATE);
                a2.setScore(80);
                a2.setComments("John demonstrated solid progress in building Spring REST controllers and JPA integrations.");
                a2.setStatus(AssessmentStatus.APPROVED);
                a2.setReviewer(mgr);
                a2.setReviewedAt(LocalDateTime.now().minusDays(3));
                a2.setReviewerComments("Approved. Recommended next step: Spring Security & Microservices.");
                skillAssessmentRepository.save(a2);
            }
        }

        // Notifications
        if (notificationRepository.findAll().isEmpty()) {
            addNotification(john, "Mentorship Request Accepted! 🤝", "Jane Smith accepted your mentorship request for Advanced Spring Boot & Microservices.", NotificationType.MENTORSHIP, 1L);
            addNotification(john, "Knowledge Session Reminder 📅", "Upcoming session: 'Mastering Cloud-Native Microservices' on " + LocalDateTime.now().plusDays(4).toLocalDate(), NotificationType.SESSION, 1L);
            addNotification(john, "Training Milestone Achieved! 🏆", "You completed 100% of 'Java Fundamentals'. Great work!", NotificationType.TRAINING, 1L);
            addNotification(john, "Assessment Status", "Manager review for 'Spring Boot' approved at INTERMEDIATE level.", NotificationType.ASSESSMENT, 2L);

            addNotification(jane, "New Mentee Connection", "You have an active mentorship with John Doe.", NotificationType.MENTORSHIP, 1L);
            if (mgr != null) {
                addNotification(mgr, "Pending Skill Assessment", "John Doe submitted a self-assessment for Java (ADVANCED) awaiting review.", NotificationType.ASSESSMENT, 1L);
            }
        }
    }

    private void assignRole(Employee emp, String roleName) {
        JobRole role = jobRoleRepository.findByJobRoleNameIgnoreCase(roleName).orElse(null);
        if (role == null) return;

        if (employeeJobRoleRepository.findByEmployeeAndActiveTrue(emp).isEmpty()) {
            EmployeeJobRole ejr = new EmployeeJobRole();
            ejr.setEmployee(emp);
            ejr.setJobRole(role);
            ejr.setActive(true);
            ejr.setAssignedDate(LocalDate.now());
            ejr.setAssignedBy(emp);
            ejr.setAssignmentType(AssignmentType.PRIMARY);
            employeeJobRoleRepository.save(ejr);
        }
    }

    private void setBio(Employee emp, String bio) {
        EmployeeProfile profile = employeeProfileRepository.findByEmployee(emp).orElseGet(() -> {
            EmployeeProfile p = new EmployeeProfile();
            p.setEmployee(emp);
            return p;
        });
        profile.setBio(bio);
        employeeProfileRepository.save(profile);
    }

    private void setSkill(Employee emp, String skillName, ProficiencyLevel level, Double years) {
        Skill skill = skillRepository.findBySkillNameIgnoreCase(skillName).orElse(null);
        if (skill == null) return;

        EmployeeSkill es = employeeSkillRepository.findByEmployeeAndSkill(emp, skill).orElseGet(() -> {
            EmployeeSkill s = new EmployeeSkill();
            s.setEmployee(emp);
            s.setSkill(skill);
            return s;
        });
        es.setProficiencyLevel(level);
        es.setYearsOfExperience(years);
        employeeSkillRepository.save(es);
    }

    private void enrollTraining(Employee emp, String trainingName, int progress, TrainingStatus status) {
        Training training = trainingRepository.findByTrainingNameIgnoreCase(trainingName).orElse(null);
        if (training == null) return;

        if (!trainingEnrollmentRepository.existsByEmployeeAndTraining(emp, training)) {
            TrainingEnrollment te = new TrainingEnrollment();
            te.setEmployee(emp);
            te.setTraining(training);
            te.setProgress(progress);
            te.setStatus(status);
            te.setEnrollmentDate(LocalDate.now().minusDays(14));
            if (progress > 0) te.setStartDate(LocalDate.now().minusDays(12));
            if (status == TrainingStatus.COMPLETED) te.setCompletionDate(LocalDate.now().minusDays(2));
            trainingEnrollmentRepository.save(te);
        }
    }

    private void addNotification(Employee recipient, String title, String msg, NotificationType type, Long refId) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setTitle(title);
        n.setMessage(msg);
        n.setType(type);
        n.setReferenceId(refId);
        n.setRead(false);
        notificationRepository.save(n);
    }
}
