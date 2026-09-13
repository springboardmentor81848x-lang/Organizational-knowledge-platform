package com.orgskills.intelligence.entity.enums;

/**
 * Where an employee's request for another attempt at the target-role assessment has got to.
 *
 * <p>There is deliberately no {@code USED} state. Whether an approval has already been spent is
 * a different fact from whether it was granted, and collapsing the two would lose the decision:
 * a request that was approved stays APPROVED for the audit trail, and
 * {@code AssessmentReattemptRequest.consumedAt} records the attempt it paid for.
 */
public enum ReattemptRequestStatus {
    PENDING,
    APPROVED,
    REJECTED
}
