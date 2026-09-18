package com.orgskills.intelligence.dto.session;

import com.orgskills.intelligence.entity.enums.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionResponse {
    private Long sessionId;
    private String title;
    private String description;
    private Long mentorId;
    private String mentorName;
    private Instant sessionDate;
    private Integer durationMinutes;
    private Integer capacity;
    private SessionStatus status;

    private long registeredCount;
    private int availableSeats;
    private boolean full;

    private long attendedCount;
    private long feedbackCount;

    /** Session effectiveness: mean feedback rating, or null until the first rating arrives. */
    private Double averageFeedbackRating;

    /** The attendee roster, populated only for the host mentor and L&D administrators. */
    private List<SessionRegistrationResponse> registrations;

    private Instant createdAt;
    private Instant updatedAt;
}
