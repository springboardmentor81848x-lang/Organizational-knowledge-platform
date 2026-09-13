package com.orgskills.intelligence.entity.enums;

public enum NotificationType {
    GAP_ALERT,
    TRAINING_DEADLINE,
    MENTORSHIP_INVITE,
    SESSION_REMINDER,
    ASSESSMENT_REMINDER,
    TRAINING_RECOMMENDATION,
    TRAINING_PROGRESS,
    ACHIEVEMENT_UNLOCKED,
    ASSESSMENT_RESULT,
    MENTORSHIP_REQUEST,
    /** An employee has asked a higher authority for another attempt at their assessment. */
    ASSESSMENT_REATTEMPT_REQUEST,
    /** That request was approved or refused; sent back to the employee who raised it. */
    ASSESSMENT_REATTEMPT_DECISION,
    /** Somebody signed up and is waiting for access to be granted; sent to the approvers. */
    ACCESS_REQUEST,
    /** The decision on a sign-up, sent to the person who made it. */
    ACCESS_DECISION,
    INFO,
    SYSTEM_ALERT
}
