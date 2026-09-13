package com.orgskills.intelligence.dto.skill;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSkillResponse {
    private Long id;
    private Long userId;
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private ProficiencyLevel proficiencyLevel;
    private Double ratingScore;

    /**
     * True until a marked assessment has awarded this skill a level.
     *
     * <p>An unassessed skill still carries UNAWARE rather than null, because every gap, heatmap
     * cell and analytics figure downstream reads the level and a null would have to be handled
     * at each of them. This flag is what lets a screen tell "measured at UNAWARE" apart from
     * "added, not measured yet" - two very different things to show somebody.
     */
    private boolean awaitingAssessment;
}
