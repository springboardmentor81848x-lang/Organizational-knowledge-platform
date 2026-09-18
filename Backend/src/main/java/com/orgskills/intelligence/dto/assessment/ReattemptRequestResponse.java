package com.orgskills.intelligence.dto.assessment;

import com.orgskills.intelligence.entity.enums.ReattemptRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** One request for another attempt at the target-role assessment, as both sides see it. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReattemptRequestResponse {
    private Long requestId;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String employeeJobTitle;
    private String employeeDepartment;
    private ReattemptRequestStatus status;
    private String reason;
    /** Attempts already taken when the request was raised, so an approver can see the pattern. */
    private Integer attemptsAtRequest;
    private Instant createdAt;
    private Long decidedById;
    private String decidedByName;
    private String decisionNote;
    private Instant decidedAt;
    /** When the approval was spent. Null on an approval still good for one attempt. */
    private Instant consumedAt;
}
