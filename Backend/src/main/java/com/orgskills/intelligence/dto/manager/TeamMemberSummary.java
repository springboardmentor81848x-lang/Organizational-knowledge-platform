package com.orgskills.intelligence.dto.manager;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMemberSummary {
    private Long id;
    private String fullName;
    private String email;
    private String jobTitle;
    private String department;
    private Double avgSkillScore;
    private Integer gapCount;
    private Double trainingProgressPercent;
    private Instant lastAssessmentDate;
}
