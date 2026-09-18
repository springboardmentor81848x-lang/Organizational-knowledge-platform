package com.orgskills.intelligence.dto.mentorship;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * A ranked mentor suggestion. Skill proficiency is read from the existing
 * user_skills data rather than stored on the mentorship side.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendedMentorResponse {
    private Long mentorId;
    private String mentorName;
    private String mentorEmail;
    private String department;
    private String jobTitle;
    private Long skillId;
    private String skillName;
    private ProficiencyLevel mentorProficiency;
    private Double mentorRatingScore;
    private ProficiencyLevel menteeProficiency;
    private boolean sameDepartment;
    private boolean available;
    private long activeMentorships;
    private long completedMentorships;
    private double matchScore;
    private List<String> reasons;
}
