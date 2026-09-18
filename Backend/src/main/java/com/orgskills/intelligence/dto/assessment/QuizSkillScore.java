package com.orgskills.intelligence.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * What the candidate scored on one skill, and the level that earned them.
 *
 * <p>This is the bridge between the quiz and the rest of the platform: the awarded proficiency
 * is written onto the employee's skill record, which is what the gap analysis and heatmap are
 * then recalculated from.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSkillScore {

    private Long skillId;

    private String skillName;

    private Integer questionsAsked;

    private Integer questionsCorrect;

    /** Weighted percentage, 0-100. Harder questions carry more weight - see QuizService. */
    private Double scorePercentage;

    private String awardedProficiency;

    private String previousProficiency;

    /** Levels gained or lost against the previous record. Negative when the level dropped. */
    private Integer improvement;
}
