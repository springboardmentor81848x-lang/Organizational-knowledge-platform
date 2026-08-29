package com.orgskills.intelligence.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** A knowledge-sharing session the employee is registered for and that has not happened yet. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpcomingSessionSummary {
    private Long sessionId;
    private String title;
    private String mentorName;
    private Instant sessionDate;
    private Integer durationMinutes;
}
