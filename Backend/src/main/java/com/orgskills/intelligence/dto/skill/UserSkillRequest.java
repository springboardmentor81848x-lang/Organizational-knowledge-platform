package com.orgskills.intelligence.dto.skill;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Adding a skill to somebody's profile.
 *
 * <p>Only the skill is meaningful. The two level fields remain so that clients written against
 * the old contract still parse, but they are read by nothing: a proficiency level colours the
 * gap heatmap and sizes every gap under it, so it is awarded by a marked assessment and never
 * taken from the request that claims it. A skill added here starts unassessed, and the employee
 * is offered an assessment covering it.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSkillRequest {
    @NotNull(message = "Skill ID is required")
    private Long skillId;

    /** @deprecated Ignored. The level comes from an assessment; see the class note. */
    @Deprecated
    private ProficiencyLevel proficiencyLevel;

    /** @deprecated Ignored. The level comes from an assessment; see the class note. */
    @Deprecated
    private Double ratingScore;
}
