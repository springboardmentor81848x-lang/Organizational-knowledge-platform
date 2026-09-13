package com.orgskills.intelligence.entity.enums;

/**
 * Where a self-service sign-up stands with the people who grant access.
 *
 * <p>Accounts created by an administrator, and every account that existed before approval was
 * introduced, are {@link #APPROVED} — the column is read through
 * {@code User.getAccessStatus()}, which treats a null as approved so that adding this field
 * could not lock out an existing installation on the first restart.
 */
public enum AccessStatus {

    /** Signed up and waiting on a decision. The account exists but cannot sign in. */
    PENDING,

    /** Granted access. The only state in which sign-in succeeds. */
    APPROVED,

    /**
     * Refused. The row is kept rather than deleted so the decision, its author and its reason
     * stay on record, and so the person can be told why rather than meeting "no such account".
     */
    REJECTED
}
