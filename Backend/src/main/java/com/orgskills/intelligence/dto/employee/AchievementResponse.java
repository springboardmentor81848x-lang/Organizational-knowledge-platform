package com.orgskills.intelligence.dto.employee;

import com.orgskills.intelligence.entity.enums.AchievementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchievementResponse {
    private Long id;
    private Long employeeId;
    private AchievementType type;
    private String title;
    private String description;
    private Instant earnedAt;
}
