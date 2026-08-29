package com.orgskills.intelligence.dto.analytics;

import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** One recently awarded level, with the movement it represented. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentAssessmentResultSummary {
    private Long assessmentId;
    private AssessmentType assessmentType;
    private Long skillId;
    private String skillName;
    private ProficiencyLevel previousProficiency;
    private ProficiencyLevel proficiency;
    private Integer improvement;
    private Instant assessedAt;
}
