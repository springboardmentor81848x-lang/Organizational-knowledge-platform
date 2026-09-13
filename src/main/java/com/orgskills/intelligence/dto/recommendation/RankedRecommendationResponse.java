package com.orgskills.intelligence.dto.recommendation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One scored course recommendation, flattened for the wire.
 *
 * <p>{@link CourseRecommendationScore} carries the {@code Course} and {@code Skill} entities
 * themselves because the services that consume it need the whole objects. Those entities are
 * lazily loaded, so serialising them directly hands Jackson a Hibernate proxy rather than a
 * course, and the request fails with a type error instead of an answer. This is the shape that
 * leaves the application: plain fields, resolved inside the transaction that loaded them.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankedRecommendationResponse {

    private Long courseId;
    private String courseTitle;
    private String courseProvider;
    private String difficulty;
    private Double durationHours;
    private Boolean internal;
    private String externalUrl;

    private Long skillId;
    private String skillName;
    private String skillCategory;

    /** Final weighted score, 0-100. */
    private double score;

    /** Human-readable explanation of how the score was reached. */
    private String scoreBreakdown;
}
