package com.orgskills.intelligence.dto.ld;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseParticipationResponse {
    private Long courseId;
    private String courseTitle;
    private Integer totalEnrolled;
    private Integer activeInProgress;
    private Integer completedCount;
    private Double completionRatePercent;
    /** Finished enrolments that recorded both a start and a completion date to measure. */
    private Integer measuredCompletions;

    /** Mean days from starting to finishing. Null until at least one enrolment has finished. */
    private Double avgDaysToComplete;
}
