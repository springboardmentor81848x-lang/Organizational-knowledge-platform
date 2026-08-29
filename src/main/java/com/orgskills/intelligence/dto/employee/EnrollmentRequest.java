package com.orgskills.intelligence.dto.employee;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentRequest {

    /** The course to enrol in. */
    @NotNull(message = "Training ID is required")
    private Long trainingId;

    /** Defaults to the caller. Enrolling somebody else requires a manager or L&D role. */
    private Long employeeId;

    /** Optional date the employee is expected to finish by; drives the deadline reminder. */
    private java.time.Instant targetCompletionDate;

    /** Optional; used only when the training has no milestone template of its own. */
    @Valid
    private List<MilestoneDefinitionRequest> milestones;

    public EnrollmentRequest(Long trainingId) {
        this.trainingId = trainingId;
    }
}
