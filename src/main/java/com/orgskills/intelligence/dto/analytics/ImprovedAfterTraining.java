package com.orgskills.intelligence.dto.analytics;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * An employee whose assessed level for a skill rose <em>after</em> they finished a course
 * covering it. The ordering matters: the assessment must post-date the course completion, or
 * the improvement is not evidence that the training did anything.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImprovedAfterTraining {
    private Long employeeId;
    private String employeeName;
    private Long skillId;
    private String skillName;
    private Long trainingId;
    private String trainingTitle;
    private Instant trainingCompletedAt;
    private ProficiencyLevel previousProficiency;
    private ProficiencyLevel currentProficiency;
    private Integer improvement;
    private Instant assessedAt;
}
