package com.orgskills.intelligence.dto.expert;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One entry in the expert directory. Assembled from the existing UserSkill, User and Skill
 * rows plus mentorship and session-feedback history; nothing here is stored separately.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpertResponse {
    private Long employeeId;
    private String fullName;
    private String email;
    private String department;
    private String jobTitle;

    private Long skillId;
    private String skillName;
    private ProficiencyLevel proficiencyLevel;
    private Double ratingScore;

    /** Mean attendee rating across the knowledge-sharing sessions this employee hosted. */
    private Double mentorRating;

    /** How many feedback entries the mentor rating is based on. */
    private long mentorRatingCount;

    /** Completed mentorships in which this employee acted as the mentor. */
    private long completedMentorships;
}
