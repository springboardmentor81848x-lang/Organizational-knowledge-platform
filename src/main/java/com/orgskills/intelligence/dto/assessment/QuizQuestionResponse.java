package com.orgskills.intelligence.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * One question as the candidate sees it.
 *
 * <p>There is deliberately no field for the correct answer or the explanation. Marking happens
 * on the server, and a quiz whose payload carried its own answer key could be passed by reading
 * the network tab. Both are returned afterwards, on {@link QuizGradedAnswer}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionResponse {

    private Long questionId;

    private Long skillId;

    private String skillName;

    private String questionText;

    /** The four choices in order; the first is answered as "A". */
    private List<String> options;

    /** The level this question demonstrates, shown so the candidate can see it is graded. */
    private String difficulty;
}
