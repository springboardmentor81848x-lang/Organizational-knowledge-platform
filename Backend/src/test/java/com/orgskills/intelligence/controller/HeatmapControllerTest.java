package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.heatmap.DepartmentHeatmapMatrixResponse;
import com.orgskills.intelligence.dto.heatmap.HeatmapMatrixResponse;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.HeatmapVisualizationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = HeatmapController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class HeatmapControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
    @DisplayName("GET /api/heatmap/matrix returns HeatmapMatrixResponse")
    void testGetHeatmapMatrix() throws Exception {
        HeatmapMatrixResponse response = HeatmapMatrixResponse.builder()
                .scope("ORG")
                .scopeName("All Departments")
                .totalUsers(1)
                .totalSkills(1)
                .skills(List.of())
                .users(List.of())
                .matrix(List.of())
                .levelCounts(Map.of("HIGH", 1L, "MEDIUM", 0L, "LOW", 0L))
                .colorLegend(Map.of("HIGH", "#22c55e", "MEDIUM", "#f59e0b", "LOW", "#ef4444"))
                .generatedAt(Instant.now())
                .build();

        when(heatmapVisualizationService.getHeatmapMatrix(null, null)).thenReturn(response);

        mockMvc.perform(get("/api/heatmap/matrix"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scope").value("ORG"))
                .andExpect(jsonPath("$.totalUsers").value(1))
                .andExpect(jsonPath("$.colorLegend.HIGH").value("#22c55e"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/heatmap/department-matrix returns DepartmentHeatmapMatrixResponse")
    void testGetDepartmentHeatmapMatrix() throws Exception {
        DepartmentHeatmapMatrixResponse response = DepartmentHeatmapMatrixResponse.builder()
                .totalDepartments(1)
                .totalSkills(1)
                .departments(List.of("Engineering"))
                .skills(List.of())
                .matrix(List.of())
                .levelCounts(Map.of("HIGH", 1L, "MEDIUM", 0L, "LOW", 0L))
                .colorLegend(Map.of("HIGH", "#22c55e", "MEDIUM", "#f59e0b", "LOW", "#ef4444"))
                .generatedAt(Instant.now())
                .build();

        when(heatmapVisualizationService.getDepartmentHeatmapMatrix()).thenReturn(response);

        mockMvc.perform(get("/api/heatmap/department-matrix"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDepartments").value(1))
                .andExpect(jsonPath("$.departments[0]").value("Engineering"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/heatmap/summary returns heatmap summary map")
    void testGetHeatmapSummary() throws Exception {
        Map<String, Object> summary = Map.of(
                "totalAssessedGaps", 10L,
                "totalUsers", 2,
                "totalSkills", 5,
                "levelCounts", Map.of("HIGH", 5L, "MEDIUM", 3L, "LOW", 2L)
        );

        when(heatmapVisualizationService.getHeatmapSummaryMetrics()).thenReturn(summary);

        mockMvc.perform(get("/api/heatmap/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssessedGaps").value(10))
                .andExpect(jsonPath("$.totalUsers").value(2));
    }
}
