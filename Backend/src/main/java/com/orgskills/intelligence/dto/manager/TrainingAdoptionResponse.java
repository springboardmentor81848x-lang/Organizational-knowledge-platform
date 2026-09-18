package com.orgskills.intelligence.dto.manager;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingAdoptionResponse {
    private Integer totalMembers;
    private Integer activeEnrolledMembers;
    private Integer completedMembers;
    private Double adoptionRatePercent;
    private Double completionRatePercent;
    private Double avgProgressPercent;
}
