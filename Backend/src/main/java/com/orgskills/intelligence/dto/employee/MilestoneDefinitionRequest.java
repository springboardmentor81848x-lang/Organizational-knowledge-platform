package com.orgskills.intelligence.dto.employee;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One sub-step of a course supplied at enrolment time, for trainings that have no milestone
 * template defined yet.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneDefinitionRequest {

    @NotBlank(message = "Milestone title is required")
    private String title;

    @NotNull(message = "Milestone sequence is required")
    private Integer sequence;
}
