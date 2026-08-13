package com.team7.knowledge_gap_platform.service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Service;

/**
 * Service providing role-to-permission mapping and authorization logic
 * for the seven supported roles in the organization knowledge gap platform.
 */
@Service
public class RolePermissionService {

    private static final String EMPLOYEE = "EMPLOYEE";
    private static final String MANAGER = "MANAGER";
    private static final String HR = "HR";
    private static final String ADMIN = "ADMIN";
    private static final String DEPARTMENT_HEAD = "DEPARTMENT_HEAD";
    private static final String LEARNING_DEVELOPMENT_ADMIN = "LEARNING_DEVELOPMENT_ADMIN";
    private static final String MENTOR = "MENTOR";

    // Permission constants
    private static final String VIEW_OWN_GAPS = "view_own_skill_gaps";
    private static final String VIEW_OWN_LEARNING = "view_own_learning_paths";
    private static final String VIEW_OWN_RECOMMENDATIONS = "view_own_recommendations";
    private static final String VIEW_DEPT_COVERAGE = "view_department_skill_coverage";
    private static final String VIEW_DEPT_GAPS = "view_department_skill_gaps";
    private static final String VIEW_TRAINING_ADOPTION = "view_training_adoption";
    private static final String VIEW_EMPLOYEE_PROGRESS = "view_employee_progress";
    private static final String MONITOR_LEARNING = "monitor_learning_progress";
    private static final String SUPPORT_INTERVENTIONS = "support_learning_interventions";
    private static final String ACCESS_DEPT_DASHBOARD = "access_department_dashboard";
    private static final String MANAGE_TRAINING_PROGRAMS = "manage_training_programs";
    private static final String MANAGE_LEARNING_PATHS = "manage_learning_paths";
    private static final String CONFIGURE_RECOMMENDATIONS = "configure_recommendations";
    private static final String MANAGE_EXTERNAL_COURSES = "manage_external_courses";
    private static final String TRACK_LEARNING_EFFECTIVENESS = "track_learning_effectiveness";
    private static final String MANAGE_CERTIFICATIONS = "manage_certifications";
    private static final String PARTICIPATE_MENTORSHIP = "participate_mentorship";
    private static final String VIEW_MENTEES = "view_mentees";
    private static final String SUPPORT_MENTEE_LEARNING = "support_mentee_learning";
    private static final String TRACK_MENTORSHIP = "track_mentorship_progress";
    private static final String MANAGE_ROLES = "manage_user_roles";
    private static final String MANAGE_SYSTEM = "manage_system_settings";

    /**
     * Get all permissions for a given role.
     */
    public Set<String> getPermissionsForRole(String role) {
        if (role == null) {
            return new HashSet<>();
        }

        return switch (role) {
            case EMPLOYEE -> getEmployeePermissions();
            case MANAGER -> getManagerPermissions();
            case HR -> getHRPermissions();
            case ADMIN -> getAdminPermissions();
            case DEPARTMENT_HEAD -> getDepartmentHeadPermissions();
            case LEARNING_DEVELOPMENT_ADMIN -> getLearningDevelopmentAdminPermissions();
            case MENTOR -> getMentorPermissions();
            default -> new HashSet<>();
        };
    }

    /**
     * Check if a role has permission to perform an action.
     */
    public boolean hasPermission(String role, String permission) {
        Set<String> permissions = getPermissionsForRole(role);
        return permissions.contains(permission);
    }

    /**
     * Check if a role can access organizational data.
     */
    public boolean canAccessOrganizationalData(String role) {
        return Arrays.asList(MANAGER, HR, ADMIN, DEPARTMENT_HEAD).contains(role);
    }

    /**
     * Check if a role can manage training and external courses.
     */
    public boolean canManageTraining(String role) {
        return Arrays.asList(HR, ADMIN, LEARNING_DEVELOPMENT_ADMIN).contains(role);
    }

    /**
     * Check if a role can access department-level dashboards.
     */
    public boolean canAccessDepartmentDashboard(String role) {
        return Arrays.asList(MANAGER, HR, ADMIN, DEPARTMENT_HEAD).contains(role);
    }

    private Set<String> getEmployeePermissions() {
        return new HashSet<>(Arrays.asList(
                VIEW_OWN_GAPS,
                VIEW_OWN_LEARNING,
                VIEW_OWN_RECOMMENDATIONS,
                PARTICIPATE_MENTORSHIP
        ));
    }

    private Set<String> getManagerPermissions() {
        return new HashSet<>(Arrays.asList(
                VIEW_OWN_GAPS,
                VIEW_OWN_LEARNING,
                VIEW_OWN_RECOMMENDATIONS,
                VIEW_DEPT_COVERAGE,
                VIEW_DEPT_GAPS,
                VIEW_TRAINING_ADOPTION,
                VIEW_EMPLOYEE_PROGRESS,
                MONITOR_LEARNING,
                SUPPORT_INTERVENTIONS,
                ACCESS_DEPT_DASHBOARD,
                PARTICIPATE_MENTORSHIP
        ));
    }

    private Set<String> getHRPermissions() {
        return new HashSet<>(Arrays.asList(
                VIEW_OWN_GAPS,
                VIEW_OWN_LEARNING,
                VIEW_OWN_RECOMMENDATIONS,
                VIEW_DEPT_COVERAGE,
                VIEW_DEPT_GAPS,
                VIEW_TRAINING_ADOPTION,
                VIEW_EMPLOYEE_PROGRESS,
                MONITOR_LEARNING,
                SUPPORT_INTERVENTIONS,
                ACCESS_DEPT_DASHBOARD,
                MANAGE_TRAINING_PROGRAMS,
                MANAGE_LEARNING_PATHS,
                CONFIGURE_RECOMMENDATIONS,
                MANAGE_EXTERNAL_COURSES,
                TRACK_LEARNING_EFFECTIVENESS,
                MANAGE_CERTIFICATIONS,
                MANAGE_ROLES,
                PARTICIPATE_MENTORSHIP
        ));
    }

    private Set<String> getAdminPermissions() {
        return new HashSet<>(Arrays.asList(
                VIEW_OWN_GAPS,
                VIEW_OWN_LEARNING,
                VIEW_OWN_RECOMMENDATIONS,
                VIEW_DEPT_COVERAGE,
                VIEW_DEPT_GAPS,
                VIEW_TRAINING_ADOPTION,
                VIEW_EMPLOYEE_PROGRESS,
                MONITOR_LEARNING,
                SUPPORT_INTERVENTIONS,
                ACCESS_DEPT_DASHBOARD,
                MANAGE_TRAINING_PROGRAMS,
                MANAGE_LEARNING_PATHS,
                CONFIGURE_RECOMMENDATIONS,
                MANAGE_EXTERNAL_COURSES,
                TRACK_LEARNING_EFFECTIVENESS,
                MANAGE_CERTIFICATIONS,
                MANAGE_ROLES,
                MANAGE_SYSTEM,
                PARTICIPATE_MENTORSHIP
        ));
    }

    private Set<String> getDepartmentHeadPermissions() {
        return new HashSet<>(Arrays.asList(
                VIEW_OWN_GAPS,
                VIEW_OWN_LEARNING,
                VIEW_OWN_RECOMMENDATIONS,
                VIEW_DEPT_COVERAGE,
                VIEW_DEPT_GAPS,
                VIEW_TRAINING_ADOPTION,
                VIEW_EMPLOYEE_PROGRESS,
                MONITOR_LEARNING,
                SUPPORT_INTERVENTIONS,
                ACCESS_DEPT_DASHBOARD,
                PARTICIPATE_MENTORSHIP
        ));
    }

    private Set<String> getLearningDevelopmentAdminPermissions() {
        return new HashSet<>(Arrays.asList(
                VIEW_OWN_GAPS,
                VIEW_OWN_LEARNING,
                VIEW_OWN_RECOMMENDATIONS,
                MANAGE_TRAINING_PROGRAMS,
                MANAGE_LEARNING_PATHS,
                CONFIGURE_RECOMMENDATIONS,
                MANAGE_EXTERNAL_COURSES,
                TRACK_LEARNING_EFFECTIVENESS,
                MANAGE_CERTIFICATIONS,
                VIEW_TRAINING_ADOPTION,
                MONITOR_LEARNING,
                PARTICIPATE_MENTORSHIP
        ));
    }

    private Set<String> getMentorPermissions() {
        return new HashSet<>(Arrays.asList(
                VIEW_OWN_GAPS,
                VIEW_OWN_LEARNING,
                VIEW_OWN_RECOMMENDATIONS,
                PARTICIPATE_MENTORSHIP,
                VIEW_MENTEES,
                SUPPORT_MENTEE_LEARNING,
                TRACK_MENTORSHIP,
                MONITOR_LEARNING
        ));
    }

    /**
     * Get role description for UI display.
     */
    public String getRoleDescription(String role) {
        return switch (role) {
            case EMPLOYEE -> "Regular employee with access to own skill gaps and learning paths";
            case MANAGER -> "Manager with team oversight and department-level analytics";
            case HR -> "HR specialist managing organization-wide training and competencies";
            case ADMIN -> "System administrator with full platform access";
            case DEPARTMENT_HEAD -> "Department head overseeing team skill gaps and learning progress";
            case LEARNING_DEVELOPMENT_ADMIN -> "L&D administrator managing training programs and learning paths";
            case MENTOR -> "Mentor providing guidance and supporting employee learning";
            default -> "Unknown role";
        };
    }

    /**
     * Get all available roles.
     */
    public Set<String> getAllRoles() {
        return new HashSet<>(Arrays.asList(
                EMPLOYEE,
                MANAGER,
                HR,
                ADMIN,
                DEPARTMENT_HEAD,
                LEARNING_DEVELOPMENT_ADMIN,
                MENTOR
        ));
    }
}
