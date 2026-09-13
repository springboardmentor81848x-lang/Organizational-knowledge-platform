package com.orgskills.intelligence.entity.enums;

/**
 * Which paper an employee is entitled to sit next.
 *
 * <p>The two are not the same assessment under different names, and the difference is what lets
 * the once-only rule and "a skill you add must be assessed" both hold at once.
 */
public enum AssessmentScope {

    /**
     * The full assessment for the employee's target role. Taken once; a further attempt has to
     * be approved, because it re-measures skills that already have a mark against them.
     */
    TARGET_ROLE,

    /**
     * A paper covering only the skills the employee has added to their profile and has never
     * been assessed on.
     *
     * <p>Needs no approval, and does not count as a retake, because nothing here is being
     * re-measured: these skills have no mark at all yet. It cannot be used to revisit a skill
     * that does - the paper is built from the skills with no result against them, so a skill
     * already assessed is never on it, however many times it is removed and added back.
     */
    NEW_SKILLS,

    /** Nothing to sit: either everything is measured, or this account has no development track. */
    NONE
}
