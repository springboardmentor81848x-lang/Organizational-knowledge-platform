package com.orgskills.intelligence.dto.hr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
/**
 * How a course has actually performed.
 *
 * <p>The three level figures are null, and {@code measuredCount} zero, until at least one
 * learner has finished the course and been assessed on the skill it covers afterwards. A course
 * that has not been measured and a course that achieved nothing are different findings, so no
 * placeholder stands in for the missing measurement.
 */
public class TrainingEffectivenessResponse {
    private Long courseId;
    private String courseTitle;
    private String provider;
    private String skillName;
    private Integer enrolledCount;
    private Integer completedCount;
    private Double completionRatePercent;
    /** Finished enrolments with an assessment of the covered skill afterwards to compare. */
    private Integer measuredCount;

    /** Mean level held going into the post-course assessment, on the canonical 0-4 scale. */
    private Double avgPreCourseSkillLevel;
    private Double avgPostCourseSkillLevel;
    private Double avgSkillImprovement;
}
