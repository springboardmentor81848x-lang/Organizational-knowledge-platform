package com.orgskills.intelligence.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentAnalyticsResponse {
    private String department;
    private Integer totalEmployees;

    /** Distinct employees with at least one enrolment, and with at least one completed. */
    private Long employeesEnrolled;
    private Long employeesCompleted;
    private Long totalEnrollments;
    private Long completedEnrollments;

    private Double averageLearningProgressPercent;
    private Long criticalSkillGapCount;

    /** The skill that shows up as a gap for the most people in the department. */
    private SkillGapFrequency topGapBySkill;

    private Instant generatedAt;
}
