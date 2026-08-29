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

    /**
     * Employees with at least one open skill gap, and so eligible for development. Distinct from
     * headcount: somebody already meeting every requirement of their role has nothing to enrol in.
     */
    private Long eligibleEmployees;

    /** Distinct employees with at least one enrolment, and with at least one completed. */
    private Long employeesEnrolled;
    private Long employeesCompleted;
    private Long totalEnrollments;
    private Long completedEnrollments;

    private Double trainingCompletionRatePercent;
    private Double averageLearningProgressPercent;

    /** Mean level movement across assessments submitted for this department, on the 0-4 scale. */
    private Double averageSkillImprovement;

    private Long criticalSkillGapCount;

    /** The skill that shows up as a gap for the most people in the department. */
    private SkillGapFrequency topGapBySkill;

    private Instant generatedAt;
}
