package com.knowledgeiq.service;

import com.knowledgeiq.dto.LearningMilestoneDto;
import com.knowledgeiq.dto.PersonalizedLearningPathDto;
import com.knowledgeiq.dto.PersonalizedRecommendationDto;
import com.knowledgeiq.dto.SkillGapDto;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.knowledgeiq.util.UrlValidatorUtil;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TrainingService {

    @Autowired
    private TrainingCourseRepository courseRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private LearningMilestoneRepository milestoneRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SkillRepository skillRepository;

    public List<TrainingCourse> getAllCourses() {
        return courseRepository.findAll();
    }

    public TrainingCourse createCourse(Map<String, Object> request) {
        TrainingCourse course = new TrainingCourse();
        course.setTitle((String) request.get("title"));
        course.setDescription((String) request.get("description"));
        if (request.containsKey("targetSkillId") && request.get("targetSkillId") != null) {
            try {
                UUID skillId = UUID.fromString(request.get("targetSkillId").toString());
                skillRepository.findById(skillId).ifPresent(course::setTargetSkill);
            } catch (Exception ignored) {}
        }
        if (request.containsKey("targetLevel")) {
            course.setTargetLevel((Integer) request.get("targetLevel"));
        }
        if (request.containsKey("provider")) {
            course.setProvider((String) request.get("provider"));
        }
        if (request.containsKey("courseUrl")) {
            course.setCourseUrl(UrlValidatorUtil.sanitizeUrl((String) request.get("courseUrl")));
        } else if (request.containsKey("url")) {
            course.setCourseUrl(UrlValidatorUtil.sanitizeUrl((String) request.get("url")));
        }
        if (request.containsKey("durationHours")) {
            course.setDurationHours((Integer) request.get("durationHours"));
        }
        return courseRepository.save(course);
    }

    public TrainingCourse updateCourse(UUID id, Map<String, Object> request) {
        TrainingCourse course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (request.containsKey("title")) course.setTitle((String) request.get("title"));
        if (request.containsKey("description")) course.setDescription((String) request.get("description"));
        if (request.containsKey("targetLevel")) course.setTargetLevel((Integer) request.get("targetLevel"));
        if (request.containsKey("provider")) course.setProvider((String) request.get("provider"));
        if (request.containsKey("courseUrl")) {
            course.setCourseUrl(UrlValidatorUtil.sanitizeUrl((String) request.get("courseUrl")));
        } else if (request.containsKey("url")) {
            course.setCourseUrl(UrlValidatorUtil.sanitizeUrl((String) request.get("url")));
        }
        if (request.containsKey("durationHours") && request.get("durationHours") != null) {
            course.setDurationHours(Integer.parseInt(request.get("durationHours").toString()));
        }
        if (request.containsKey("targetSkillId") && request.get("targetSkillId") != null) {
            try {
                UUID skillId = UUID.fromString(request.get("targetSkillId").toString());
                skillRepository.findById(skillId).ifPresent(course::setTargetSkill);
            } catch (Exception ignored) {}
        }
        return courseRepository.save(course);
    }

    public void deleteCourse(UUID id) {
        courseRepository.deleteById(id);
    }

    public List<TrainingCourse> getCoursesForSkill(UUID skillId) {
        return courseRepository.findByTargetSkillId(skillId);
    }

    public CourseEnrollment enrollUser(UUID userId, UUID courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        TrainingCourse course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        return enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseGet(() -> {
                    CourseEnrollment enrollment = new CourseEnrollment();
                    enrollment.setUser(user);
                    enrollment.setCourse(course);
                    enrollment.setStatus("IN_PROGRESS");
                    enrollment.setProgressPercent(0);
                    enrollment.setExpectedCompletionDate(ZonedDateTime.now().plusWeeks(3));
                    return enrollmentRepository.save(enrollment);
                });
    }

    public List<LearningMilestoneDto> getCourseMilestones(UUID courseId, UUID enrollmentId) {
        List<LearningMilestone> milestones = milestoneRepository.findByCourseIdOrderBySequenceOrderAsc(courseId);
        if (milestones.isEmpty()) {
            TrainingCourse course = courseRepository.findById(courseId).orElse(null);
            if (course != null) {
                milestones = seedDefaultMilestones(course);
            }
        }

        Set<String> completedIds = new HashSet<>();
        if (enrollmentId != null) {
            enrollmentRepository.findById(enrollmentId).ifPresent(e -> {
                if (e.getCompletedMilestoneIds() != null && !e.getCompletedMilestoneIds().isBlank()) {
                    completedIds.addAll(Arrays.asList(e.getCompletedMilestoneIds().split(",")));
                }
            });
        }

        return milestones.stream().map(m -> new LearningMilestoneDto(
                m.getId(),
                courseId,
                m.getTitle(),
                m.getDescription(),
                m.getSequenceOrder(),
                m.getCompletionPercentage(),
                completedIds.contains(m.getId().toString())
        )).collect(Collectors.toList());
    }

    private List<LearningMilestone> seedDefaultMilestones(TrainingCourse course) {
        String title = course.getTitle() != null ? course.getTitle() : "Skill Learning";
        List<LearningMilestone> list = Arrays.asList(
                new LearningMilestone(course, "1. Foundations & Setup", "Master prerequisite tools, configuration, and fundamental idioms for " + title + ".", 1, 25),
                new LearningMilestone(course, "2. Core Architecture & Patterns", "Design scalable components and implement domain patterns in " + title + ".", 2, 50),
                new LearningMilestone(course, "3. Implementation & API Integration", "Build end-to-end features, connect services, and validate integrations for " + title + ".", 3, 75),
                new LearningMilestone(course, "4. Production Tuning & Security", "Optimize performance, enforce enterprise security standards, and deploy " + title + ".", 4, 100)
        );
        return milestoneRepository.saveAll(list);
    }

    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> toggleMilestone(UUID enrollmentId, UUID milestoneId) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found: " + enrollmentId));

        Set<String> completed = new LinkedHashSet<>();
        if (enrollment.getCompletedMilestoneIds() != null && !enrollment.getCompletedMilestoneIds().isBlank()) {
            completed.addAll(Arrays.asList(enrollment.getCompletedMilestoneIds().split(",")));
        }

        String mIdStr = milestoneId.toString();
        if (completed.contains(mIdStr)) {
            completed.remove(mIdStr);
        } else {
            completed.add(mIdStr);
        }

        enrollment.setCompletedMilestoneIds(String.join(",", completed));

        List<LearningMilestone> totalMilestones = milestoneRepository.findByCourseIdOrderBySequenceOrderAsc(enrollment.getCourse().getId());
        if (totalMilestones.isEmpty()) {
            totalMilestones = seedDefaultMilestones(enrollment.getCourse());
        }

        int totalCount = totalMilestones.size();
        int completedCount = 0;
        for (LearningMilestone m : totalMilestones) {
            if (completed.contains(m.getId().toString())) {
                completedCount++;
            }
        }

        int progressPct = totalCount > 0 ? (int) Math.round(((double) completedCount / totalCount) * 100.0) : 0;
        enrollment.setProgressPercent(progressPct);

        if (progressPct >= 100) {
            updateEnrollmentStatus(enrollmentId, "COMPLETED");
        } else {
            enrollment.setStatus("IN_PROGRESS");
            enrollmentRepository.save(enrollment);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("enrollmentId", enrollmentId);
        res.put("progressPercent", progressPct);
        res.put("status", enrollment.getStatus());
        res.put("completedMilestoneIds", enrollment.getCompletedMilestoneIds());
        res.put("milestones", getCourseMilestones(enrollment.getCourse().getId(), enrollmentId));
        return res;
    }

    @org.springframework.transaction.annotation.Transactional
    public CourseEnrollment updateEnrollmentProgress(UUID enrollmentId, int progressPercent) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found: " + enrollmentId));

        int clamped = Math.max(0, Math.min(100, progressPercent));
        enrollment.setProgressPercent(clamped);

        if (clamped >= 100) {
            return updateEnrollmentStatus(enrollmentId, "COMPLETED");
        } else {
            enrollment.setStatus("IN_PROGRESS");
            return enrollmentRepository.save(enrollment);
        }
    }

    public List<CourseEnrollment> getUserEnrollments(UUID userId) {
        return enrollmentRepository.findByUserId(userId);
    }

    @org.springframework.transaction.annotation.Transactional
    public CourseEnrollment updateEnrollmentStatus(UUID enrollmentId, String status) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found: " + enrollmentId));
        enrollment.setStatus(status);
        if ("COMPLETED".equalsIgnoreCase(status)) {
            enrollment.setCompletedAt(ZonedDateTime.now());

            // 1. Update skill evidence/proficiency upon course completion
            if (enrollment.getCourse() != null && enrollment.getCourse().getTargetSkill() != null) {
                Skill targetSkill = enrollment.getCourse().getTargetSkill();
                User user = enrollment.getUser();
                int targetLvl = enrollment.getCourse().getTargetLevel() != null ? enrollment.getCourse().getTargetLevel() : 4;

                EmployeeSkill es = employeeSkillRepository.findByUserIdAndSkillId(user.getId(), targetSkill.getId())
                        .orElseGet(() -> {
                            EmployeeSkill newEs = new EmployeeSkill();
                            newEs.setUser(user);
                            newEs.setSkill(targetSkill);
                            return newEs;
                        });
                es.setProficiencyLevel(Math.max(es.getProficiencyLevel() != null ? es.getProficiencyLevel() : 1, targetLvl));
                employeeSkillRepository.save(es);
            }

            // 2. Trigger Gap Analysis Engine recalculation
            try {
                gapAnalysisService.recalculateUserGaps(enrollment.getUser().getId());
                notificationService.createRecommendationNotification(
                        enrollment.getUser(),
                        "Personalized Learning Path Updated",
                        "Course completed! Your learning path and gap metrics have been updated.",
                        "/learning"
                );
            } catch (Exception e) {
                System.err.println("Failed gap recalculation on course completion: " + e.getMessage());
            }
        }
        return enrollmentRepository.save(enrollment);
    }

    public List<TrainingCourse> getRecommendations(UUID userId) {
        List<SkillGapDto> gaps = gapAnalysisService.calculateUserGaps(userId);
        Set<TrainingCourse> recommendations = new HashSet<>();
        for (SkillGapDto gap : gaps) {
            if (gap.getCurrentLevel() < gap.getRequiredLevel()) {
                recommendations.addAll(courseRepository.findByTargetSkillId(gap.getSkillId()));
            }
        }
        return new ArrayList<>(recommendations);
    }

    public List<PersonalizedRecommendationDto> getPersonalizedRecommendations(UUID userId) {
        PersonalizedLearningPathDto path = getPersonalizedLearningPath(userId);
        return path.getSteps();
    }

    public PersonalizedLearningPathDto getPersonalizedLearningPath(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        String roleTitle = (user != null && user.getRole() != null) ? user.getRole().getTitle() : "Software Engineer";

        List<SkillGapDto> gaps = gapAnalysisService.calculateUserGaps(userId);
        List<CourseEnrollment> enrollments = getUserEnrollments(userId);
        Map<UUID, String> enrollmentStatuses = enrollments.stream()
                .collect(Collectors.toMap(e -> e.getCourse().getId(), CourseEnrollment::getStatus, (v1, v2) -> v1));

        boolean isNewUser = gaps.isEmpty();
        boolean hasNoGaps = true;

        int totalCurr = 0;
        int totalReq = 0;
        String topGapSkillName = "None";
        int maxGapPct = 0;

        for (SkillGapDto g : gaps) {
            totalCurr += g.getCurrentLevel();
            totalReq += g.getRequiredLevel();
            if (g.getCurrentLevel() < g.getRequiredLevel()) {
                hasNoGaps = false;
                int req = g.getRequiredLevel();
                int gapPct = req > 0 ? (int) Math.round(((double) (req - g.getCurrentLevel()) / req) * 100) : 0;
                if (gapPct > maxGapPct) {
                    maxGapPct = gapPct;
                    topGapSkillName = g.getSkillName();
                }
            }
        }

        int overallSkillScore = totalReq > 0 ? (int) Math.round(((double) totalCurr / totalReq) * 100) : 100;
        int overallGapPct = Math.max(0, 100 - overallSkillScore);

        List<PersonalizedRecommendationDto> steps = new ArrayList<>();

        for (SkillGapDto gap : gaps) {
            int cur = gap.getCurrentLevel();
            int req = gap.getRequiredLevel();
            if (cur >= req && req > 0) continue; // Skip skills meeting benchmark

            int gapScore = Math.max(0, req - cur);
            int gapPct = req > 0 ? (int) Math.round(((double) gapScore / req) * 100) : 100;

            String priority;
            if (gapPct >= 75 || (gap.getIsCritical() != null && gap.getIsCritical())) {
                priority = "CRITICAL";
            } else if (gapPct >= 50) {
                priority = "HIGH";
            } else if (gapPct >= 25) {
                priority = "MEDIUM";
            } else {
                priority = "LOW";
            }

            String whyText = String.format("Addresses your %s gap. Your level: %d/5 | %s benchmark: %d/5 (Gap: %d%%).",
                    gap.getSkillName(), cur, roleTitle, req, gapPct);

            List<TrainingCourse> matchingCourses = courseRepository.findByTargetSkillId(gap.getSkillId());
            if (matchingCourses.isEmpty()) {
                TrainingCourse autoCreated = resolveOrCreateCourseForSkill(gap);
                if (autoCreated != null) {
                    matchingCourses = Collections.singletonList(autoCreated);
                }
            }

            if (!matchingCourses.isEmpty()) {
                for (TrainingCourse tc : matchingCourses) {
                    String status = enrollmentStatuses.getOrDefault(tc.getId(), "NOT_STARTED");
                    boolean isExternal = tc.getCourseUrl() != null && tc.getCourseUrl().startsWith("http");

                    PersonalizedRecommendationDto recDto = new PersonalizedRecommendationDto(
                            tc.getId(),
                            tc.getTitle(),
                            gap.getCategoryName(),
                            tc.getProvider() != null ? tc.getProvider() : "KnowledgeIQ Portal",
                            tc.getDurationHours() != null ? tc.getDurationHours() : 6,
                            cur, req, gapPct, priority, status, whyText, tc.getCourseUrl(),
                            0, false, null, 0.0, isExternal
                    );
                    recDto.setSkillName(gap.getSkillName());
                    recDto.setDescription(tc.getDescription());
                    steps.add(recDto);
                }
            } else {
                PersonalizedRecommendationDto fallbackDto = new PersonalizedRecommendationDto(
                        UUID.nameUUIDFromBytes(gap.getSkillName().getBytes()),
                        "Mastering " + gap.getSkillName() + " & Best Practices",
                        gap.getCategoryName(),
                        "KnowledgeIQ Learning Center",
                        6, cur, req, gapPct, priority, "NOT_STARTED", whyText, null,
                        0, false, null, 0.0, false
                );
                fallbackDto.setSkillName(gap.getSkillName());
                steps.add(fallbackDto);
            }
        }

        // Intelligently sort steps into a logical progression:
        // 1. Foundational / Prerequisites first (e.g. Docker before Kubernetes, Fundamentals before Advanced)
        // 2. Priority: CRITICAL -> HIGH -> MEDIUM -> LOW
        // 3. Gap Percentage descending
        steps.sort((s1, s2) -> {
            int p1 = getPrerequisiteWeight(s1.getTitle(), s1.getCategory());
            int p2 = getPrerequisiteWeight(s2.getTitle(), s2.getCategory());
            if (p1 != p2) return Integer.compare(p1, p2);

            int prioScore1 = getPriorityScore(s1.getPriority());
            int prioScore2 = getPriorityScore(s2.getPriority());
            if (prioScore1 != prioScore2) return Integer.compare(prioScore2, prioScore1);

            return Integer.compare(s2.getGapPercentage(), s1.getGapPercentage());
        });

        // Assign step numbers and set 'isStartHere' flag on the first non-completed course
        boolean startHereSet = false;
        int completedCount = 0;

        for (int i = 0; i < steps.size(); i++) {
            PersonalizedRecommendationDto step = steps.get(i);
            step.setStepNumber(i + 1);
            if ("COMPLETED".equalsIgnoreCase(step.getStatus())) {
                completedCount++;
                step.setIsStartHere(false);
            } else if (!startHereSet) {
                step.setIsStartHere(true);
                startHereSet = true;
            } else {
                step.setIsStartHere(false);
            }
        }

        // Generate 'Why this order?' explanation banner
        String pathWhyOrderExplanation = generateWhyOrderExplanation(roleTitle, steps);

        return new PersonalizedLearningPathDto(
                roleTitle,
                overallSkillScore,
                overallGapPct,
                topGapSkillName,
                pathWhyOrderExplanation,
                completedCount,
                steps.size(),
                hasNoGaps,
                isNewUser,
                steps
        );
    }

    private int getPrerequisiteWeight(String title, String category) {
        String lower = title.toLowerCase();
        if (lower.contains("docker") || lower.contains("fundamentals") || lower.contains("introduction") || lower.contains("basics")) {
            return 1; // High priority prerequisite
        }
        if (lower.contains("kubernetes") && !lower.contains("advanced")) {
            return 2;
        }
        if (lower.contains("terraform") || lower.contains("sql") && !lower.contains("advanced")) {
            return 3;
        }
        if (lower.contains("advanced") || lower.contains("production") || lower.contains("tuning")) {
            return 4; // Advanced courses come later
        }
        return 3; // Default weight
    }

    private int getPriorityScore(String priority) {
        if ("CRITICAL".equalsIgnoreCase(priority)) return 4;
        if ("HIGH".equalsIgnoreCase(priority)) return 3;
        if ("MEDIUM".equalsIgnoreCase(priority)) return 2;
        return 1;
    }

    private String generateWhyOrderExplanation(String roleTitle, List<PersonalizedRecommendationDto> steps) {
        if (steps.isEmpty()) {
            return "You currently meet all required skill benchmarks for your " + roleTitle + " role.";
        }
        PersonalizedRecommendationDto first = steps.stream().filter(s -> !"COMPLETED".equalsIgnoreCase(s.getStatus())).findFirst().orElse(steps.get(0));
        return String.format("We recommend starting with %s because it closes a foundational competency required for your %s benchmark. Subsequent modules build on this core foundation to maximize gap reduction.",
                first.getTitle(), roleTitle);
    }

    public Map<String, Object> getMyLearning(UUID userId) {
        List<CourseEnrollment> enrollments = getUserEnrollments(userId);
        long inProgressCount = enrollments.stream().filter(e -> "IN_PROGRESS".equalsIgnoreCase(e.getStatus())).count();
        long completedCount = enrollments.stream().filter(e -> "COMPLETED".equalsIgnoreCase(e.getStatus())).count();
        
        Map<String, Object> myLearning = new HashMap<>();
        myLearning.put("inProgress", inProgressCount);
        myLearning.put("completed", completedCount);
        myLearning.put("totalHours", enrollments.stream()
                .filter(e -> "COMPLETED".equalsIgnoreCase(e.getStatus()))
                .mapToInt(e -> e.getCourse().getDurationHours() != null ? e.getCourse().getDurationHours() : 0)
                .sum());
        
        return myLearning;
    }

    public List<Map<String, Object>> getExternalCatalog() {
        return Arrays.asList(
                createCatalogEntry(
                        "coursera-spring-boot",
                        "Spring Framework & Microservices Specialization",
                        "Coursera (LearnQuest)",
                        "Coursera",
                        "Java Spring Boot",
                        4.8, 12400, 32, "Intermediate to Advanced",
                        "https://www.coursera.org/specializations/spring-framework",
                        "BESTSELLER"
                ),
                createCatalogEntry(
                        "udemy-react-complete",
                        "React - The Complete Guide 2026 (incl. Next.js, Redux)",
                        "Udemy (Maximilian Schwarzmüller)",
                        "Udemy",
                        "React",
                        4.9, 198000, 48, "All Levels",
                        "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
                        "HOT & NEW"
                ),
                createCatalogEntry(
                        "coursera-aws-architect",
                        "AWS Cloud Solutions Architect Professional Certificate",
                        "Coursera (Amazon Web Services)",
                        "Coursera",
                        "Cloud / AWS",
                        4.8, 45000, 40, "Intermediate",
                        "https://www.coursera.org/professional-certificates/aws-cloud-solutions-architect",
                        "OFFICIAL AWS"
                ),
                createCatalogEntry(
                        "linkedin-sql-mastery",
                        "Advanced SQL for Data Engineers & Query Optimization",
                        "LinkedIn Learning",
                        "LinkedIn Learning",
                        "SQL",
                        4.7, 8500, 14, "Advanced",
                        "https://www.linkedin.com/learning/advanced-sql-for-data-engineering",
                        "POPULAR"
                ),
                createCatalogEntry(
                        "udemy-oauth-security",
                        "OAuth 2.0 & OpenID Connect in Spring Boot 3",
                        "Udemy",
                        "Udemy",
                        "Cybersecurity & OAuth2",
                        4.8, 6200, 18, "Intermediate",
                        "https://www.udemy.com/course/oauth2-spring-boot-security/",
                        "SECURITY"
                ),
                createCatalogEntry(
                        "pluralsight-soft-skills",
                        "Executive Communication & Technical Leadership",
                        "Pluralsight",
                        "Pluralsight",
                        "Communication & Soft Skills",
                        4.9, 14500, 10, "All Levels",
                        "https://www.pluralsight.com/courses/executive-communication-skills",
                        "LEADERSHIP"
                )
        );
    }

    private Map<String, Object> createCatalogEntry(String id, String title, String provider, String platform,
                                                   String targetSkill, double rating, int reviewsCount,
                                                   int durationHours, String level, String courseUrl, String badge) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", id);
        m.put("title", title);
        m.put("provider", provider);
        m.put("platform", platform);
        m.put("targetSkill", targetSkill);
        m.put("rating", rating);
        m.put("reviewsCount", reviewsCount);
        m.put("durationHours", durationHours);
        m.put("level", level);
        m.put("courseUrl", courseUrl);
        m.put("badge", badge);
        return m;
    }

    private TrainingCourse resolveOrCreateCourseForSkill(SkillGapDto gap) {
        if (gap == null || gap.getSkillName() == null) return null;
        String skillName = gap.getSkillName().trim();
        String lower = skillName.toLowerCase();

        String title;
        String provider;
        String courseUrl;
        String description;

        if (lower.contains("spring") || lower.contains("java")) {
            title = "Spring Boot & Microservices Development";
            provider = "Spring / VMware";
            courseUrl = "https://spring.io/guides/gs/spring-boot";
            description = "Build enterprise-grade microservices and robust REST APIs with Spring Boot.";
        } else if (lower.contains("react") || lower.contains("frontend")) {
            title = "Modern React Architecture & Component Design";
            provider = "React / Meta";
            courseUrl = "https://react.dev/learn";
            description = "Master React hooks, state management, and modern component patterns.";
        } else if (lower.contains("python")) {
            title = "Python Programming & Core Language Idioms";
            provider = "Python Software Foundation";
            courseUrl = "https://docs.python.org/3/tutorial/";
            description = "Learn idiomatic Python, data structures, and automated scripting.";
        } else if (lower.contains("sql") || lower.contains("postgres") || lower.contains("database")) {
            title = "Advanced SQL Optimization & Relational Modeling";
            provider = "PostgreSQL";
            courseUrl = "https://www.postgresql.org/docs/current/tutorial.html";
            description = "Relational database modeling, query tuning, and index optimization.";
        } else if (lower.contains("aws") || lower.contains("cloud")) {
            title = "AWS Cloud Solutions Architect Foundations";
            provider = "Amazon Web Services";
            courseUrl = "https://aws.amazon.com/getting-started/";
            description = "Design resilient, scalable infrastructure on AWS cloud services.";
        } else if (lower.contains("docker") || lower.contains("container")) {
            title = "Docker Containerization & Compose Orchestration";
            provider = "Docker";
            courseUrl = "https://docs.docker.com/get-started/";
            description = "Containerization fundamentals, multi-stage builds, and Compose workflows.";
        } else if (lower.contains("kubernetes") || lower.contains("k8s")) {
            title = "Kubernetes Production Cluster Orchestration";
            provider = "Kubernetes";
            courseUrl = "https://kubernetes.io/docs/tutorials/";
            description = "Deploy, scale, and manage containerized microservices on Kubernetes.";
        } else if (lower.contains("figma") || lower.contains("design") || lower.contains("ux") || lower.contains("ui")) {
            title = "Figma Design Systems & Interactive Prototyping";
            provider = "Figma";
            courseUrl = "https://help.figma.com/hc/en-us/categories/360002051613-Get-started";
            description = "Build scalable UI component libraries and high-fidelity interactive prototypes.";
        } else if (lower.contains("recruit") || lower.contains("talent")) {
            title = "Strategic Talent Acquisition & Hiring Frameworks";
            provider = "SHRM";
            courseUrl = "https://www.shrm.org/topics/talent-acquisition";
            description = "Modern sourcing, competency-based interviewing, and talent pipelines.";
        } else if (lower.contains("communication") || lower.contains("leadership") || lower.contains("stakeholder")) {
            title = "Executive Communication & Stakeholder Alignment";
            provider = "Coursera";
            courseUrl = "https://www.coursera.org/learn/executive-presence";
            description = "Frameworks for technical leadership and executive stakeholder communication.";
        } else {
            title = "Mastering " + skillName + " & Core Practices";
            provider = "KnowledgeIQ Learning";
            courseUrl = null;
            description = "Comprehensive learning module covering " + skillName + " benchmarks.";
        }

        Skill skill = null;
        if (gap.getSkillId() != null) {
            skill = skillRepository.findById(gap.getSkillId()).orElse(null);
        }
        if (skill == null) {
            skill = skillRepository.findAllByName(skillName).stream().findFirst().orElse(null);
        }

        TrainingCourse tc = new TrainingCourse();
        tc.setTitle(title);
        tc.setDescription(description);
        tc.setProvider(provider);
        tc.setCourseUrl(UrlValidatorUtil.sanitizeUrl(courseUrl));
        tc.setTargetSkill(skill);
        tc.setTargetLevel(gap.getRequiredLevel() != null ? gap.getRequiredLevel() : 4);
        tc.setDurationHours(6);
        return courseRepository.save(tc);
    }
}
