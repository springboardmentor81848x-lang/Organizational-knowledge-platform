package com.orgskills.intelligence.dto.assessment;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The level awarded for one skill. Supply the level either by name ({@code proficiency}) or by
 * its canonical score ({@code proficiencyScore}, 0-4); the service rejects a request that gives
 * neither, gives both inconsistently, or gives a score outside the scale.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResultRequest {

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    private ProficiencyLevel proficiency;

    private Integer proficiencyScore;

    /** Optional raw mark out of 100 backing the awarded level. */
    @DecimalMin(value = "0", message = "Score cannot be negative")
    @DecimalMax(value = "100", message = "Score cannot exceed 100")
    private Double score;

    public AssessmentResultRequest(Long skillId, ProficiencyLevel proficiency) {
        this.skillId = skillId;
        this.proficiency = proficiency;
    }
}
