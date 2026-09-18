package com.orgskills.intelligence.dto.ld;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningPathStepResponse {
    private Long id;
    private Long learningPathId;
    private Long courseId;
    private String courseTitle;
    private String courseDescription;
    private String provider;
    private String externalUrl;
    private Boolean isInternal;
    private Integer stepOrder;
    private String difficultyStage;
    private Integer estimatedHours;
    private String status;
    private LocalDateTime completedAt;
}
