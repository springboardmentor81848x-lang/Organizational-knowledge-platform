package com.orgskills.intelligence.dto.employee;

import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningMilestoneResponse {
    private Long milestoneId;
    private Long trainingId;
    private String title;
    private Integer sequence;
    private Double completionPercentage;
    /** Derived from completionPercentage, using the shared training-status vocabulary. */
    private EnrollmentStatus status;
}
