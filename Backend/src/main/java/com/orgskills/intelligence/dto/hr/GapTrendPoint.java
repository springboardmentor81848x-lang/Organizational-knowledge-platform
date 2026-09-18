package com.orgskills.intelligence.dto.hr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GapTrendPoint {
    private LocalDate snapshotDate;
    private String department;
    private Integer totalGaps;
    private Integer criticalGapsCount;
    private Integer highGapsCount;
    private Integer mediumGapsCount;
    private Integer lowGapsCount;
    private Double avgGapScore;
}
