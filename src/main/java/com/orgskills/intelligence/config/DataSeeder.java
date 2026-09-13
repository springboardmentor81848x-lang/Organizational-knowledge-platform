package com.orgskills.intelligence.config;

import com.orgskills.intelligence.entity.Certification;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.GapSnapshot;
import com.orgskills.intelligence.entity.LearningMilestone;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.CertificationStatus;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.CertificationRepository;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.GapSnapshotRepository;
import com.orgskills.intelligence.repository.LearningMilestoneRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final RoleCompetencyRepository roleCompetencyRepository;
    private final PasswordEncoder passwordEncoder;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificationRepository certificationRepository;
    private final GapSnapshotRepository gapSnapshotRepository;
    private final LearningMilestoneRepository learningMilestoneRepository;
    private final CacheManager cacheManager;

    @Override
    @Transactional
    public void run(String... args) {
        // The skill catalogue and the role competency profiles are reference data, not sample
        // data: a release that adds a target role has to reach installations that were seeded
        // before that role existed. Both are therefore topped up on every start, adding only
        // what is missing. Everything below them describes the demo organisation and is still
        // created once, for an empty database only.
        boolean freshDatabase = skillRepository.count() == 0;

        seedSkills();
        seedRoleCompetencies();

        if (!freshDatabase) {
            log.info("Skill catalogue and role competency profiles are up to date; sample data left untouched.");
            return;
        }

        log.info("Seeding database with sample data across six organizational roles...");
        seedUsers();
        seedUserSkills();
        seedCourses();
        seedEnrollmentsAndCertifications();
        seedGapSnapshots();
        log.info("Database seeding completed successfully.");
    }

    /**
     * The skills the platform can measure. Anything a role competency profile or an assessment
     * question refers to has to exist here first.
     */
    private static final List<SkillSeed> SKILL_CATALOGUE = List.of(
            new SkillSeed("Java", "Technical", "Core Java programming including OOP, collections, streams, and concurrency"),
            new SkillSeed("Spring Boot", "Technical", "Spring Boot framework for building production-ready applications"),
            new SkillSeed("React", "Technical", "React.js library for building user interfaces"),
            new SkillSeed("TypeScript", "Technical", "Typed JavaScript for large front-end and Node codebases"),
            new SkillSeed("Python", "Technical", "Python programming for scripting, data analysis, and backend development"),
            new SkillSeed("SQL", "Technical", "Relational database querying and design"),
            new SkillSeed("Testing", "Quality", "Automated testing: unit, integration and end-to-end, and what to test at each level"),
            new SkillSeed("Docker", "DevOps", "Containerization and container orchestration"),
            new SkillSeed("Linux", "DevOps", "Linux administration, the shell, processes, permissions and networking basics"),
            new SkillSeed("AWS", "Cloud", "Amazon Web Services cloud platform services"),
            new SkillSeed("Security", "Security", "Application security: common vulnerabilities, authentication and secret handling"),
            new SkillSeed("Data Analysis", "Data", "Turning data into answers: cleaning, aggregation, statistics and visualisation"),
            new SkillSeed("Machine Learning", "Data", "Supervised and unsupervised learning, model evaluation and deployment"),
            new SkillSeed("Product Management", "Product", "Discovery, prioritisation, roadmaps and measuring whether a product works"),
            new SkillSeed("Communication", "Soft Skills", "Effective verbal and written communication"),
            new SkillSeed("Leadership", "Management", "Team leadership, delegation, and strategic thinking"),
            new SkillSeed("Agile", "Process", "Agile methodologies including Scrum and Kanban")
    );

    private void seedSkills() {
        List<Skill> missing = SKILL_CATALOGUE.stream()
                .filter(seed -> skillRepository.findByNameIgnoreCase(seed.name()).isEmpty())
                .map(seed -> createSkill(seed.name(), seed.category(), seed.description()))
                .toList();

        if (missing.isEmpty()) {
            return;
        }
        skillRepository.saveAll(missing);
        log.info("Added {} skill(s) to the catalogue.", missing.size());
    }

    private record SkillSeed(String name, String category, String description) {
    }

    private void seedUsers() {
        User manager = new User();
        manager.setEmail("manager@orgskills.com");
        manager.setPassword(passwordEncoder.encode("password123"));
        manager.setFullName("Bob Smith");
        manager.setRole(Role.MANAGER);
        manager.setDepartment("Engineering");
        manager.setJobTitle("Engineering Manager");
        manager.setActive(true);
        User savedManager = userRepository.save(manager);

        User employee = new User();
        employee.setEmail("employee@orgskills.com");
        employee.setPassword(passwordEncoder.encode("password123"));
        employee.setFullName("Alice Johnson");
        employee.setRole(Role.EMPLOYEE);
        employee.setDepartment("Engineering");
        employee.setJobTitle("Software Engineer");
        employee.setManager(savedManager);
        employee.setActive(true);
        userRepository.save(employee);

        User deptHead = new User();
        deptHead.setEmail("depthead@orgskills.com");
        deptHead.setPassword(passwordEncoder.encode("password123"));
        deptHead.setFullName("David Miller");
        deptHead.setRole(Role.DEPARTMENT_HEAD);
        deptHead.setDepartment("Engineering");
        deptHead.setJobTitle("VP of Engineering");
        deptHead.setActive(true);
        userRepository.save(deptHead);

        User hrSpecialist = new User();
        hrSpecialist.setEmail("hr@orgskills.com");
        hrSpecialist.setPassword(passwordEncoder.encode("password123"));
        hrSpecialist.setFullName("Emma Watson");
        hrSpecialist.setRole(Role.HR_SPECIALIST);
        hrSpecialist.setDepartment("Human Resources");
        hrSpecialist.setJobTitle("HR Specialist");
        hrSpecialist.setActive(true);
        userRepository.save(hrSpecialist);

        User lndAdmin = new User();
        lndAdmin.setEmail("lnd@orgskills.com");
        lndAdmin.setPassword(passwordEncoder.encode("password123"));
        lndAdmin.setFullName("Frank Lnd");
        lndAdmin.setRole(Role.LND_ADMIN);
        lndAdmin.setDepartment("Learning & Development");
        lndAdmin.setJobTitle("L&D Lead");
        lndAdmin.setActive(true);
        userRepository.save(lndAdmin);

        User sysAdmin = new User();
        sysAdmin.setEmail("admin@orgskills.com");
        sysAdmin.setPassword(passwordEncoder.encode("password123"));
        sysAdmin.setFullName("Carol Admin");
        sysAdmin.setRole(Role.SYSTEM_ADMIN);
        sysAdmin.setDepartment("Information Technology");
        sysAdmin.setJobTitle("System Administrator");
        sysAdmin.setActive(true);
        userRepository.save(sysAdmin);
    }

    /**
     * The target roles an employee can aim at, and what each one is measured on.
     *
     * <p>This table is the origin of three things at once, which is why it is worth reading as
     * one: it is the list offered at sign-up, it decides which skills a person's assessment
     * draws questions from, and it sets the required level each gap is measured against. A role
     * added here is therefore only as useful as the question bank behind its skills — see
     * {@link AssessmentQuestionSeeder}, which authors questions for every skill named below.
     *
     * <p>Levels are the bar for the role, not an average of who currently holds it: an employee
     * at the required level has no gap, which is what makes the gap list actionable.
     */
    private static final List<RoleProfile> ROLE_PROFILES = List.of(
            new RoleProfile("Software Engineer", "Engineering", Map.ofEntries(
                    Map.entry("Java", ProficiencyLevel.ADVANCED),
                    Map.entry("Spring Boot", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("SQL", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Testing", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Docker", ProficiencyLevel.BEGINNER),
                    Map.entry("Communication", ProficiencyLevel.INTERMEDIATE))),

            new RoleProfile("Senior Software Engineer", "Engineering", Map.ofEntries(
                    Map.entry("Java", ProficiencyLevel.EXPERT),
                    Map.entry("Spring Boot", ProficiencyLevel.ADVANCED),
                    Map.entry("SQL", ProficiencyLevel.ADVANCED),
                    Map.entry("Testing", ProficiencyLevel.ADVANCED),
                    Map.entry("Security", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Docker", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Communication", ProficiencyLevel.ADVANCED))),

            new RoleProfile("Frontend Engineer", "Engineering", Map.ofEntries(
                    Map.entry("React", ProficiencyLevel.ADVANCED),
                    Map.entry("TypeScript", ProficiencyLevel.ADVANCED),
                    Map.entry("Testing", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Communication", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Agile", ProficiencyLevel.INTERMEDIATE))),

            new RoleProfile("DevOps Engineer", "Engineering", Map.ofEntries(
                    Map.entry("Docker", ProficiencyLevel.ADVANCED),
                    Map.entry("Linux", ProficiencyLevel.ADVANCED),
                    Map.entry("AWS", ProficiencyLevel.ADVANCED),
                    Map.entry("Security", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Agile", ProficiencyLevel.INTERMEDIATE))),

            new RoleProfile("Cloud Architect", "Engineering", Map.ofEntries(
                    Map.entry("AWS", ProficiencyLevel.EXPERT),
                    Map.entry("Docker", ProficiencyLevel.ADVANCED),
                    Map.entry("Linux", ProficiencyLevel.ADVANCED),
                    Map.entry("Security", ProficiencyLevel.ADVANCED),
                    Map.entry("Communication", ProficiencyLevel.ADVANCED))),

            new RoleProfile("QA Engineer", "Quality Engineering", Map.ofEntries(
                    Map.entry("Testing", ProficiencyLevel.EXPERT),
                    Map.entry("Java", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("SQL", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Agile", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Communication", ProficiencyLevel.INTERMEDIATE))),

            new RoleProfile("Data Analyst", "Data & Analytics", Map.ofEntries(
                    Map.entry("SQL", ProficiencyLevel.ADVANCED),
                    Map.entry("Python", ProficiencyLevel.ADVANCED),
                    Map.entry("Data Analysis", ProficiencyLevel.ADVANCED),
                    Map.entry("Communication", ProficiencyLevel.INTERMEDIATE))),

            new RoleProfile("Machine Learning Engineer", "Data & Analytics", Map.ofEntries(
                    Map.entry("Python", ProficiencyLevel.EXPERT),
                    Map.entry("Machine Learning", ProficiencyLevel.ADVANCED),
                    Map.entry("Data Analysis", ProficiencyLevel.ADVANCED),
                    Map.entry("SQL", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("AWS", ProficiencyLevel.INTERMEDIATE))),

            new RoleProfile("Product Manager", "Product", Map.ofEntries(
                    Map.entry("Product Management", ProficiencyLevel.ADVANCED),
                    Map.entry("Communication", ProficiencyLevel.ADVANCED),
                    Map.entry("Agile", ProficiencyLevel.ADVANCED),
                    Map.entry("Data Analysis", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Leadership", ProficiencyLevel.INTERMEDIATE))),

            new RoleProfile("Engineering Manager", "Engineering", Map.ofEntries(
                    Map.entry("Leadership", ProficiencyLevel.ADVANCED),
                    Map.entry("Communication", ProficiencyLevel.ADVANCED),
                    Map.entry("Agile", ProficiencyLevel.ADVANCED),
                    Map.entry("Product Management", ProficiencyLevel.INTERMEDIATE),
                    Map.entry("Java", ProficiencyLevel.INTERMEDIATE)))
    );

    /**
     * Adds any competency row that is missing, leaving existing ones alone.
     *
     * <p>Editing a level here therefore does not overwrite an installation whose profiles an
     * administrator has since tuned through the catalogue screens — those edits are the more
     * authoritative of the two, and silently reverting them on restart would be worse than
     * leaving this table aspirational.
     */
    private void seedRoleCompetencies() {
        int added = 0;

        for (RoleProfile profile : ROLE_PROFILES) {
            for (Map.Entry<String, ProficiencyLevel> requirement : profile.competencies().entrySet()) {
                Skill skill = skillRepository.findByNameIgnoreCase(requirement.getKey()).orElse(null);
                if (skill == null) {
                    log.warn("Skill '{}' is not in the catalogue; '{}' will not be measured on it.",
                            requirement.getKey(), profile.jobTitle());
                    continue;
                }
                if (roleCompetencyRepository.existsByJobTitleIgnoreCaseAndDepartmentIgnoreCaseAndSkillId(
                        profile.jobTitle(), profile.department(), skill.getId())) {
                    continue;
                }

                RoleCompetency competency = new RoleCompetency();
                competency.setJobTitle(profile.jobTitle());
                competency.setDepartment(profile.department());
                competency.setSkill(skill);
                competency.setRequiredProficiencyLevel(requirement.getValue());
                roleCompetencyRepository.save(competency);
                added++;
            }
        }

        if (added == 0) {
            return;
        }

        log.info("Added {} role competency requirement(s) across {} target roles.",
                added, ROLE_PROFILES.size());

        // RoleCompetencyService caches the target-role list and evicts it on its own writes.
        // These rows are written straight through the repository, so nothing evicted it here —
        // and a newly added role would stay invisible on the sign-up form until the cache aged
        // out, which for the catalogue is an hour.
        Cache catalogue = cacheManager.getCache(CacheNames.CATALOG_COMPETENCIES);
        if (catalogue != null) {
            catalogue.clear();
        }
    }

    private record RoleProfile(String jobTitle, String department,
                               Map<String, ProficiencyLevel> competencies) {
    }

    private void seedUserSkills() {
        User alice = userRepository.findByEmail("employee@orgskills.com").orElseThrow();
        // Alice is a Software Engineer aiming at Engineering Manager, which is what her
        // assessment is set against and what her dashboard shows as her target.
        alice.setTargetJobTitle("Engineering Manager");
        alice.setTargetDepartment("Engineering");
        userRepository.save(alice);
        assignSkill(alice, "Java", ProficiencyLevel.INTERMEDIATE);
        assignSkill(alice, "Spring Boot", ProficiencyLevel.BEGINNER);
        assignSkill(alice, "SQL", ProficiencyLevel.INTERMEDIATE);
        assignSkill(alice, "Communication", ProficiencyLevel.BEGINNER);

        User bob = userRepository.findByEmail("manager@orgskills.com").orElseThrow();
        assignSkill(bob, "Java", ProficiencyLevel.EXPERT);
        assignSkill(bob, "Leadership", ProficiencyLevel.INTERMEDIATE);
        assignSkill(bob, "Communication", ProficiencyLevel.INTERMEDIATE);
        assignSkill(bob, "Agile", ProficiencyLevel.BEGINNER);
    }

    private void seedCourses() {
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElse(null);
        Skill springSkill = skillRepository.findByNameIgnoreCase("Spring Boot").orElse(null);

        Course c1 = new Course();
        c1.setTitle("Mastering Spring Boot 3 & Microservices");
        c1.setDescription("In-depth Spring Boot course covering Security, JPA, and REST");
        c1.setProvider("Internal Academy");
        c1.setSkillCovered(springSkill);
        c1.setDifficulty("INTERMEDIATE");
        c1.setDurationHours(24.0);
        c1.setIsInternal(true);
        courseRepository.save(c1);

        Course c2 = new Course();
        c2.setTitle("Advanced Java Concurrency & JVM Tuning");
        c2.setDescription("Deep dive into Java memory model and multithreading");
        c2.setProvider("Coursera");
        c2.setSkillCovered(javaSkill);
        c2.setDifficulty("ADVANCED");
        c2.setDurationHours(18.0);
        c2.setIsInternal(false);
        c2.setExternalUrl("https://coursera.org/learn/java-concurrency");
        courseRepository.save(c2);

        // Course-level milestone templates. Enrolling copies these into learner-owned rows, so a
        // course reads as "Core Java: Completed, Multithreading: In Progress" rather than one number.
        seedMilestoneTemplate(c1, "Spring Core & Dependency Injection", "Spring Data JPA", "Spring Security", "Microservices & Resilience");
        seedMilestoneTemplate(c2, "Core Java", "Multithreading", "JVM Memory Model", "GC Tuning");
    }

    private void seedMilestoneTemplate(Course training, String... titles) {
        for (int i = 0; i < titles.length; i++) {
            LearningMilestone milestone = new LearningMilestone();
            milestone.setTraining(training);
            milestone.setEnrollment(null);
            milestone.setTitle(titles[i]);
            milestone.setSequence(i + 1);
            milestone.setCompletionPercentage(0.0);
            learningMilestoneRepository.save(milestone);
        }
    }

    private void seedEnrollmentsAndCertifications() {
        User alice = userRepository.findByEmail("employee@orgskills.com").orElseThrow();
        List<Course> courses = courseRepository.findAll();
        if (!courses.isEmpty()) {
            Enrollment enrollment = new Enrollment();
            enrollment.setEmployee(alice);
            enrollment.setCourse(courses.get(0));
            enrollment.setStatus(EnrollmentStatus.IN_PROGRESS);
            enrollment.setProgress(45.0);
            Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
            copyMilestoneTemplate(savedEnrollment, 100.0, 40.0);
        }

        Certification cert = new Certification();
        cert.setEmployee(alice);
        cert.setName("AWS Certified Developer - Associate");
        cert.setIssuer("Amazon Web Services");
        cert.setIssuedAt(java.time.LocalDate.now().minusYears(1));
        cert.setExpiresAt(java.time.LocalDate.now().plusDays(25)); // Expiring soon!
        cert.setStatus(CertificationStatus.EXPIRING_SOON);
        certificationRepository.save(cert);
    }

    /** Gives the seeded enrolment a per-topic breakdown, so the demo data shows mixed milestones. */
    private void copyMilestoneTemplate(Enrollment enrollment, double... completionByIndex) {
        List<LearningMilestone> template = learningMilestoneRepository
                .findByTrainingIdAndEnrollmentIsNullOrderBySequenceAsc(enrollment.getCourse().getId());
        for (int i = 0; i < template.size(); i++) {
            LearningMilestone source = template.get(i);
            LearningMilestone copy = new LearningMilestone();
            copy.setTraining(source.getTraining());
            copy.setEnrollment(enrollment);
            copy.setTitle(source.getTitle());
            copy.setSequence(source.getSequence());
            copy.setCompletionPercentage(i < completionByIndex.length ? completionByIndex[i] : 0.0);
            learningMilestoneRepository.save(copy);
        }
    }

    private void seedGapSnapshots() {
        com.orgskills.intelligence.entity.GapSnapshot s1 = new com.orgskills.intelligence.entity.GapSnapshot();
        s1.setSnapshotDate(java.time.LocalDate.now().minusWeeks(4));
        s1.setDepartment("Engineering");
        s1.setTotalGaps(12);
        s1.setCriticalGapsCount(4);
        s1.setHighGapsCount(5);
        s1.setMediumGapsCount(2);
        s1.setLowGapsCount(1);
        s1.setAvgGapScore(2.4);
        gapSnapshotRepository.save(s1);

        com.orgskills.intelligence.entity.GapSnapshot s2 = new com.orgskills.intelligence.entity.GapSnapshot();
        s2.setSnapshotDate(java.time.LocalDate.now().minusWeeks(2));
        s2.setDepartment("Engineering");
        s2.setTotalGaps(8);
        s2.setCriticalGapsCount(2);
        s2.setHighGapsCount(3);
        s2.setMediumGapsCount(2);
        s2.setLowGapsCount(1);
        s2.setAvgGapScore(1.8);
        gapSnapshotRepository.save(s2);
    }

    /** The rating mirrors the level's canonical score, so seed data cannot contradict the scale. */
    private void assignSkill(User user, String skillName, ProficiencyLevel level) {
        skillRepository.findByNameIgnoreCase(skillName).ifPresent(skill -> {
            UserSkill us = new UserSkill();
            us.setUser(user);
            us.setSkill(skill);
            us.setProficiencyLevel(level);
            us.setRatingScore((double) level.getScore());
            userSkillRepository.save(us);
        });
    }

    private Skill createSkill(String name, String category, String description) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCategory(category);
        skill.setDescription(description);
        return skill;
    }
}
