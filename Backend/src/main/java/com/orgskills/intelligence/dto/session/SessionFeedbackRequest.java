package com.orgskills.intelligence.dto.session;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionFeedbackRequest {

    @NotNull(message = "Feedback rating is required")
    @Min(value = 1, message = "Feedback rating must be between 1 and 5")
    @Max(value = 5, message = "Feedback rating must be between 1 and 5")
    private Integer rating;

    @Size(max = 2000, message = "Feedback text must not exceed 2000 characters")
    private String feedbackText;
}
