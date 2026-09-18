package com.orgskills.intelligence.dto.ld;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalCourseDTO {
    private String title;
    private String description;
    private String provider;
    private String durationLabel;
    private Integer durationHours;
    private String url;
    private String difficulty;
    private String skill;
}
