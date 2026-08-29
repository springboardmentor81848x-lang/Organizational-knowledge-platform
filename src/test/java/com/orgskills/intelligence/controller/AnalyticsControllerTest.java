package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.analytics.DepartmentAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.EmployeeAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.ImprovedAfterTraining;
import com.orgskills.intelligence.dto.analytics.OrganizationAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.SkillGapFrequency;
import com.orgskills.intelligence.dto.analytics.TeamAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.TrainingProgramUptake;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.AnalyticsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AnalyticsController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("GET /api/analytics/employee/{id} returns the employee dashboard")
    void employeeAnalytics() throws Exception {
        when(analyticsService.getEmployeeAnalytics(1L, 1L)).thenReturn(EmployeeAnalyticsResponse.builder()
                .employeeId(1L)
                .fullName("Alice Johnson")
                .department("Engineering")
                .learningProgressPercent(62.5)
                .activeEnrollments(2L)
                .completedEnrollments(1L)
                .generatedAt(Instant.now())
                .build());

        mockMvc.perform(get("/api/analytics/employee/1").principal(principal(1L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(1))
                .andExpect(jsonPath("$.learningProgressPercent").value(62.5))
                .andExpect(jsonPath("$.activeEnrollments").value(2))
                .andExpect(jsonPath("$.generatedAt").exists());
    }

    @Test
    @DisplayName("GET /api/analytics/employee/{id} surfaces an out-of-scope read as 401")
    void employeeAnalyticsScoped() throws Exception {
        when(analyticsService.getEmployeeAnalytics(2L, 9L))
                .thenThrow(new UnauthorizedException("Access denied. Cara Diaz is not in your reporting line."));

        mockMvc.perform(get("/api/analytics/employee/9").principal(principal(2L)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/analytics/team/{managerId} returns alerts, snapshots and top programs")
    void teamAnalytics() throws Exception {
        when(analyticsService.getTeamAnalytics(2L, 2L)).thenReturn(TeamAnalyticsResponse.builder()
                .managerId(2L)
                .managerName("Bob Smith")
                .teamSize(4)
                .highRiskGapAlerts(List.of())
                .improvedAfterTraining(List.of(ImprovedAfterTraining.builder()
                        .employeeId(1L)
                        .employeeName("Alice Johnson")
                        .skillName("Spring Boot")
                        .trainingTitle("Mastering Spring Boot 3")
                        .previousProficiency(ProficiencyLevel.BEGINNER)
                        .currentProficiency(ProficiencyLevel.ADVANCED)
                        .improvement(2)
                        .build()))
                .topTrainingPrograms(List.of(TrainingProgramUptake.builder()
                        .trainingId(10L)
                        .trainingTitle("Mastering Spring Boot 3")
                        .enrolledCount(4L)
                        .completedCount(2L)
                        .completionRatePercent(50.0)
                        .build()))
                .generatedAt(Instant.now())
                .build());

        mockMvc.perform(get("/api/analytics/team/2").principal(principal(2L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamSize").value(4))
                .andExpect(jsonPath("$.improvedAfterTraining[0].improvement").value(2))
                .andExpect(jsonPath("$.improvedAfterTraining[0].currentProficiency").value("ADVANCED"))
                .andExpect(jsonPath("$.topTrainingPrograms[0].enrolledCount").value(4));
    }

    @Test
    @DisplayName("GET /api/analytics/department/{deptId} passes the department name through")
    void departmentAnalytics() throws Exception {
        when(analyticsService.getDepartmentAnalytics(3L, "Engineering"))
                .thenReturn(DepartmentAnalyticsResponse.builder()
                        .department("Engineering")
                        .totalEmployees(12)
                        .totalEnrollments(20L)
                        .completedEnrollments(8L)
                        .averageLearningProgressPercent(47.25)
                        .criticalSkillGapCount(5L)
                        .topGapBySkill(SkillGapFrequency.builder()
                                .skillId(10L)
                                .skillName("Kubernetes")
                                .affectedEmployees(7L)
                                .averageGapScore(2.4)
                                .build())
                        .generatedAt(Instant.now())
                        .build());

        mockMvc.perform(get("/api/analytics/department/Engineering").principal(principal(3L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.department").value("Engineering"))
                .andExpect(jsonPath("$.totalEmployees").value(12))
                .andExpect(jsonPath("$.criticalSkillGapCount").value(5))
                .andExpect(jsonPath("$.topGapBySkill.skillName").value("Kubernetes"));

        verify(analyticsService).getDepartmentAnalytics(3L, "Engineering");
    }

    @Test
    @DisplayName("GET /api/analytics/department/{deptId} reports an unknown department as 404")
    void departmentAnalyticsUnknown() throws Exception {
        when(analyticsService.getDepartmentAnalytics(3L, "Nowhere"))
                .thenThrow(new ResourceNotFoundException("No employees found in department: Nowhere"));

        mockMvc.perform(get("/api/analytics/department/Nowhere").principal(principal(3L)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/analytics/organization returns org-wide intelligence")
    void organizationAnalytics() throws Exception {
        when(analyticsService.getOrganizationAnalytics(4L)).thenReturn(OrganizationAnalyticsResponse.builder()
                .totalEmployees(120L)
                .totalEnrollments(300L)
                .completedEnrollments(180L)
                .trainingCompletionRatePercent(60.0)
                .averageSkillImprovement(1.35)
                .totalAssessmentResults(240L)
                .activeMentorshipCount(14L)
                .workforceSkillInventory(List.of())
                .generatedAt(Instant.now())
                .build());

        mockMvc.perform(get("/api/analytics/organization").principal(principal(4L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEmployees").value(120))
                .andExpect(jsonPath("$.trainingCompletionRatePercent").value(60.0))
                .andExpect(jsonPath("$.averageSkillImprovement").value(1.35))
                .andExpect(jsonPath("$.activeMentorshipCount").value(14));
    }

    @Test
    @DisplayName("GET /api/analytics/organization surfaces a refused role as 401")
    void organizationAnalyticsRequiresRole() throws Exception {
        when(analyticsService.getOrganizationAnalytics(1L))
                .thenThrow(new UnauthorizedException("Organization-wide analytics require an HR, L&D or admin role"));

        mockMvc.perform(get("/api/analytics/organization").principal(principal(1L)))
                .andExpect(status().isUnauthorized());
    }

    private Authentication principal(Long userId) {
        CustomPrincipal customPrincipal = new CustomPrincipal(userId, "user@orgskills.com", "",
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
        return new UsernamePasswordAuthenticationToken(customPrincipal, null, customPrincipal.getAuthorities());
    }
}
