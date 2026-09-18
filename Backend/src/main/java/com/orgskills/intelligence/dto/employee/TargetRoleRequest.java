package com.orgskills.intelligence.dto.employee;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The role an employee is working towards.
 *
 * <p>Both halves are required because a competency profile is keyed by job title <em>and</em>
 * department: "Software Engineer" alone does not identify one, and the same title can be
 * measured on quite different skills in two departments.
 *
 * <p>Not free text. The service refuses a pair with no competency profile behind it, because a
 * target nobody has defined skills for produces an account whose assessment has no questions
 * and whose gap analysis has nothing to measure against.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TargetRoleRequest {

    @NotBlank(message = "A target job title is required")
    private String jobTitle;

    @NotBlank(message = "A target department is required")
    private String department;
}
