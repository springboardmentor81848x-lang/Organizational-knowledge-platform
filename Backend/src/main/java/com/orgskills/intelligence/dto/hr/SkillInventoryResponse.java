package com.orgskills.intelligence.dto.hr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillInventoryResponse {
    private Long skillId;
    private String skillName;
    private String category;
    private Integer headcount;
    private Double averageProficiency;
    private String averageProficiencyLabel;
}
