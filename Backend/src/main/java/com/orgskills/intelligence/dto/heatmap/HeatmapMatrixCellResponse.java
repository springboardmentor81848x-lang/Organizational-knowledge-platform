package com.orgskills.intelligence.dto.heatmap;

import com.orgskills.intelligence.entity.enums.RiskSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeatmapMatrixCellResponse {
    private Long userId;
    private String userName;
    private String department;
    private String jobTitle;

    private Long skillId;
    private String skillName;
    private String category;

    private Double currentProficiency; // 0.0 to 5.0
    private String currentProficiencyLabel; // e.g. "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", "UNAWARE"
    private Double targetProficiency;  // 0.0 to 5.0
    private String targetProficiencyLabel;
    private Double gapScore;

    private String skillLevel;  // "HIGH", "MEDIUM", "LOW"
    private RiskSeverity gapSeverity; // LOW, MEDIUM, HIGH, CRITICAL
    private String colorCode;   // Hex color for chart rendering (e.g. #22c55e, #f59e0b, #ef4444)

    private boolean missingSkill;
}
