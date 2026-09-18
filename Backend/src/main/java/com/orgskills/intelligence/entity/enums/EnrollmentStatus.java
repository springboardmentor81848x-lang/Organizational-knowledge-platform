package com.orgskills.intelligence.entity.enums;

/**
 * The single training-status vocabulary for the platform. Enrollments, learning milestones
 * and every report that surfaces "where is this learner with this course" use these values —
 * no module may introduce a parallel set of status names.
 */
public enum EnrollmentStatus {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED,
    CERTIFIED,
    EXPIRED_RENEWAL
}
