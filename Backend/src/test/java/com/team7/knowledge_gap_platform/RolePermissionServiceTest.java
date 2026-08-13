package com.team7.knowledge_gap_platform;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.team7.knowledge_gap_platform.service.RolePermissionService;

@SpringBootTest
class RolePermissionServiceTest {

    @Autowired
    private RolePermissionService rolePermissionService;

    @BeforeEach
    void setUp() {
        assertNotNull(rolePermissionService);
    }

    @Test
    void testGetAllRoles() {
        Set<String> roles = rolePermissionService.getAllRoles();
        assertNotNull(roles);
        assertEquals(7, roles.size());
        assertTrue(roles.contains("EMPLOYEE"));
        assertTrue(roles.contains("MANAGER"));
        assertTrue(roles.contains("HR"));
        assertTrue(roles.contains("ADMIN"));
        assertTrue(roles.contains("DEPARTMENT_HEAD"));
        assertTrue(roles.contains("LEARNING_DEVELOPMENT_ADMIN"));
        assertTrue(roles.contains("MENTOR"));
    }

    @Test
    void testEmployeePermissions() {
        Set<String> permissions = rolePermissionService.getPermissionsForRole("EMPLOYEE");
        assertNotNull(permissions);
        assertTrue(permissions.contains("view_own_skill_gaps"));
        assertTrue(permissions.contains("view_own_learning_paths"));
        assertTrue(permissions.contains("view_own_recommendations"));
        assertTrue(permissions.contains("participate_mentorship"));
        assertEquals(4, permissions.size());
    }

    @Test
    void testManagerPermissions() {
        Set<String> permissions = rolePermissionService.getPermissionsForRole("MANAGER");
        assertNotNull(permissions);
        assertTrue(permissions.contains("view_own_skill_gaps"));
        assertTrue(permissions.contains("view_department_skill_coverage"));
        assertTrue(permissions.contains("view_department_skill_gaps"));
        assertTrue(permissions.contains("monitor_learning_progress"));
        assertTrue(permissions.contains("access_department_dashboard"));
        assertTrue(permissions.size() > 5);
    }

    @Test
    void testHRPermissions() {
        Set<String> permissions = rolePermissionService.getPermissionsForRole("HR");
        assertNotNull(permissions);
        assertTrue(permissions.contains("manage_training_programs"));
        assertTrue(permissions.contains("manage_learning_paths"));
        assertTrue(permissions.contains("manage_external_courses"));
        assertTrue(permissions.contains("manage_roles"));
        assertTrue(permissions.size() > 10);
    }

    @Test
    void testAdminPermissions() {
        Set<String> permissions = rolePermissionService.getPermissionsForRole("ADMIN");
        assertNotNull(permissions);
        assertTrue(permissions.contains("manage_system_settings"));
        assertTrue(permissions.contains("manage_roles"));
        assertTrue(permissions.size() >= 19);
    }

    @Test
    void testDepartmentHeadPermissions() {
        Set<String> permissions = rolePermissionService.getPermissionsForRole("DEPARTMENT_HEAD");
        assertNotNull(permissions);
        assertTrue(permissions.contains("view_department_skill_coverage"));
        assertTrue(permissions.contains("view_department_skill_gaps"));
        assertTrue(permissions.contains("monitor_learning_progress"));
        assertTrue(permissions.contains("access_department_dashboard"));
        assertTrue(permissions.contains("view_employee_progress"));
        assertFalse(permissions.contains("manage_training_programs"));
    }

    @Test
    void testLearningDevelopmentAdminPermissions() {
        Set<String> permissions = rolePermissionService.getPermissionsForRole("LEARNING_DEVELOPMENT_ADMIN");
        assertNotNull(permissions);
        assertTrue(permissions.contains("manage_training_programs"));
        assertTrue(permissions.contains("manage_learning_paths"));
        assertTrue(permissions.contains("configure_recommendations"));
        assertTrue(permissions.contains("manage_external_courses"));
        assertTrue(permissions.contains("track_learning_effectiveness"));
        assertTrue(permissions.contains("manage_certifications"));
    }

    @Test
    void testMentorPermissions() {
        Set<String> permissions = rolePermissionService.getPermissionsForRole("MENTOR");
        assertNotNull(permissions);
        assertTrue(permissions.contains("participate_mentorship"));
        assertTrue(permissions.contains("view_mentees"));
        assertTrue(permissions.contains("support_mentee_learning"));
        assertTrue(permissions.contains("track_mentorship_progress"));
        assertTrue(permissions.contains("monitor_learning_progress"));
    }

    @Test
    void testHasPermission() {
        assertTrue(rolePermissionService.hasPermission("EMPLOYEE", "view_own_skill_gaps"));
        assertFalse(rolePermissionService.hasPermission("EMPLOYEE", "manage_training_programs"));
        
        assertTrue(rolePermissionService.hasPermission("LEARNING_DEVELOPMENT_ADMIN", "manage_training_programs"));
        assertTrue(rolePermissionService.hasPermission("MENTOR", "support_mentee_learning"));
    }

    @Test
    void testCanAccessOrganizationalData() {
        assertFalse(rolePermissionService.canAccessOrganizationalData("EMPLOYEE"));
        assertTrue(rolePermissionService.canAccessOrganizationalData("MANAGER"));
        assertTrue(rolePermissionService.canAccessOrganizationalData("HR"));
        assertTrue(rolePermissionService.canAccessOrganizationalData("ADMIN"));
        assertTrue(rolePermissionService.canAccessOrganizationalData("DEPARTMENT_HEAD"));
        assertFalse(rolePermissionService.canAccessOrganizationalData("LEARNING_DEVELOPMENT_ADMIN"));
        assertFalse(rolePermissionService.canAccessOrganizationalData("MENTOR"));
    }

    @Test
    void testCanManageTraining() {
        assertFalse(rolePermissionService.canManageTraining("EMPLOYEE"));
        assertFalse(rolePermissionService.canManageTraining("MANAGER"));
        assertTrue(rolePermissionService.canManageTraining("HR"));
        assertTrue(rolePermissionService.canManageTraining("ADMIN"));
        assertTrue(rolePermissionService.canManageTraining("LEARNING_DEVELOPMENT_ADMIN"));
        assertFalse(rolePermissionService.canManageTraining("MENTOR"));
    }

    @Test
    void testCanAccessDepartmentDashboard() {
        assertFalse(rolePermissionService.canAccessDepartmentDashboard("EMPLOYEE"));
        assertTrue(rolePermissionService.canAccessDepartmentDashboard("MANAGER"));
        assertTrue(rolePermissionService.canAccessDepartmentDashboard("HR"));
        assertTrue(rolePermissionService.canAccessDepartmentDashboard("ADMIN"));
        assertTrue(rolePermissionService.canAccessDepartmentDashboard("DEPARTMENT_HEAD"));
        assertFalse(rolePermissionService.canAccessDepartmentDashboard("LEARNING_DEVELOPMENT_ADMIN"));
        assertFalse(rolePermissionService.canAccessDepartmentDashboard("MENTOR"));
    }

    @Test
    void testGetRoleDescription() {
        String employeeDesc = rolePermissionService.getRoleDescription("EMPLOYEE");
        assertNotNull(employeeDesc);
        assertTrue(employeeDesc.contains("employee"));

        String deptHeadDesc = rolePermissionService.getRoleDescription("DEPARTMENT_HEAD");
        assertNotNull(deptHeadDesc);
        assertTrue(deptHeadDesc.contains("Department"));

        String ldAdminDesc = rolePermissionService.getRoleDescription("LEARNING_DEVELOPMENT_ADMIN");
        assertNotNull(ldAdminDesc);
        assertTrue(ldAdminDesc.contains("L&D") || ldAdminDesc.contains("Learning"));

        String mentorDesc = rolePermissionService.getRoleDescription("MENTOR");
        assertNotNull(mentorDesc);
        assertTrue(mentorDesc.contains("Mentor"));
    }

    @Test
    void testNullRoleHandling() {
        Set<String> permissions = rolePermissionService.getPermissionsForRole(null);
        assertNotNull(permissions);
        assertTrue(permissions.isEmpty());
    }

    @Test
    void testInvalidRoleHandling() {
        Set<String> permissions = rolePermissionService.getPermissionsForRole("INVALID_ROLE");
        assertNotNull(permissions);
        assertTrue(permissions.isEmpty());
    }
}
