package com.orgskills.intelligence.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** A generated quiz: the questions for every skill the candidate's target role is measured on. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResponse {

    /** The role the quiz was built for, echoed so the screen can name what is being assessed. */
    private String targetJobTitle;

    private String targetDepartment;

    private Integer skillCount;

    private Integer questionCount;

    private List<QuizQuestionResponse> questions;
}
