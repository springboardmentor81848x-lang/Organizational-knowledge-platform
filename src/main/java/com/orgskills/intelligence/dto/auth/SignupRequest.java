package com.orgskills.intelligence.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Self-service sign-up.
 *
 * <p>Distinct from {@link RegisterRequest}, which is the administrative path and lets the caller
 * name any role. Anybody can reach this one, so it deliberately has no role field: everyone who
 * signs up themselves becomes an employee, and promoting an account stays an administrator's
 * decision. Accepting a role here would let a stranger create their own system administrator.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequest {

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    /**
     * The role the person is working towards. Their assessments and gaps are measured against
     * this profile rather than their current job title, so it is required at sign-up: without it
     * a new employee has nothing to be assessed against and their dashboard has nothing to show.
     */
    @NotBlank(message = "Target role is required")
    private String targetJobTitle;

    @NotBlank(message = "Target department is required")
    private String targetDepartment;
}
