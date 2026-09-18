package com.orgskills.intelligence.dto.ld;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Provider is required")
    private String provider;

    private Long skillId;
    private String difficulty;
    private Double durationHours;
    private Boolean isInternal;
    private String externalUrl;
}
