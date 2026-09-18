package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.heatmap.DepartmentHeatmapMatrixResponse;
import com.orgskills.intelligence.dto.heatmap.HeatmapMatrixResponse;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HeatmapVisualizationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSkillRepository userSkillRepository;

    @Mock
    private RoleCompetencyRepository roleCompetencyRepository;

    @Mock
    private GapAnalysisRepository gapAnalysisRepository;

    @Mock
    private GapAnalysisService gapAnalysisService;

    @InjectMocks
    private HeatmapVisualizationService heatmapVisualizationService;

    private User sampleUser;
    private Skill javaSkill;
    private Skill awsSkill;
    private GapAnalysis gap1;
    private GapAnalysis gap2;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("alice@company.com");
        sampleUser.setFullName("Alice Smith");
        sampleUser.setRole(Role.EMPLOYEE);
        sampleUser.setDepartment("Engineering");
        sampleUser.setJobTitle("Backend Developer");

        javaSkill = new Skill();
        javaSkill.setId(101L);
        javaSkill.setName("Java");
        javaSkill.setCategory("Technical");

        awsSkill = new Skill();
        awsSkill.setId(102L);
        awsSkill.setName("AWS");
        awsSkill.setCategory("Cloud");

        gap1 = new GapAnalysis();
        gap1.setId(10L);
        gap1.setUser(sampleUser);
        gap1.setSkill(javaSkill);
        gap1.setCurrentScore(4.0);
        gap1.setTargetScore(4.0);
        gap1.setGapScore(0.0);
        gap1.setRiskSeverity(RiskSeverity.LOW);

        gap2 = new GapAnalysis();
        gap2.setId(11L);
        gap2.setUser(sampleUser);
        gap2.setSkill(awsSkill);
        gap2.setCurrentScore(1.0);
        gap2.setTargetScore(4.0);
        gap2.setGapScore(3.0);
        gap2.setRiskSeverity(RiskSeverity.CRITICAL);
    }

    @Test
    @DisplayName("Should build heatmap matrix with correct HIGH and LOW skill levels and color codes")
    void shouldBuildHeatmapMatrixCorrectly() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));
        when(gapAnalysisRepository.findByUserIdIn(List.of(1L))).thenReturn(List.of(gap1, gap2));

        HeatmapMatrixResponse response = heatmapVisualizationService.getHeatmapMatrix(null, null);

        assertThat(response).isNotNull();
        assertThat(response.getScope()).isEqualTo("ORG");
        assertThat(response.getMatrix()).hasSize(2);

        var cell1 = response.getMatrix().stream().filter(c -> c.getSkillId().equals(101L)).findFirst().orElseThrow();
        assertThat(cell1.getSkillLevel()).isEqualTo(HeatmapVisualizationService.LEVEL_HIGH);
        assertThat(cell1.getColorCode()).isEqualTo(HeatmapVisualizationService.COLOR_HIGH);

        var cell2 = response.getMatrix().stream().filter(c -> c.getSkillId().equals(102L)).findFirst().orElseThrow();
        assertThat(cell2.getSkillLevel()).isEqualTo(HeatmapVisualizationService.LEVEL_LOW);
        assertThat(cell2.getColorCode()).isEqualTo(HeatmapVisualizationService.COLOR_LOW);

        assertThat(response.getLevelCounts().get(HeatmapVisualizationService.LEVEL_HIGH)).isEqualTo(1L);
        assertThat(response.getLevelCounts().get(HeatmapVisualizationService.LEVEL_LOW)).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should build department heatmap matrix correctly")
    void shouldBuildDepartmentHeatmapMatrix() {
        when(gapAnalysisRepository.findAll()).thenReturn(List.of(gap1, gap2));

        DepartmentHeatmapMatrixResponse response = heatmapVisualizationService.getDepartmentHeatmapMatrix();

        assertThat(response).isNotNull();
        assertThat(response.getDepartments()).contains("Engineering");
        assertThat(response.getMatrix()).hasSize(2);
    }

    @Test
    @DisplayName("Should return correct summary metrics")
    void shouldReturnSummaryMetrics() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));
        when(gapAnalysisRepository.findByUserIdIn(List.of(1L))).thenReturn(List.of(gap1, gap2));

        Map<String, Object> summary = heatmapVisualizationService.getHeatmapSummaryMetrics();

        assertThat(summary).isNotNull();
        assertThat(summary.get("totalAssessedGaps")).isEqualTo(2L);
        assertThat(summary).containsKey("levelPercentages");
    }

    @Test
    @DisplayName("Should evaluate skill levels correctly")
    void shouldEvaluateSkillLevelsCorrectly() {
        assertThat(heatmapVisualizationService.determineSkillLevel(4.5, 0.0))
                .isEqualTo(HeatmapVisualizationService.LEVEL_HIGH);
        assertThat(heatmapVisualizationService.determineSkillLevel(3.0, 1.0))
                .isEqualTo(HeatmapVisualizationService.LEVEL_MEDIUM);
        assertThat(heatmapVisualizationService.determineSkillLevel(1.0, 3.0))
                .isEqualTo(HeatmapVisualizationService.LEVEL_LOW);
    }
}
