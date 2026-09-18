package com.orgskills.intelligence.dto.mentorship;

import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorshipMatchResponse {
    private Long id;
    private Long menteeId;
    private String menteeName;
    private Long mentorId;
    private String mentorName;
    private Long skillId;
    private String skillName;
    private MentorshipStatus status;
    private Instant createdAt;
}
