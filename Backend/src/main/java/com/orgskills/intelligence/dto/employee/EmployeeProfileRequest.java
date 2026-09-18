package com.orgskills.intelligence.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeProfileRequest {
    private String bio;
    private String department;
    private String jobRole;
    private String workExperience;
    private String education;
}
