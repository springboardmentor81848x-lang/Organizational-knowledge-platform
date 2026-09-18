package com.orgskills.intelligence.dto.ld;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningPathRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String targetRole;
    private String targetDepartment;
    private String targetSeverity;
    private List<Long> courseIds;
}
