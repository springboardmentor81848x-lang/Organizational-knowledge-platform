package com.orgskills.intelligence.dto.role;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleCompetencyRequest {
    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotNull(message = "Required proficiency level is required")
    private ProficiencyLevel requiredProficiencyLevel;
}
