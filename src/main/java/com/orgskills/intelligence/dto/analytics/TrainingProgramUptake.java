package com.orgskills.intelligence.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** How many people a course has drawn in, and how many finished it. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingProgramUptake {
    private Long trainingId;
    private String trainingTitle;
    private String provider;
    private String skillName;
    private Long enrolledCount;
    private Long completedCount;
    private Double completionRatePercent;
}
