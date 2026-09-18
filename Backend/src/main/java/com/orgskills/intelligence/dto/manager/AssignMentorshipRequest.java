package com.orgskills.intelligence.dto.manager;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignMentorshipRequest {

    @NotNull(message = "Mentor user ID is required")
    private Long mentorId;

    @NotNull(message = "Target skill ID is required")
    private Long targetSkillId;
}
