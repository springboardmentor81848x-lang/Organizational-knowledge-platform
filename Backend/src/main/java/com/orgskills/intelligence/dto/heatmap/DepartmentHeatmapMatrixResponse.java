package com.orgskills.intelligence.dto.heatmap;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentHeatmapMatrixResponse {
    private Integer totalDepartments;
    private Integer totalSkills;

    private List<String> departments;
    private List<HeatmapMatrixResponse.SkillHeader> skills;
    private List<DepartmentSkillCell> matrix;

    private Map<String, Long> levelCounts;
    private Map<String, String> colorLegend;

    private Instant generatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentSkillCell {
        private String department;
        private Long skillId;
        private String skillName;
        private String category;
        private Double avgProficiency;
        private String avgProficiencyLabel;
        private Double avgGapScore;
        private String skillLevel; // "HIGH", "MEDIUM", "LOW"
        private String colorCode;  // Hex color code
        private Long employeeCount;
    }
}
