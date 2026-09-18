package com.orgskills.intelligence.dto.employee;

import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentResponse {
    private Long enrollmentId;
    private Long employeeId;
    private String employeeName;
    private Long trainingId;
    private String trainingTitle;
    private String provider;
    private EnrollmentStatus status;
    /** Overall completion of the course, 0-100. */
    private Double progress;
    private Instant startDate;
    private Instant completionDate;
    private List<LearningMilestoneResponse> milestones;
}
