package com.orgskills.intelligence.dto.manager;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GapHeatmapResponse {
    private String scope; // e.g. "TEAM" or "DEPARTMENT" or "ORG"
    private String scopeName;
    private Integer totalEmployees;
    private List<GapHeatmapCell> cells;
    private Instant generatedAt;
}
