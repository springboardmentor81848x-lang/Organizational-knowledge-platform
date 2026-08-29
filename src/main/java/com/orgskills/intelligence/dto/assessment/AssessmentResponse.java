package com.orgskills.intelligence.dto.assessment;

import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResponse {
    private Long assessmentId;
    private Long employeeId;
    private String employeeName;
    private Long assessorId;
    private String assessorName;
    private AssessmentType assessmentType;
    private AssessmentStatus status;
    private Instant date;
    private Instant submittedAt;
    private String comments;
    private List<AssessmentResultResponse> results;
}
