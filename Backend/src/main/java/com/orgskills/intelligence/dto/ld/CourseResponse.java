package com.orgskills.intelligence.dto.ld;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String provider;
    private Long skillId;
    private String skillName;
    private String difficulty;
    private Double durationHours;
    private Boolean isInternal;
    private String externalUrl;
    private Instant createdAt;
}
