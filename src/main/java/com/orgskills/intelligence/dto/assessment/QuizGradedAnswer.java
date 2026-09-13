package com.orgskills.intelligence.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One marked question, returned after submission so the candidate can learn from it. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizGradedAnswer {

    private Long questionId;

    private Long skillId;

    private String skillName;

    private String questionText;

    private String selectedOption;

    private String correctOption;

    private Boolean correct;

    private String difficulty;

    private String explanation;
}
