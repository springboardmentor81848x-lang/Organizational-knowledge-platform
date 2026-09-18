package com.orgskills.intelligence.dto.role;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleCompetencyResponse {
    private Long id;
    private String jobTitle;
    private String department;
    private Long skillId;
    private String skillName;
    private ProficiencyLevel requiredProficiencyLevel;
}
