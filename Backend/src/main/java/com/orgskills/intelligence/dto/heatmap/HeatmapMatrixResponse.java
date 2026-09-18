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
public class HeatmapMatrixResponse {
    private String scope; // "ORG", "DEPARTMENT", "TEAM", "USER"
    private String scopeName;
    private Integer totalUsers;
    private Integer totalSkills;

    private List<SkillHeader> skills;
    private List<UserHeader> users;
    private List<HeatmapMatrixCellResponse> matrix;

    private Map<String, Long> levelCounts; // "HIGH" -> count, "MEDIUM" -> count, "LOW" -> count
    private Map<String, String> colorLegend; // "HIGH" -> "#22c55e", "MEDIUM" -> "#f59e0b", "LOW" -> "#ef4444"

    private Instant generatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SkillHeader {
        private Long skillId;
        private String skillName;
        private String category;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserHeader {
        private Long userId;
        private String userName;
        private String department;
        private String jobTitle;
    }
}
