package com.orgskills.intelligence.dto.assistant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A catalogue course the assistant points at, carrying enough to render and open it. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuggestedCourse {
    private Long id;
    private String title;
    private String provider;
    private String skillName;
    private String difficulty;
    private String durationLabel;
    private Boolean internal;
    private String externalUrl;
    private Double relevanceScore;
}
