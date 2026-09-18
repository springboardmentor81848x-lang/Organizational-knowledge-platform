package com.orgskills.intelligence.dto.assessment;

import com.orgskills.intelligence.entity.enums.AssessmentScope;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Whether the signed-in employee may sit the target-role assessment right now, and why.
 *
 * <p>The client asks for this before it fetches a question paper. The same rule is enforced
 * again when the paper is issued and when answers are submitted — this exists so the screen can
 * explain the position and offer the request, not so the lock can be trusted to the browser.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentAttemptStatusResponse {

    /**
     * Whether this account is measured at all.
     *
     * <p>False for the accounts that run the platform rather than work in the business - a
     * system, HR or L&amp;D administrator. They are told so, rather than being shown a locked
     * assessment as though they had spent an attempt they never had.
     */
    private boolean developmentTrack;

    /** Which paper is on offer: the full target-role one, a new-skills one, or none. */
    private AssessmentScope scope;

    /** Skills on this profile that no assessment has ever put a level against. */
    private int pendingSkillCount;

    /** Completed target-role assessments already on record for this employee. */
    private int attemptsTaken;

    private Instant lastAttemptAt;

    /** True on the first attempt, and afterwards only while an approval is unspent. */
    private boolean canTake;

    /** True when the only way forward is to ask an approver. */
    private boolean requestRequired;

    /** A sentence the screen can show as-is. */
    private String message;

    /** The employee's most recent request, whatever state it is in. Null if they never asked. */
    private ReattemptRequestResponse latestRequest;

    /** The approval that would be spent by taking the assessment now, if there is one. */
    private ReattemptRequestResponse activeApproval;
}
