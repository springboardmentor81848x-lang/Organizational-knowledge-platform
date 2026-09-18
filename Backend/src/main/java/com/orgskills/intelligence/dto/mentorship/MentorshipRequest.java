package com.orgskills.intelligence.dto.mentorship;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorshipRequest {

    @NotNull(message = "Mentee id is required")
    private Long menteeId;

    @NotNull(message = "Mentor id is required")
    private Long mentorId;

    @NotNull(message = "Skill id is required")
    private Long skillId;

    @Size(max = 2000, message = "Goal must not exceed 2000 characters")
    private String goal;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate endDate;
}
