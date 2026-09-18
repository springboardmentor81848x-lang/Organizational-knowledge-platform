package com.orgskills.intelligence.dto.ld;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningPathResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long targetSkillId;
    private String targetSkillName;
    private String title;
    private String description;
    private String targetRole;
    private String targetDepartment;
    private String targetSeverity;
    private Integer totalEstimatedHours;
    private String estimatedCalendarTime;
    private String status;
    private Integer overallProgressPercent;
    private LocalDateTime generatedAt;
    private Boolean noCoursesAvailable;
    private List<LearningPathStepResponse> steps;
    private List<CourseResponse> courses;
}
