package com.orgskills.intelligence.dto.mentorship;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorshipMatchRequest {
    @NotNull(message = "Mentee id is required")
    private Long menteeId;

    @NotNull(message = "Skill id is required")
    private Long skillId;
}
