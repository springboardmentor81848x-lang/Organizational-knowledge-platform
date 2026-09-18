package com.orgskills.intelligence.dto.manager;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillCoverageResponse {
    private Long skillId;
    private String skillName;
    private String category;
    private Integer employeeCount;
    private Double averageProficiency;
    private String proficiencyLabel;
}
