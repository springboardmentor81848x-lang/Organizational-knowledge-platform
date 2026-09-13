package com.orgskills.intelligence.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * One sign-up awaiting, or having received, a decision.
 *
 * <p>Carries no password or token — only what an approver needs to judge whether this person
 * belongs in the organisation, plus the decision once one has been made.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessRequestResponse {
    private Long id;
    private String fullName;
    private String email;
    private String department;
    private String jobTitle;
    private String targetJobTitle;
    private String targetDepartment;
    private String status;
    private String decidedByName;
    private Instant decidedAt;
    private String decisionNote;
    /** Whether the caller is allowed to decide this one, so the UI can show or hide the buttons. */
    private boolean decidableByCaller;
}
