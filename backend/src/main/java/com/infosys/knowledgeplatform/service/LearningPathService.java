package com.infosys.knowledgeplatform.service;

import com.infosys.knowledgeplatform.model.EmployeeImprovement;
import com.infosys.knowledgeplatform.model.Skill;
import com.infosys.knowledgeplatform.model.TrainingProgram;
import com.infosys.knowledgeplatform.model.User;
import com.infosys.knowledgeplatform.model.UserSkill;
import com.infosys.knowledgeplatform.repository.EmployeeImprovementRepository;
import com.infosys.knowledgeplatform.repository.SkillRepository;
import com.infosys.knowledgeplatform.repository.TrainingProgramRepository;
import com.infosys.knowledgeplatform.repository.UserRepository;
import com.infosys.knowledgeplatform.repository.UserSkillRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LearningPathService {

    private final TrainingProgramRepository trainingProgramRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final EmployeeImprovementRepository employeeImprovementRepository;
    private final SkillRepository skillRepository;
    private final RoleCatalogService roleCatalogService;
    private final String courseApiKey;

    public LearningPathService(
            TrainingProgramRepository trainingProgramRepository,
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            EmployeeImprovementRepository employeeImprovementRepository,
            SkillRepository skillRepository,
            RoleCatalogService roleCatalogService,
            @Value("${app.course.api-key}") String courseApiKey
    ) {
        this.trainingProgramRepository = trainingProgramRepository;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.employeeImprovementRepository = employeeImprovementRepository;
        this.skillRepository = skillRepository;
        this.roleCatalogService = roleCatalogService;
        this.courseApiKey = courseApiKey;
    }

    public boolean isValidApiKey(String apiKey) {
        return apiKey != null && !apiKey.isBlank() && courseApiKey.equals(apiKey);
    }

    public Map<String, Object> buildDashboard(String role, String email) {
        RoleCatalogService.RoleProfile profile = roleCatalogService.getProfile(role);
        String family = roleCatalogService.getFamily(role);
        Optional<User> user = email == null || email.isBlank() ? Optional.empty() : userRepository.findByEmail(email);
        Optional<EmployeeImprovement> improvement = user.map(u -> employeeImprovementRepository.findByEmployeeEmail(u.getEmail()).orElse(null));

        List<Map<String, Object>> recommendations = generateCourseRecommendations(role, email, 5);
        List<Map<String, Object>> notifications = buildNotifications(profile, improvement.orElse(null));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("roleProfile", profile);
        response.put("roleFamily", family);
        response.put("permissions", profile.permissions());
        response.put("stats", buildStats(profile, family, user.orElse(null), improvement.orElse(null)));
        response.put("learningPath", buildLearningPath(profile));
        response.put("trainingRecommendations", recommendations);
        response.put("notifications", notifications);

        if ("employee".equals(family)) {
            response.put("skillProfile", buildSkillProfile(user.orElse(null)));
            response.put("skillGaps", buildEmployeeSkillGaps(user.orElse(null), improvement.orElse(null)));
            response.put("achievements", List.of(
                    Map.of("title", "Assessment complete", "value", "Active", "icon", "badge"),
                    Map.of("title", "Recommended learning paths", "value", recommendations.size(), "icon", "bookOpen")
            ));
            response.put("certifications", List.of(
                    Map.of("title", "AWS Foundations", "status", "In progress"),
                    Map.of("title", "Internal Security Basics", "status", "Planned")
            ));
            response.put("peerAssessment", List.of(
                    Map.of("peer", "Manager review", "status", "Ready"),
                    Map.of("peer", "Knowledge sharing circle", "status", "Scheduled")
            ));
        } else if ("manager".equals(family)) {
            response.put("teamSkillCoverage", buildTeamSkillCoverage(profile));
            response.put("teamSkillGaps", buildTeamSkillGaps(profile));
            response.put("highRiskGaps", buildHighRiskGaps(profile));
            response.put("individualProgressSnapshots", buildProgressSnapshots());
            response.put("trainingAdoptionRates", buildAdoptionRates());
        } else if ("hr".equals(family)) {
            response.put("organizationGapIntelligence", buildOrganizationGapIntelligence());
            response.put("workforceSkillInventory", buildWorkforceSkillInventory());
            response.put("trainingEffectiveness", buildTrainingEffectiveness());
            response.put("strategicSkillForecasting", buildForecasting());
            response.put("userManagementSummary", buildUserManagementSummary());
        } else if ("learning".equals(family)) {
            response.put("trainingCatalog", buildTrainingCatalog());
            response.put("recommendationScoring", recommendations);
            response.put("learningEffectiveness", buildLearningEffectiveness());
            response.put("catalogFocus", profile.focusSkills());
            response.put("completionTracking", buildCompletionTracking());
        } else if ("system".equals(family)) {
            response.put("systemMonitoring", buildSystemMonitoring());
            response.put("accessControlSummary", buildAccessControlSummary(profile));
            response.put("securitySummary", buildSecuritySummary());
            response.put("userLifecycleSummary", buildUserLifecycleSummary());
        }

        response.put("gapHeatmap", buildGapHeatmap());
        response.put("departmentSkillCoverage", buildDepartmentSkillCoverage());
        response.put("recentActivities", buildRecentActivities());
        return response;
    }

    private List<Map<String, Object>> buildStats(RoleCatalogService.RoleProfile profile, String family, User user, EmployeeImprovement improvement) {
        if ("employee".equals(family)) {
            return List.of(
                    Map.of("title", "Skill profile", "value", buildSkillProfile(user).size(), "trend", "Live", "icon", "user"),
                    Map.of("title", "Skill gaps", "value", buildEmployeeSkillGaps(user, improvement).size(), "trend", "Needs focus", "icon", "target"),
                    Map.of("title", "Learning paths", "value", buildLearningPath(profile).size(), "trend", "Personalized", "icon", "bookOpen"),
                    Map.of("title", "Notifications", "value", buildNotifications(profile, improvement).size(), "trend", "Fresh", "icon", "bell")
            );
        }

        if ("manager".equals(family)) {
            return List.of(
                    Map.of("title", "Team coverage", "value", 78, "trend", "+6%", "icon", "users"),
                    Map.of("title", "High-risk gaps", "value", 4, "trend", "Watchlist", "icon", "alertTriangle"),
                    Map.of("title", "Training adoption", "value", 82, "trend", "+12%", "icon", "bookOpen"),
                    Map.of("title", "Progress snapshots", "value", buildProgressSnapshots().size(), "trend", "Current", "icon", "trendingUp")
            );
        }

        if ("hr".equals(family)) {
            return List.of(
                    Map.of("title", "Workforce inventory", "value", userRepository.count(), "trend", "Current", "icon", "users"),
                    Map.of("title", "Tracked skills", "value", skillRepository.count(), "trend", "Live", "icon", "target"),
                    Map.of("title", "Training effectiveness", "value", 74, "trend", "+8%", "icon", "bookOpen"),
                    Map.of("title", "Forecast coverage", "value", buildForecasting().size(), "trend", "Planned", "icon", "barChart")
            );
        }

        if ("learning".equals(family)) {
            return List.of(
                    Map.of("title", "Catalog programs", "value", buildTrainingCatalog().size(), "trend", "Managed", "icon", "bookOpen"),
                    Map.of("title", "Recommended paths", "value", recommendationsCount(profile), "trend", "Scored", "icon", "sparkles"),
                    Map.of("title", "Completion tracking", "value", buildCompletionTracking().size(), "trend", "Live", "icon", "checkCircle"),
                    Map.of("title", "Learning effectiveness", "value", 68, "trend", "+5%", "icon", "trendingUp")
            );
        }

        return List.of(
                Map.of("title", "Authenticated users", "value", userRepository.count(), "trend", "Live", "icon", "shield"),
                Map.of("title", "Role policies", "value", profile.permissions().size(), "trend", "Configured", "icon", "key"),
                Map.of("title", "System checks", "value", buildSystemMonitoring().size(), "trend", "Healthy", "icon", "monitor"),
                Map.of("title", "Access rules", "value", buildAccessControlSummary(profile).size(), "trend", "Active", "icon", "lock")
        );
    }

    private int recommendationsCount(RoleCatalogService.RoleProfile profile) {
        return Math.max(1, profile.focusSkills().size());
    }

    public List<Map<String, Object>> generateCourseRecommendations(String role, String email, int limit) {
        RoleCatalogService.RoleProfile profile = roleCatalogService.getProfile(role);
        String family = roleCatalogService.getFamily(role);
        Optional<User> user = email == null || email.isBlank() ? Optional.empty() : userRepository.findByEmail(email);
        List<UserSkill> userSkills = user.map(value -> userSkillRepository.findAll().stream()
                .filter(entry -> entry.getUser() != null && value.getId().equals(entry.getUser().getId()))
                .toList()).orElse(List.of());

        Map<String, Integer> skillGapWeights = buildSkillGapWeights(user.orElse(null), userSkills, profile);
        List<Map<String, Object>> recommendations = new ArrayList<>();

        for (TrainingProgram program : trainingProgramRepository.findAll()) {
            int score = scoreProgram(program, profile, family, skillGapWeights);
            if (score < 45) {
                continue;
            }

            recommendations.add(Map.of(
                    "id", program.getId(),
                    "title", program.getTitle(),
                    "provider", program.getProvider(),
                    "duration", program.getDurationHours() + "h",
                    "durationHours", program.getDurationHours(),
                    "url", program.getUrl(),
                    "matchScore", score,
                    "source", "Internal Catalog",
                    "category", program.getTargetSkillCategory(),
                    "reason", buildReason(program, profile, family)
            ));
        }

        recommendations.addAll(buildSyntheticCourses(profile, skillGapWeights));

        return recommendations.stream()
                .sorted(Comparator.comparingInt((Map<String, Object> item) -> (Integer) item.get("matchScore")).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private int scoreProgram(TrainingProgram program, RoleCatalogService.RoleProfile profile, String family, Map<String, Integer> skillGapWeights) {
        String title = safeLower(program.getTitle());
        String provider = safeLower(program.getProvider());
        String category = safeLower(program.getTargetSkillCategory());
        int score = 20;

        for (String focus : profile.focusSkills()) {
            String focusTerm = safeLower(focus);
            if (title.contains(focusTerm) || provider.contains(focusTerm) || category.contains(focusTerm)) {
                score += 28;
            }
        }

        if (family.equals("manager") && (title.contains("lead") || title.contains("coach") || title.contains("manager") || title.contains("people"))) {
            score += 18;
        }

        if (family.equals("hr") && (title.contains("analytics") || title.contains("forecast") || title.contains("workforce") || title.contains("report"))) {
            score += 18;
        }

        if (family.equals("learning") && (title.contains("learning") || title.contains("catalog") || title.contains("mentor") || title.contains("completion"))) {
            score += 18;
        }

        if (family.equals("system") && (title.contains("security") || title.contains("access") || title.contains("monitor") || title.contains("identity"))) {
            score += 18;
        }

        for (Map.Entry<String, Integer> entry : skillGapWeights.entrySet()) {
            if (title.contains(entry.getKey()) || category.contains(entry.getKey())) {
                score += Math.min(22, entry.getValue());
            }
        }

        if (program.getProvider() != null && program.getProvider().toLowerCase(Locale.ROOT).contains("internal")) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    private Map<String, Integer> buildSkillGapWeights(User user, List<UserSkill> userSkills, RoleCatalogService.RoleProfile profile) {
        Map<String, Integer> weights = new HashMap<>();
        for (String skill : profile.focusSkills()) {
            weights.put(skill.toLowerCase(Locale.ROOT), 10);
        }

        for (UserSkill userSkill : userSkills) {
            Skill skill = userSkill.getSkill();
            if (skill == null || skill.getName() == null) {
                continue;
            }

            int gap = Math.max(0, userSkill.getRequiredLevel() - userSkill.getProficiencyLevel());
            if (gap > 0) {
                weights.put(skill.getName().toLowerCase(Locale.ROOT), gap * 12);
            }
        }

        Optional.ofNullable(user).flatMap(value -> employeeImprovementRepository.findByEmployeeEmail(value.getEmail())).ifPresent(improvement -> {
            if (improvement.getGapSummary() != null) {
                for (String token : improvement.getGapSummary().split("[|,]")) {
                    String cleaned = token.trim().toLowerCase(Locale.ROOT);
                    if (!cleaned.isBlank()) {
                        weights.put(cleaned, 14);
                    }
                }
            }
        });

        return weights;
    }

    private List<Map<String, Object>> buildSyntheticCourses(RoleCatalogService.RoleProfile profile, Map<String, Integer> skillGapWeights) {
        List<Map<String, Object>> courses = new ArrayList<>();
        int index = 1;

        for (String focus : profile.focusSkills()) {
            String normalized = focus.toLowerCase(Locale.ROOT);
            int score = 72 + Math.min(18, skillGapWeights.getOrDefault(normalized, 8));
            courses.add(Map.of(
                    "id", "synthetic-" + index,
                    "title", profile.displayName() + " learning sprint: " + focus,
                    "provider", "AI Generated",
                    "duration", "6h",
                    "durationHours", 6,
                    "url", "https://www.google.com/search?q=" + focus.replace(" ", "+") + "+learning+resources",
                    "matchScore", Math.min(score, 98),
                    "source", "Role Blueprint",
                    "category", focus,
                    "reason", "Generated from the " + profile.displayName() + " role blueprint"
            ));
            index++;
        }

        if (courses.isEmpty()) {
            courses.add(Map.of(
                    "id", "synthetic-default",
                    "title", profile.displayName() + " development path",
                    "provider", "AI Generated",
                    "duration", "8h",
                    "durationHours", 8,
                    "url", "https://www.google.com/search?q=" + profile.displayName().replace(" ", "+") + "+course",
                    "matchScore", 78,
                    "source", "Role Blueprint",
                    "category", profile.audience(),
                    "reason", "Generated from the role blueprint"
            ));
        }

        return courses;
    }

    private List<Map<String, Object>> buildLearningPath(RoleCatalogService.RoleProfile profile) {
        return profile.focusSkills().stream()
                .map(skill -> Map.<String, Object>of(
                        "title", skill,
                        "status", "Recommended",
                        "priority", profile.family().equals("employee") ? "Personal" : "Team"
                ))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildNotifications(RoleCatalogService.RoleProfile profile, EmployeeImprovement improvement) {
        List<Map<String, Object>> notifications = new ArrayList<>();
        notifications.add(Map.of("title", "Role access loaded", "message", profile.displayName() + " permissions ready", "priority", "info"));
        if (improvement != null && improvement.getOverallScore() != null) {
            notifications.add(Map.of("title", "Learning update", "message", "Current score: " + improvement.getOverallScore() + "%", "priority", "low"));
        }
        return notifications;
    }

    private List<Map<String, Object>> buildSkillProfile(User user) {
        if (user == null) {
            return List.of();
        }

        return userSkillRepository.findAll().stream()
                .filter(entry -> entry.getUser() != null && user.getId().equals(entry.getUser().getId()))
                .map(entry -> Map.<String, Object>of(
                        "skill", entry.getSkill() == null ? "Unknown" : entry.getSkill().getName(),
                        "proficiency", entry.getProficiencyLevel(),
                        "required", entry.getRequiredLevel(),
                        "gap", Math.max(0, entry.getRequiredLevel() - entry.getProficiencyLevel())
                ))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildEmployeeSkillGaps(User user, EmployeeImprovement improvement) {
        List<Map<String, Object>> gaps = new ArrayList<>();
        if (user != null) {
            for (UserSkill entry : userSkillRepository.findAll()) {
                if (entry.getUser() != null && user.getId().equals(entry.getUser().getId()) && entry.getRequiredLevel() > entry.getProficiencyLevel()) {
                    gaps.add(Map.of(
                            "skill", entry.getSkill() == null ? "Unknown" : entry.getSkill().getName(),
                            "gap", entry.getRequiredLevel() - entry.getProficiencyLevel(),
                            "status", entry.getRequiredLevel() - entry.getProficiencyLevel() >= 2 ? "critical" : "moderate"
                    ));
                }
            }
        }

        if (gaps.isEmpty() && improvement != null && improvement.getGapSummary() != null) {
            gaps.add(Map.of("skill", improvement.getGapSummary(), "gap", improvement.getOverallScore() == null ? 0 : Math.max(0, 100 - improvement.getOverallScore()), "status", "moderate"));
        }

        return gaps;
    }

    private List<Map<String, Object>> buildTeamSkillCoverage(RoleCatalogService.RoleProfile profile) {
        return List.of(
                Map.of("label", profile.displayName() + " coverage", "value", 78, "trend", "+6%"),
                Map.of("label", "Critical skills covered", "value", 61, "trend", "+4%")
        );
    }

    private List<Map<String, Object>> buildTeamSkillGaps(RoleCatalogService.RoleProfile profile) {
        return List.of(
                Map.of("department", profile.displayName(), "skill", profile.focusSkills().isEmpty() ? "Cross-functional capability" : profile.focusSkills().get(0), "gap", 32),
                Map.of("department", profile.displayName(), "skill", "Leadership support", "gap", 21)
        );
    }

    private List<Map<String, Object>> buildHighRiskGaps(RoleCatalogService.RoleProfile profile) {
        return List.of(
                Map.of("title", profile.displayName() + " high-risk gap", "impact", "Delivery risk", "severity", "High"),
                Map.of("title", "Capability bottleneck", "impact", "Program delay", "severity", "Critical")
        );
    }

    private List<Map<String, Object>> buildProgressSnapshots() {
        return List.of(
                Map.of("employee", "Alice Smith", "progress", 84, "status", "On track"),
                Map.of("employee", "Bob Jones", "progress", 67, "status", "Needs support")
        );
    }

    private List<Map<String, Object>> buildAdoptionRates() {
        return List.of(
                Map.of("program", "Leadership Essentials", "adoption", 82),
                Map.of("program", "Cloud Security Basics", "adoption", 74)
        );
    }

    private List<Map<String, Object>> buildOrganizationGapIntelligence() {
        return List.of(
                Map.of("domain", "Digital Skills", "gap", 27),
                Map.of("domain", "Leadership", "gap", 19),
                Map.of("domain", "Security", "gap", 16)
        );
    }

    private List<Map<String, Object>> buildWorkforceSkillInventory() {
        long workforceSkills = skillRepository.count();
        return List.of(Map.of("label", "Tracked skills", "value", workforceSkills), Map.of("label", "Employees", "value", userRepository.count()));
    }

    private List<Map<String, Object>> buildTrainingEffectiveness() {
        return List.of(
                Map.of("title", "Completion rate", "value", 74),
                Map.of("title", "Post-training improvement", "value", 68)
        );
    }

    private List<Map<String, Object>> buildForecasting() {
        return List.of(
                Map.of("quarter", "Q1", "risk", "Moderate"),
                Map.of("quarter", "Q2", "risk", "High")
        );
    }

    private List<Map<String, Object>> buildUserManagementSummary() {
        return List.of(
                Map.of("label", "Active users", "value", userRepository.count()),
                Map.of("label", "Roles supported", "value", RoleCatalogService.defaultRoles().size())
        );
    }

    private List<Map<String, Object>> buildTrainingCatalog() {
        return trainingProgramRepository.findAll().stream()
                .map(program -> Map.<String, Object>of(
                        "title", program.getTitle(),
                        "provider", program.getProvider(),
                        "category", program.getTargetSkillCategory(),
                        "duration", program.getDurationHours()
                ))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildLearningEffectiveness() {
        return List.of(
                Map.of("metric", "Completion", "value", 74),
                Map.of("metric", "Skill lift", "value", 64)
        );
    }

    private List<Map<String, Object>> buildCompletionTracking() {
        return List.of(
                Map.of("program", "Advanced Spring Boot Microservices", "completed", 41),
                Map.of("program", "AWS Solutions Architect Prep", "completed", 35)
        );
    }

    private List<Map<String, Object>> buildSystemMonitoring() {
        return List.of(
                Map.of("service", "Authentication", "status", "Healthy"),
                Map.of("service", "Role control", "status", "Healthy"),
                Map.of("service", "Course generation API", "status", "Healthy")
        );
    }

    private List<Map<String, Object>> buildAccessControlSummary(RoleCatalogService.RoleProfile profile) {
        return List.of(
                Map.of("label", "Role", "value", profile.displayName()),
                Map.of("label", "Permissions", "value", profile.permissions().size())
        );
    }

    private List<Map<String, Object>> buildSecuritySummary() {
        return List.of(
                Map.of("label", "JWT", "value", "Enabled"),
                Map.of("label", "API key course generation", "value", "Enabled")
        );
    }

    private List<Map<String, Object>> buildUserLifecycleSummary() {
        return List.of(
                Map.of("label", "Registered users", "value", userRepository.count()),
                Map.of("label", "Seeded demo roles", "value", RoleCatalogService.defaultRoles().size())
        );
    }

    private List<Map<String, Object>> buildGapHeatmap() {
        return List.of(
                Map.of("department", "Engineering", "React", 4, "Spring Boot", 2, "AWS", 1, "Kafka", 3),
                Map.of("department", "Marketing", "SEO", 2, "Analytics", 4, "Copywriting", 1, "Design", 2),
                Map.of("department", "Sales", "Negotiation", 1, "CRM", 2, "Lead Gen", 3, "Outreach", 1)
        );
    }

    private List<Map<String, Object>> buildDepartmentSkillCoverage() {
        return List.of(
                Map.of("department", "Engineering", "coverage", 78),
                Map.of("department", "HR", "coverage", 68),
                Map.of("department", "Marketing", "coverage", 61)
        );
    }

    private List<Map<String, Object>> buildRecentActivities() {
        return List.of(
                Map.of("message", "Alice Smith achieved Level 5 in React.js", "time", "Just now"),
                Map.of("message", "Security compliance program assigned to 450 employees", "time", "2 hours ago"),
                Map.of("message", "Department-wide assessment completed with 94% participation", "time", "Yesterday")
        );
    }

    private String buildReason(TrainingProgram program, RoleCatalogService.RoleProfile profile, String family) {
        if (program.getTitle() == null) {
            return "Role-aligned recommendation";
        }

        String title = safeLower(program.getTitle());
        if (family.equals("manager") && title.contains("lead")) {
            return "Supports team leadership responsibilities";
        }
        if (family.equals("hr") && title.contains("analytics")) {
            return "Supports workforce intelligence and reporting";
        }
        if (family.equals("learning") && title.contains("learning")) {
            return "Supports learning program administration";
        }
        if (family.equals("system") && title.contains("security")) {
            return "Supports security and access governance";
        }
        return "Matches the " + profile.displayName() + " role blueprint";
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }
}