package com.orgskills.intelligence.dto.mentorship;

import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorshipStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private MentorshipStatus status;
}
