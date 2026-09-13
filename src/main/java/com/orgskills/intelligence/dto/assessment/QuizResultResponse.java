package com.orgskills.intelligence.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * The outcome of a submitted quiz.
 *
 * <p>Carries the assessment id because the quiz is recorded as a real self-assessment: the same
 * rows any other assessment produces, so the gap analysis, heatmap, recommendations and learning
 * paths all recalculate from it without knowing a quiz was involved.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultResponse {

    private Long assessmentId;

    private String targetJobTitle;

    private String targetDepartment;

    private Integer totalQuestions;

    private Integer totalCorrect;

    private Double overallScorePercentage;

    /** Per-skill outcome; this is what the gap analysis is recalculated from. */
    private List<QuizSkillScore> skillScores;

    /** Every question with its correct answer and explanation, for review. */
    private List<QuizGradedAnswer> gradedAnswers;
}
