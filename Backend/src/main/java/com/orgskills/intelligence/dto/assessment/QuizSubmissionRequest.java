package com.orgskills.intelligence.dto.assessment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionRequest {

    @NotEmpty(message = "At least one answer is required")
    @Valid
    private List<QuizAnswerRequest> answers;
}
