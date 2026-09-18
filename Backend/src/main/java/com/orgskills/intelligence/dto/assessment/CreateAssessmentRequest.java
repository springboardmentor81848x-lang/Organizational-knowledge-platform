package com.orgskills.intelligence.dto.assessment;

import com.orgskills.intelligence.entity.enums.AssessmentType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/** Schedules an assessment and declares which skills it will cover. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssessmentRequest {

    /** Defaults to the caller, which is the normal case for a SELF assessment. */
    private Long employeeId;

    @NotNull(message = "Assessment type is required")
    private AssessmentType assessmentType;

    @NotEmpty(message = "At least one skill must be assessed")
    private List<Long> skillIds;

    /** Defaults to now when the assessment is being carried out immediately. */
    private Instant date;

    private String comments;
}
