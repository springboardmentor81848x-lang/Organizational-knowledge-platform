package com.orgskills.intelligence.dto.assessment;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResultResponse {
    private Long resultId;
    private Long assessmentId;
    private Long skillId;
    private String skillName;
    private ProficiencyLevel proficiency;
    /** Canonical 0-4 score of the awarded level. */
    private Integer proficiencyScore;
    private Double score;
    private ProficiencyLevel previousProficiency;
    /** New level score minus previous level score. Negative when the assessment marks a decline. */
    private Integer improvement;
}
