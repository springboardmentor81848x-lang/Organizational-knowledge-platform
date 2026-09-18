package com.orgskills.intelligence.dto.mentorship;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorshipResponse {
    private Long mentorshipId;
    private Long mentorId;
    private String mentorName;
    private Long menteeId;
    private String menteeName;
    private Long skillId;
    private String skillName;
    private String goal;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    private MentorshipStatus status;
    private Instant createdAt;
}
