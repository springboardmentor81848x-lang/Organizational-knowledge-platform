package com.orgskills.intelligence.dto.employee;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Updates the overall course percentage, one milestone's completion, or both. At least one of
 * the two must be supplied; the service rejects an empty body.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProgressRequest {

    @Min(value = 0, message = "Progress cannot be negative")
    @Max(value = 100, message = "Progress cannot exceed 100")
    private Double progress;

    private Long milestoneId;

    @Min(value = 0, message = "Milestone completion percentage cannot be negative")
    @Max(value = 100, message = "Milestone completion percentage cannot exceed 100")
    private Double completionPercentage;

    public UpdateProgressRequest(Double progress) {
        this.progress = progress;
    }
}
