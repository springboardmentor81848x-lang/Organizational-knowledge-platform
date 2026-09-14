package com.infosys.knowledgeplatform.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class RoleCatalogService {

    public record RoleProfile(
            String displayName,
            String roleKey,
            String family,
            String audience,
            List<String> permissions,
            List<String> focusSkills,
            List<String> dashboardModules,
            List<String> responsibilities,
            List<String> accessibleRoutes
    ) {}

    private static final Map<String, RoleProfile> PROFILES = Map.of(
            normalizeRole("Employee"), new RoleProfile(
                    "Employee",
                    normalizeRole("Employee"),
                    "employee",
                    "Individual contributor",
                    List.of(
                            "view_self_dashboard",
                            "maintain_profile",
                            "self_assessment",
                            "peer_assessment",
                            "view_proficiency",
                            "view_skill_gaps",
                            "view_learning_paths",
                            "enroll_training",
                            "track_training_progress",
                            "view_achievements",
                            "manage_certifications",
                            "mentorship",
                            "notifications"
                    ),
                    List.of("Role mastery", "Gap closure", "Learning agility", "Mentorship"),
                    List.of("Personal skill profile", "Skill gaps", "Learning recommendations", "Achievements", "Certifications"),
                    List.of("Maintain profile", "Perform self-assessment", "Join peer assessment", "Enroll in learning", "Track growth"),
                    List.of("/app", "/app/skills", "/app/gap-analysis", "/app/trainings", "/app/mentorship", "/app/exam")
            ),
            normalizeRole("Team Lead / Manager"), new RoleProfile(
                    "Team Lead / Manager",
                    normalizeRole("Team Lead / Manager"),
                    "manager",
                    "People leader",
                    List.of(
                            "view_self_dashboard",
                            "view_team_skill_coverage",
                            "identify_team_skill_gaps",
                            "identify_high_risk_gaps",
                            "monitor_employee_progress",
                            "monitor_training_adoption",
                            "track_team_learning",
                            "view_individual_progress",
                            "recommend_interventions",
                            "view_reports"
                    ),
                    List.of("Coaching", "Team coverage", "Risk management", "Adoption tracking"),
                    List.of("Team Gap Heatmap", "Department Skill Coverage", "Training Adoption Rates", "High-Risk Skill Gap Alerts", "Individual Progress Snapshots"),
                    List.of("View team skill coverage", "Identify gaps", "Support interventions", "Track learning progress", "Monitor adoption"),
                    List.of("/app", "/app/analytics", "/app/trainings", "/app/mentorship", "/app/exam")
            ),
            normalizeRole("HR Specialist"), new RoleProfile(
                    "HR Specialist",
                    normalizeRole("HR Specialist"),
                    "hr",
                    "Workforce strategist",
                    List.of(
                            "organization_gap_intelligence",
                            "workforce_skill_inventory",
                            "training_effectiveness",
                            "strategic_skill_forecasting",
                            "user_management",
                            "report_management",
                            "security_overview"
                    ),
                    List.of("Workforce analytics", "Forecasting", "Policy compliance", "Reporting"),
                    List.of("Organization-wide gap intelligence", "Workforce skill inventory", "Training effectiveness", "Strategic skill forecasting", "User management", "Reports management"),
                    List.of("Monitor workforce skill health", "Manage users", "Review reporting", "Track training outcomes"),
                    List.of("/app", "/app/analytics", "/app/admin", "/app/trainings")
            ),
            normalizeRole("Department Head"), new RoleProfile(
                    "Department Head",
                    normalizeRole("Department Head"),
                    "depthead",
                    "Department leader",
                    List.of(
                            "view_team_skill_coverage",
                            "identify_team_skill_gaps",
                            "identify_high_risk_gaps",
                            "monitor_employee_progress",
                            "monitor_training_adoption",
                            "track_team_learning",
                            "view_individual_progress",
                            "recommend_interventions",
                            "department_planning",
                            "approve_knowledge",
                            "set_learning_priorities",
                            "review_team_reports",
                            "identify_critical_skills"
                    ),
                    List.of("Strategic planning", "Capability coverage", "Learning priorities", "Operational risk", "Team governance"),
                    List.of("Department Statistics", "Knowledge Gap Matrix", "Team Comparison Analytics", "Training Analytics", "Critical Skill Gap Priorities", "Knowledge Approval Workflow", "Team Leader Reports"),
                    List.of("View department-level employees & teams", "Analyze department-wide knowledge gaps", "Approve important department knowledge", "Set department learning priorities", "Review Team Leader reports", "Monitor department training progress", "Identify critical skills required by department"),
                    List.of("/app", "/app/analytics", "/app/trainings", "/app/mentorship", "/app/articles")
            ),
            normalizeRole("Learning & Development Admin/mentor"), new RoleProfile(
                    "Learning & Development Admin/mentor",
                    normalizeRole("Learning & Development Admin/mentor"),
                    "learning",
                    "Learning strategist",
                    List.of(
                            "training_catalog_management",
                            "personalized_learning_paths",
                            "training_recommendations",
                            "recommendation_scoring",
                            "adaptive_recommendations",
                            "monitor_participation",
                            "track_completion",
                            "learning_effectiveness",
                            "mentorship_support"
                    ),
                    List.of("Learning paths", "Catalog curation", "Recommendation scoring", "Completion tracking"),
                    List.of("Personalized learning paths", "Training recommendations", "Internal training catalog", "External resource links", "Recommendation scoring", "Adaptive recommendations"),
                    List.of("Manage training catalog", "Guide learning paths", "Track completion", "Monitor effectiveness", "Support mentorship"),
                    List.of("/app", "/app/trainings", "/app/mentorship", "/app/admin")
            ),
            normalizeRole("System Administrator"), new RoleProfile(
                    "System Administrator",
                    normalizeRole("System Administrator"),
                    "system",
                    "Platform operator",
                    List.of(
                            "authentication",
                            "role_management",
                            "user_management",
                            "system_monitoring",
                            "security",
                            "access_control"
                    ),
                    List.of("Identity governance", "Access control", "Monitoring", "Security"),
                    List.of("Authentication", "Role management", "User management", "System monitoring", "Security", "JWT/OAuth2", "Access control"),
                    List.of("Manage system access", "Review security posture", "Monitor platform health", "Handle identity and role lifecycle"),
                    List.of("/app", "/app/admin", "/app/analytics")
            )
    );

    private static final Map<String, String> FAMILY_BY_ROLE = Map.of(
            normalizeRole("Employee"), "employee",
            normalizeRole("Team Lead / Manager"), "manager",
            normalizeRole("HR Specialist"), "hr",
            normalizeRole("Department Head"), "depthead",
            normalizeRole("Learning & Development Admin/mentor"), "learning",
            normalizeRole("System Administrator"), "system"
    );

    public RoleProfile getProfile(String role) {
        return PROFILES.getOrDefault(normalizeRole(role), PROFILES.get(normalizeRole("Employee")));
    }

    public String getFamily(String role) {
        return FAMILY_BY_ROLE.getOrDefault(normalizeRole(role), "employee");
    }

    public boolean hasPermission(String role, String permission) {
        return getProfile(role).permissions().contains(permission);
    }

    public boolean isElevated(String role) {
        return !"employee".equals(getFamily(role));
    }

    public static String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "EMPLOYEE";
        }

        return role.toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("^_+", "")
                .replaceAll("_+$", "");
    }

    public static Set<String> toRouteSet(RoleProfile profile) {
        return Set.copyOf(profile.accessibleRoutes());
    }

    public static List<String> defaultRoles() {
        return Arrays.asList(
                "Employee",
                "Team Lead / Manager",
                "HR Specialist",
                "Department Head",
                "Learning & Development Admin/mentor",
                "System Administrator"
        );
    }
}