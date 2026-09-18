package com.orgskills.intelligence.dto.manager;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GapHeatmapCell {
    private Long skillId;
    private String skillName;
    private String category;
    private Long lowCount;
    private Long mediumCount;
    private Long highCount;
    private Long criticalCount;
    private Long totalGaps;
    private Double avgGapScore;
}
