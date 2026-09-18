package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByEmployeeIdOrderByStartDateDesc(Long employeeId);
    List<Enrollment> findByEmployeeId(Long employeeId);
    List<Enrollment> findByEmployeeIdIn(List<Long> employeeIds);
    List<Enrollment> findByCourseId(Long courseId);
    List<Enrollment> findByEmployeeIdInAndStatus(Collection<Long> employeeIds, EnrollmentStatus status);
    List<Enrollment> findByEmployeeIdAndStatus(Long employeeId, EnrollmentStatus status);

    /** Enrolments still in flight whose target completion date falls in the given window. */
    List<Enrollment> findByStatusInAndTargetCompletionDateBetween(
            Collection<EnrollmentStatus> statuses, Instant from, Instant to);

    /**
     * Enrolments an employee already holds for a course in any of the given states. A course may be
     * re-taken once a previous attempt is finished, so this returns a list rather than an Optional.
     */
    List<Enrollment> findByEmployeeIdAndCourseIdAndStatusIn(
            Long employeeId, Long courseId, Collection<EnrollmentStatus> statuses);

    /** The most recent attempt at a course, for callers that just want "the" enrolment. */
    Optional<Enrollment> findFirstByEmployeeIdAndCourseIdOrderByStartDateDesc(Long employeeId, Long courseId);
}
