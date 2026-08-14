package com.knowledgeiq.service;

import com.knowledgeiq.dto.PersonalizedLearningPathDto;
import com.knowledgeiq.dto.PersonalizedRecommendationDto;
import com.knowledgeiq.dto.SkillGapDto;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        course.setProvider(request.get("provider") != null ? (String) request.get("provider") : "Internal Academy");
        course.setCourseUrl((String) request.get("courseUrl"));
        course.setDurationHours(request.get("durationHours") != null ? Integer.parseInt(request.get("durationHours").toString()) : 8);
        
        if (request.get("targetSkillId") != null && !request.get("targetSkillId").toString().isEmpty()) {
            UUID skillId = UUID.fromString(request.get("targetSkillId").toString());
            skillRepository.findById(skillId).ifPresent(course::setTargetSkill);
        }
        if (request.get("targetLevel") != null) {
            course.setTargetLevel(Integer.parseInt(request.get("targetLevel").toString()));
        } else {
            course.setTargetLevel(3);
        }
        
        return courseRepository.save(course);
    }

    public TrainingCourse updateCourse(UUID id, Map<String, Object> request) {
        TrainingCourse course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found: " + id));
        
        if (request.containsKey("title")) course.setTitle((String) request.get("title"));
        if (request.containsKey("description")) course.setDescription((String) request.get("description"));
        if (request.containsKey("provider")) course.setProvider((String) request.get("provider"));
        if (request.containsKey("courseUrl")) course.setCourseUrl((String) request.get("courseUrl"));
        if (request.containsKey("durationHours") && request.get("durationHours") != null) {
            course.setDurationHours(Integer.parseInt(request.get("durationHours").toString()));
        }
        if (request.containsKey("targetSkillId")) {
            if (request.get("targetSkillId") != null && !request.get("targetSkillId").toString().isEmpty()) {
                UUID skillId = UUID.fromString(request.get("targetSkillId").toString());
                skillRepository.findById(skillId).ifPresent(course::setTargetSkill);
            } else {
                course.setTargetSkill(null);
            }
        }
        if (request.containsKey("targetLevel") && request.get("targetLevel") != null) {
            course.setTargetLevel(Integer.parseInt(request.get("targetLevel").toString()));
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
                    return enrollmentRepository.save(enrollment);
                });
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

            if (!matchingCourses.isEmpty()) {
                for (TrainingCourse tc : matchingCourses) {
                    String status = enrollmentStatuses.getOrDefault(tc.getId(), "NOT_STARTED");
                    boolean isExternal = tc.getCourseUrl() != null && tc.getCourseUrl().startsWith("http");

                    steps.add(new PersonalizedRecommendationDto(
                            tc.getId(),
                            tc.getTitle(),
                            gap.getCategoryName(),
                            tc.getProvider() != null ? tc.getProvider() : "KnowledgeIQ Portal",
                            tc.getDurationHours() != null ? tc.getDurationHours() : 6,
                            cur, req, gapPct, priority, status, whyText, tc.getCourseUrl(),
                            0, false, null, 0.0, isExternal
                    ));
                }
            } else {
                steps.add(new PersonalizedRecommendationDto(
                        UUID.nameUUIDFromBytes(gap.getSkillName().getBytes()),
                        "Mastering " + gap.getSkillName() + " & Best Practices",
                        gap.getCategoryName(),
                        "KnowledgeIQ Learning Center",
                        6, cur, req, gapPct, priority, "NOT_STARTED", whyText, null,
                        0, false, null, 0.0, false
                ));
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
}
