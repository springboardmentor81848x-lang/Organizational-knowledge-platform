package com.orgskills.intelligence.config;

import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Seeds the external course catalogue that recommendations are drawn from.
 *
 * <p>Every entry points at a real, publicly reachable course on Udemy, YouTube, freeCodeCamp or
 * a vendor's own learning site, mapped to the skill it teaches. That mapping is the whole point:
 * {@code RecommendationService} ranks courses against an employee's gap scores, so a course with
 * no skill attached can never be recommended to anybody.
 *
 * <p>Guarded on external courses specifically rather than on the course table as a whole, so an
 * installation that already has the two internal seed courses still picks these up.
 *
 * <p>These are catalogue entries, not enrolments. Progress and completion are recorded against
 * the platform's own {@code Enrollment} rows as the employee works through a course - neither
 * Udemy nor YouTube exposes another application's per-user completion state, so there is nothing
 * to fetch from them and nothing here pretends otherwise.
 */
@Component
@Order(110)
@RequiredArgsConstructor
@Slf4j
public class CuratedCourseSeeder implements CommandLineRunner {

    private final SkillRepository skillRepository;
    private final CourseRepository courseRepository;

    @Override
    @Transactional
    public void run(String... args) {
        List<Course> courses = new ArrayList<>();

        // ── Java ────────────────────────────────────────────────────────────────
        add(courses, "Java", "Java Programming Masterclass for Developers", "Udemy",
                "Tim Buchalka's long-running Java course: language fundamentals, OOP, collections, "
                        + "streams and the JDK library, taken from first principles to production use.",
                "BEGINNER", 80.0,
                "https://www.udemy.com/course/java-the-complete-java-developer-course/");
        add(courses, "Java", "Java Full Course for Beginners", "YouTube (freeCodeCamp)",
                "A free full-length Java course covering syntax, control flow, objects and collections.",
                "BEGINNER", 12.0,
                "https://www.youtube.com/watch?v=A74TOX803D0");
        add(courses, "Java", "Java Tutorials - Official Oracle Documentation", "Oracle",
                "The canonical Java tutorials, including the concurrency trail that covers the memory "
                        + "model, synchronisation and the java.util.concurrent utilities.",
                "ADVANCED", 20.0,
                "https://docs.oracle.com/javase/tutorial/");

        // ── Spring Boot ─────────────────────────────────────────────────────────
        add(courses, "Spring Boot", "Spring Boot 3, Spring 6 & Hibernate for Beginners", "Udemy",
                "Chad Darby's Spring course: dependency injection, Spring Data JPA, Spring Security "
                        + "and building REST APIs with Spring Boot 3.",
                "INTERMEDIATE", 40.0,
                "https://www.udemy.com/course/spring-hibernate-tutorial/");
        add(courses, "Spring Boot", "Spring Boot Official Guides", "Spring.io",
                "The project's own step-by-step guides, each building a working application against "
                        + "current Spring Boot.",
                "INTERMEDIATE", 10.0,
                "https://spring.io/guides");
        add(courses, "Spring Boot", "Spring Boot Full Course", "YouTube (Amigoscode)",
                "A project-driven walkthrough of building and deploying a Spring Boot REST API.",
                "BEGINNER", 6.0,
                "https://www.youtube.com/watch?v=9SGDpanrc8U");

        // ── React ───────────────────────────────────────────────────────────────
        add(courses, "React", "React - The Complete Guide (incl. Redux)", "Udemy",
                "Maximilian Schwarzmuller's React course: hooks, context, routing, Redux and "
                        + "performance patterns.",
                "INTERMEDIATE", 68.0,
                "https://www.udemy.com/course/react-the-complete-guide-incl-redux/");
        add(courses, "React", "React Official Documentation and Tutorial", "React.dev",
                "The rewritten official docs, built around hooks and function components with "
                        + "interactive examples throughout.",
                "BEGINNER", 15.0,
                "https://react.dev/learn");
        add(courses, "React", "Front End Development Libraries Certification", "freeCodeCamp",
                "A free certification track covering React, Redux, Bootstrap and Sass, assessed by "
                        + "building five projects.",
                "INTERMEDIATE", 300.0,
                "https://www.freecodecamp.org/learn/front-end-development-libraries/");

        // ── Python ──────────────────────────────────────────────────────────────
        add(courses, "Python", "Complete Python Bootcamp From Zero to Hero", "Udemy",
                "Jose Portilla's Python course, from syntax and data structures through modules, "
                        + "testing and practical scripting.",
                "BEGINNER", 22.0,
                "https://www.udemy.com/course/complete-python-bootcamp/");
        add(courses, "Python", "Scientific Computing with Python Certification", "freeCodeCamp",
                "A free certification covering Python fundamentals and applying them to data problems.",
                "INTERMEDIATE", 300.0,
                "https://www.freecodecamp.org/learn/scientific-computing-with-python/");
        add(courses, "Python", "The Python Tutorial - Official Documentation", "Python.org",
                "The language's own tutorial, the reference point for idiomatic Python.",
                "BEGINNER", 12.0,
                "https://docs.python.org/3/tutorial/");

        // ── SQL ─────────────────────────────────────────────────────────────────
        add(courses, "SQL", "The Complete SQL Bootcamp: Go from Zero to Hero", "Udemy",
                "SQL against PostgreSQL: joins, aggregation, subqueries, window functions and schema "
                        + "design.",
                "BEGINNER", 9.0,
                "https://www.udemy.com/course/the-complete-sql-bootcamp/");
        add(courses, "SQL", "Relational Database Certification", "freeCodeCamp",
                "A free hands-on course teaching SQL and PostgreSQL through terminal-based projects.",
                "INTERMEDIATE", 300.0,
                "https://www.freecodecamp.org/learn/relational-database/");
        add(courses, "SQL", "PostgreSQL Official Documentation and Tutorial", "PostgreSQL",
                "The reference manual, including the chapters on indexing, query planning and "
                        + "transaction isolation.",
                "ADVANCED", 25.0,
                "https://www.postgresql.org/docs/current/tutorial.html");

        // ── Docker ──────────────────────────────────────────────────────────────
        add(courses, "Docker", "Docker Mastery: with Kubernetes + Swarm", "Udemy",
                "Bret Fisher's container course: images, layers, volumes, networking, Compose and "
                        + "orchestration.",
                "INTERMEDIATE", 19.0,
                "https://www.udemy.com/course/docker-mastery/");
        add(courses, "Docker", "Docker Official Getting Started Guide", "Docker",
                "Docker's own walkthrough, from a first container to multi-container applications "
                        + "with Compose.",
                "BEGINNER", 5.0,
                "https://docs.docker.com/get-started/");
        add(courses, "Docker", "Docker Tutorial for Beginners", "YouTube (TechWorld with Nana)",
                "A full introduction to containers, images, Dockerfiles, volumes and Docker Compose.",
                "BEGINNER", 3.0,
                "https://www.youtube.com/watch?v=3c-iBn73dDE");

        // ── AWS ─────────────────────────────────────────────────────────────────
        add(courses, "AWS", "AWS Certified Developer Associate", "Udemy",
                "Stephane Maarek's certification course covering the core AWS services a developer "
                        + "builds on, with hands-on labs.",
                "INTERMEDIATE", 32.0,
                "https://www.udemy.com/course/aws-certified-developer-associate-dva-c01/");
        add(courses, "AWS", "AWS Skill Builder", "AWS",
                "Amazon's own free digital training catalogue, including the cloud practitioner and "
                        + "developer learning plans.",
                "BEGINNER", 20.0,
                "https://skillbuilder.aws/");
        add(courses, "AWS", "AWS Well-Architected Framework", "AWS",
                "The reference for designing on AWS: reliability, security, cost and operational "
                        + "excellence, including multi-AZ and multi-Region design.",
                "ADVANCED", 8.0,
                "https://aws.amazon.com/architecture/well-architected/");

        // ── Communication ───────────────────────────────────────────────────────
        add(courses, "Communication", "Improving Communication Skills", "Coursera (Wharton)",
                "A university course on being understood, handling difficult conversations and "
                        + "building trust through communication.",
                "INTERMEDIATE", 9.0,
                "https://www.coursera.org/learn/wharton-communication-skills");
        add(courses, "Communication", "Writing Well for the Web and Business", "Coursera",
                "Structuring written communication so a reader gets the point quickly - the skill "
                        + "behind good status updates and technical summaries.",
                "BEGINNER", 12.0,
                "https://www.coursera.org/learn/business-writing");

        // ── Leadership ──────────────────────────────────────────────────────────
        add(courses, "Leadership", "Leading People and Teams Specialization", "Coursera (Michigan)",
                "Motivation, delegation, feedback and managing team performance, taught as a "
                        + "four-course specialisation.",
                "ADVANCED", 40.0,
                "https://www.coursera.org/specializations/leading-teams");
        add(courses, "Leadership", "Inclusive Leadership: The Power of Workplace Diversity", "Coursera",
                "Building psychological safety and leading teams where people will speak up.",
                "INTERMEDIATE", 16.0,
                "https://www.coursera.org/learn/inclusiveleadership");

        // ── Agile ───────────────────────────────────────────────────────────────
        add(courses, "Agile", "Agile with Atlassian Jira", "Coursera (Atlassian)",
                "Running Scrum and Kanban in practice: backlogs, sprints, boards, WIP limits and "
                        + "the reports that go with them.",
                "BEGINNER", 12.0,
                "https://www.coursera.org/learn/agile-atlassian-jira");
        add(courses, "Agile", "The Scrum Guide", "Scrum.org",
                "The definitive twenty-page description of Scrum: its roles, events and artefacts, "
                        + "from its authors.",
                "BEGINNER", 1.0,
                "https://scrumguides.org/scrum-guide.html");
        add(courses, "Agile", "Agile Crash Course: Agile Project Management", "Udemy",
                "A short practical course on running Agile delivery: backlogs, sprints, estimation "
                        + "and the ceremonies that hold them together.",
                "INTERMEDIATE", 2.0,
                "https://www.udemy.com/course/agile-crash-course/");

        // ── TypeScript ──────────────────────────────────────────────────────────
        add(courses, "TypeScript", "The TypeScript Handbook", "TypeScript (Microsoft)",
                "The official language guide: types, interfaces, generics, narrowing and the "
                        + "compiler options that decide how strict your codebase is.",
                "BEGINNER", 10.0,
                "https://www.typescriptlang.org/docs/handbook/intro.html");
        add(courses, "TypeScript", "Understanding TypeScript", "Udemy",
                "A full walkthrough of TypeScript for application developers, from basic typing "
                        + "through generics, decorators and integrating with React and Node.",
                "INTERMEDIATE", 15.0,
                "https://www.udemy.com/course/understanding-typescript/");
        add(courses, "TypeScript", "Type-Level TypeScript", "type-level-typescript.com",
                "Conditional types, mapped types and inference — how library-grade types are "
                        + "actually written.",
                "ADVANCED", 12.0,
                "https://type-level-typescript.com/");

        // ── Testing ─────────────────────────────────────────────────────────────
        add(courses, "Testing", "JavaScript Testing Introduction", "Testing Library",
                "The guiding principles behind testing user-facing behaviour rather than "
                        + "implementation details, with practical query and assertion patterns.",
                "BEGINNER", 6.0,
                "https://testing-library.com/docs/");
        add(courses, "Testing", "JUnit 5 User Guide", "JUnit",
                "The reference for writing JVM tests: lifecycle, assertions, parameterised tests "
                        + "and extensions.",
                "INTERMEDIATE", 8.0,
                "https://junit.org/junit5/docs/current/user-guide/");
        add(courses, "Testing", "Test Automation University", "Applitools",
                "A free curriculum of short courses covering unit, API, UI and end-to-end "
                        + "automation across several languages and frameworks.",
                "INTERMEDIATE", 30.0,
                "https://testautomationu.applitools.com/");

        // ── Linux ───────────────────────────────────────────────────────────────
        add(courses, "Linux", "Introduction to Linux", "edX (Linux Foundation)",
                "The Linux Foundation's introduction: the shell, filesystem, permissions, "
                        + "processes, packages and networking basics.",
                "BEGINNER", 60.0,
                "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux");
        add(courses, "Linux", "Linux Command Line Full Course", "YouTube (freeCodeCamp)",
                "A free hands-on tour of the command line: navigation, pipes and redirection, "
                        + "permissions, and writing your first shell scripts.",
                "BEGINNER", 5.0,
                "https://www.youtube.com/watch?v=ZtqBQ68cfJc");
        add(courses, "Linux", "The Linux Documentation Project Guides", "TLDP",
                "In-depth guides on shell scripting, system administration and networking for "
                        + "people who already live in a terminal.",
                "ADVANCED", 20.0,
                "https://tldp.org/guides.html");

        // ── Security ────────────────────────────────────────────────────────────
        add(courses, "Security", "OWASP Top 10", "OWASP",
                "The ten most critical web application security risks, each with how it happens "
                        + "and how to prevent it.",
                "BEGINNER", 6.0,
                "https://owasp.org/www-project-top-ten/");
        add(courses, "Security", "Web Security Academy", "PortSwigger",
                "Free labs covering injection, authentication, access control and more — you "
                        + "exploit each vulnerability yourself, then learn the defence.",
                "INTERMEDIATE", 40.0,
                "https://portswigger.net/web-security");
        add(courses, "Security", "OWASP Cheat Sheet Series", "OWASP",
                "Concise, implementation-level guidance on password storage, session management, "
                        + "secrets and the rest of the decisions that go wrong quietly.",
                "ADVANCED", 12.0,
                "https://cheatsheetseries.owasp.org/");

        // ── Data Analysis ───────────────────────────────────────────────────────
        add(courses, "Data Analysis", "Data Analysis with Python Certification", "freeCodeCamp",
                "A free certification covering NumPy, Pandas and the analysis workflow, with "
                        + "five projects to complete.",
                "BEGINNER", 300.0,
                "https://www.freecodecamp.org/learn/data-analysis-with-python/");
        add(courses, "Data Analysis", "Pandas User Guide", "pandas.pydata.org",
                "The official guide to the library most analysis is written in: indexing, "
                        + "grouping, reshaping, joins and time series.",
                "INTERMEDIATE", 15.0,
                "https://pandas.pydata.org/docs/user_guide/index.html");
        add(courses, "Data Analysis", "Google Data Analytics Professional Certificate", "Coursera (Google)",
                "An end-to-end analytics programme: asking the right question, preparing and "
                        + "cleaning data, analysing it, and presenting findings people can act on.",
                "INTERMEDIATE", 180.0,
                "https://www.coursera.org/professional-certificates/google-data-analytics");

        // ── Machine Learning ────────────────────────────────────────────────────
        add(courses, "Machine Learning", "Machine Learning Crash Course", "Google",
                "Google's practical introduction to machine learning, with exercises covering "
                        + "loss, generalisation, feature engineering and fairness.",
                "BEGINNER", 15.0,
                "https://developers.google.com/machine-learning/crash-course");
        add(courses, "Machine Learning", "Machine Learning Specialization", "Coursera (DeepLearning.AI)",
                "Andrew Ng's rebuilt specialisation: supervised and unsupervised learning, "
                        + "model evaluation and the practical advice that decides whether a model works.",
                "INTERMEDIATE", 90.0,
                "https://www.coursera.org/specializations/machine-learning-introduction");
        add(courses, "Machine Learning", "scikit-learn User Guide", "scikit-learn",
                "The reference for classical machine learning in Python, including the model "
                        + "selection and cross-validation chapters that prevent fooling yourself.",
                "ADVANCED", 20.0,
                "https://scikit-learn.org/stable/user_guide.html");

        // ── Product Management ──────────────────────────────────────────────────
        add(courses, "Product Management", "Become a Product Manager", "Udemy",
                "A broad introduction to the role: discovery, backlog ordering, writing stories, "
                        + "working with engineering and measuring what shipped.",
                "BEGINNER", 13.0,
                "https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-a-job/");
        add(courses, "Product Management", "Inspired: Product Management Resources", "Silicon Valley Product Group",
                "Marty Cagan's essays on product discovery, empowered teams and why feature "
                        + "roadmaps go wrong.",
                "INTERMEDIATE", 10.0,
                "https://www.svpg.com/articles/");
        add(courses, "Product Management", "Digital Product Management Specialization", "Coursera (Virginia)",
                "Modern product management taught as a specialisation: customer discovery, "
                        + "experimentation, analytics and leading a product team.",
                "ADVANCED", 60.0,
                "https://www.coursera.org/specializations/uva-darden-digital-product-management");

        if (courses.isEmpty()) {
            log.info("Curated external course catalogue is up to date; no courses were added.");
            return;
        }

        courseRepository.saveAll(courses);
        log.info("Seeded {} curated external courses across Udemy, YouTube, freeCodeCamp, Coursera "
                + "and vendor documentation.", courses.size());
    }

    /**
     * Adds one course, unless its skill is absent or the course is already in the catalogue.
     *
     * <p>A course with no skill would be dead weight: recommendations are ranked by the gap on a
     * skill, so an unattached course can never be selected for anyone.
     *
     * <p>The already-present check is per course rather than a guard over the whole seeder, so a
     * release that adds a skill also delivers that skill's courses to an installation seeded
     * before it existed. Without them a learner targeting a newly added role would generate a
     * learning path with nothing in it.
     */
    private void add(List<Course> target, String skillName, String title, String provider,
                     String description, String difficulty, Double durationHours, String url) {
        Optional<Skill> skill = skillRepository.findByNameIgnoreCase(skillName);
        if (skill.isEmpty()) {
            log.debug("Skill '{}' is not in the catalogue; course '{}' was not seeded.", skillName, title);
            return;
        }
        if (courseRepository.findByTitleIgnoreCaseAndProviderIgnoreCase(title, provider).isPresent()) {
            return;
        }

        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setProvider(provider);
        course.setSkillCovered(skill.get());
        course.setDifficulty(difficulty);
        course.setDurationHours(durationHours);
        course.setDurationLabel(formatDuration(durationHours));
        course.setIsInternal(false);
        course.setExternalUrl(url);
        target.add(course);
    }

    private String formatDuration(Double hours) {
        if (hours == null) {
            return null;
        }
        if (hours >= 100) {
            return Math.round(hours) + " hours (self-paced)";
        }
        return Math.round(hours) + " hours";
    }
}
