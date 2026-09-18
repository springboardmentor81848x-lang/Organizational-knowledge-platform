package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.gap.DepartmentGapMetricsResponse;
import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.gap.OrgGapMetricsResponse;
import com.orgskills.intelligence.dto.gap.UserGapSummaryResponse;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.GapAnalysisService;
import com.orgskills.intelligence.service.HeatmapVisualizationService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = GapAnalysisController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class GapAnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GapAnalysisService gapAnalysisService;

    @MockBean
    private HeatmapVisualizationService heatmapVisualizationService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser
    @DisplayName("GET /api/gaps/user/{userId} returns user gap analysis list")
    void testGetUserGaps() throws Exception {
        GapAnalysisResponse response = GapAnalysisResponse.builder()
                .id(1L)
                .userId(10L)
                .userName("John Doe")
                .skillId(100L)
                .skillName("Java")
                .skillCategory("Backend")
                .targetScore(5.0)
                .currentScore(2.0)
                .gapScore(3.0)
                .targetProficiency("EXPERT")
                .currentProficiency("BEGINNER")
                .isMissingSkill(false)
                .riskSeverity(RiskSeverity.CRITICAL)
                .build();

        when(gapAnalysisService.calculateAndFetchUserGaps(10L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/gaps/user/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].skillName").value("Java"))
                .andExpect(jsonPath("$[0].gapScore").value(3.0))
                .andExpect(jsonPath("$[0].riskSeverity").value("CRITICAL"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/gaps/user/{userId}/summary returns gap summary and readiness %")
    void testGetUserGapSummary() throws Exception {
        UserGapSummaryResponse summary = UserGapSummaryResponse.builder()
                .userId(10L)
                .userName("John Doe")
                .jobTitle("Software Engineer")
                .department("Engineering")
                .totalRequiredSkills(5)
                .metSkillsCount(2)
                .missingSkillsCount(2)
                .proficiencyGapsCount(1)
                .overallReadinessPercentage(60.0)
                .averageGapScore(1.4)
                .riskDistribution(Map.of("CRITICAL", 1L, "HIGH", 1L, "MEDIUM", 1L, "LOW", 2L))
                .topCriticalGaps(List.of())
                .build();

        when(gapAnalysisService.getUserGapSummary(10L)).thenReturn(summary);

        mockMvc.perform(get("/api/gaps/user/10/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(10L))
                .andExpect(jsonPath("$.overallReadinessPercentage").value(60.0))
                .andExpect(jsonPath("$.missingSkillsCount").value(2));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/gaps/user/{userId}/compare-target returns target role gaps")
    void testCompareTargetRole() throws Exception {
        GapAnalysisResponse response = GapAnalysisResponse.builder()
                .id(null)
                .userId(10L)
                .userName("John Doe")
                .skillId(200L)
                .skillName("Kubernetes")
                .targetScore(4.0)
                .currentScore(0.0)
                .gapScore(4.0)
                .isMissingSkill(true)
                .riskSeverity(RiskSeverity.CRITICAL)
                .build();

        when(gapAnalysisService.calculateAndFetchTargetRoleGaps(10L, "Lead Architect", "Engineering"))
                .thenReturn(List.of(response));

        mockMvc.perform(post("/api/gaps/user/10/compare-target")
                        .param("targetJobTitle", "Lead Architect")
                        .param("targetDepartment", "Engineering")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].skillName").value("Kubernetes"))
                .andExpect(jsonPath("$[0].isMissingSkill").value(true));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/gaps/department/{departmentName} returns department gap metrics")
    void testGetDepartmentMetrics() throws Exception {
        DepartmentGapMetricsResponse metrics = DepartmentGapMetricsResponse.builder()
                .department("Engineering")
                .employeeCount(10)
                .averageGapScore(1.5)
                .severityDistribution(Map.of("CRITICAL", 2L))
                .skillGapAverages(Map.of("Java", 1.2))
                .build();

        when(gapAnalysisService.getDepartmentMetrics("Engineering")).thenReturn(metrics);

        mockMvc.perform(get("/api/gaps/department/Engineering")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.department").value("Engineering"))
                .andExpect(jsonPath("$.employeeCount").value(10));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/gaps/org-summary returns organizational gap metrics")
    void testGetOrgGapMetrics() throws Exception {
        OrgGapMetricsResponse orgMetrics = OrgGapMetricsResponse.builder()
                .totalEmployees(50)
                .totalAnalyzedGaps(200)
                .overallAverageGapScore(1.25)
                .overallReadinessPercentage(75.0)
                .riskDistribution(Map.of("CRITICAL", 5L))
                .departmentAverageGaps(Map.of("Engineering", 1.5))
                .topMissingSkills(List.of())
                .build();

        when(gapAnalysisService.getOrgGapMetrics()).thenReturn(orgMetrics);

        mockMvc.perform(get("/api/gaps/org-summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEmployees").value(50))
                .andExpect(jsonPath("$.overallReadinessPercentage").value(75.0));
    }
}
