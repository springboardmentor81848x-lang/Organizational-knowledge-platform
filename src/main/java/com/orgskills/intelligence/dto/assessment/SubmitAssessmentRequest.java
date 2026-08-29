package com.orgskills.intelligence.dto.assessment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Submits one or more results against a pending assessment. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAssessmentRequest {

    @NotEmpty(message = "At least one assessment result is required")
    @Valid
    private List<AssessmentResultRequest> results;

    private String comments;
}
