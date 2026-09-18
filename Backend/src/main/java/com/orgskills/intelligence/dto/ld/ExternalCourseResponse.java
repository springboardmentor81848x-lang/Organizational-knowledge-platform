package com.orgskills.intelligence.dto.ld;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalCourseResponse {
    private Long id;
    private String title;
    private String description;
    private boolean descriptionMissing;
    private String provider;
    private Long skillId;
    private String skillName;
    private String difficulty;
    private String durationLabel;
    private Double durationHours;
    private boolean durationMissing;
    private String externalUrl;
    private boolean urlMissing;
    private Boolean isInternal;
    private Instant createdAt;
}
