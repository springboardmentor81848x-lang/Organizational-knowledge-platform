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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Component
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

    @Override
    @Transactional
    public void run(String... args) {
        if (skillRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }
        log.info("Seeding database with sample data across six organizational roles...");
        seedSkills();
        seedUsers();
        seedRoleCompetencies();
        seedUserSkills();
        seedCourses();
        seedEnrollmentsAndCertifications();
        seedGapSnapshots();
        log.info("Database seeding completed successfully.");
    }

    private void seedSkills() {
        List<Skill> skills = List.of(
                createSkill("Java", "Technical", "Core Java programming including OOP, collections, streams, and concurrency"),
                createSkill("Spring Boot", "Technical", "Spring Boot framework for building production-ready applications"),
                createSkill("React", "Technical", "React.js library for building user interfaces"),
                createSkill("Python", "Technical", "Python programming for scripting, data analysis, and backend development"),
                createSkill("SQL", "Technical", "Relational database querying and design"),
                createSkill("Docker", "DevOps", "Containerization and container orchestration"),
                createSkill("AWS", "Cloud", "Amazon Web Services cloud platform services"),
                createSkill("Communication", "Soft Skills", "Effective verbal and written communication"),
                createSkill("Leadership", "Management", "Team leadership, delegation, and strategic thinking"),
                createSkill("Agile", "Process", "Agile methodologies including Scrum and Kanban")
        );
        skillRepository.saveAll(skills);
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

    private void seedRoleCompetencies() {
        Map<String, ProficiencyLevel> seCompetencies = Map.of(
                "Java", ProficiencyLevel.ADVANCED,
                "Spring Boot", ProficiencyLevel.INTERMEDIATE,
                "SQL", ProficiencyLevel.INTERMEDIATE,
                "Docker", ProficiencyLevel.BEGINNER,
                "Communication", ProficiencyLevel.INTERMEDIATE
        );
        seCompetencies.forEach((skillName, level) ->
                skillRepository.findByNameIgnoreCase(skillName).ifPresent(skill -> {
                    RoleCompetency rc = new RoleCompetency();
                    rc.setJobTitle("Software Engineer");
                    rc.setDepartment("Engineering");
                    rc.setSkill(skill);
                    rc.setRequiredProficiencyLevel(level);
                    roleCompetencyRepository.save(rc);
                }));

        Map<String, ProficiencyLevel> emCompetencies = Map.of(
                "Leadership", ProficiencyLevel.ADVANCED,
                "Communication", ProficiencyLevel.ADVANCED,
                "Agile", ProficiencyLevel.ADVANCED,
                "Java", ProficiencyLevel.INTERMEDIATE
        );
        emCompetencies.forEach((skillName, level) ->
                skillRepository.findByNameIgnoreCase(skillName).ifPresent(skill -> {
                    RoleCompetency rc = new RoleCompetency();
                    rc.setJobTitle("Engineering Manager");
                    rc.setDepartment("Engineering");
                    rc.setSkill(skill);
                    rc.setRequiredProficiencyLevel(level);
                    roleCompetencyRepository.save(rc);
                }));
    }

    private void seedUserSkills() {
        User alice = userRepository.findByEmail("employee@orgskills.com").orElseThrow();
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
