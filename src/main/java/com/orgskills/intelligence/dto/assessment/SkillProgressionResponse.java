package com.orgskills.intelligence.dto.assessment;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** Before/after view of one skill, built from that skill's two most recent assessments. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillProgressionResponse {
    private Long skillId;
    private String skillName;
    private ProficiencyLevel previousProficiency;
    private Integer previousScore;
    private Instant previousAssessedAt;
    private ProficiencyLevel currentProficiency;
    private Integer currentScore;
    private Instant currentAssessedAt;
    /** Current score minus previous score; zero when there is only one assessment on record. */
    private Integer improvement;
    private Integer assessmentCount;
}
