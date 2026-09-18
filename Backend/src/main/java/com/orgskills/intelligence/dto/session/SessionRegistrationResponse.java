package com.orgskills.intelligence.dto.session;

import com.orgskills.intelligence.entity.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionRegistrationResponse {
    private Long registrationId;
    private Long sessionId;
    private String sessionTitle;
    private Long employeeId;
    private String employeeName;
    private AttendanceStatus attendanceStatus;
    private Integer feedbackRating;
    private String feedbackText;
    private Instant registeredAt;
    private Instant feedbackSubmittedAt;
}
