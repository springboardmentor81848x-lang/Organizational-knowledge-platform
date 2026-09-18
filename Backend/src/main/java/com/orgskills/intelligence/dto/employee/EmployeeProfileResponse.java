package com.orgskills.intelligence.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeProfileResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String bio;
    private String department;
    private String jobRole;
    private String workExperience;
    private String education;
    private Instant updatedAt;
}
