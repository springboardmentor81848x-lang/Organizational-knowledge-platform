package com.orgskills.intelligence.dto.recommendation;

import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRecommendationScore {
    private Course course;
    private Skill skill;
    private double score;              // final weighted score, 0-100
    private String scoreBreakdown;     // human-readable explanation of how the score was calculated
}
