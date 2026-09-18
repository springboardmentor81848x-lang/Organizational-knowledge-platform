package com.orgskills.intelligence.dto.gap;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentGapMetricsResponse {
    private String department;
    private long employeeCount;
    private double averageGapScore;
    private Map<String, Long> severityDistribution;
    private Map<String, Double> skillGapAverages;
}
