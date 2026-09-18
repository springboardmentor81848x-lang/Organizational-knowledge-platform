package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.Assessment;
import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    List<Assessment> findByEmployeeIdOrderByDateDesc(Long employeeId);

    List<Assessment> findByAssessorIdOrderByDateDesc(Long assessorId);

    List<Assessment> findByEmployeeIdAndStatusOrderByDateDesc(Long employeeId, AssessmentStatus status);

    /** Assessments in a given state due within a window; backs the reminder scan. */
    List<Assessment> findByStatusAndDateBetween(AssessmentStatus status, Instant from, Instant to);

    /**
     * Pending assessments of the same type, by the same assessor, for the same employee, that
     * already cover one of the given skills. Backs the duplicate-assessment guard.
     */
    @Query("""
            SELECT DISTINCT a FROM Assessment a
            JOIN a.results r
            WHERE a.employee.id = :employeeId
              AND a.assessor.id = :assessorId
              AND a.assessmentType = :assessmentType
              AND a.status = com.orgskills.intelligence.entity.enums.AssessmentStatus.PENDING
              AND r.skill.id IN :skillIds
            """)
    List<Assessment> findPendingDuplicates(@Param("employeeId") Long employeeId,
                                           @Param("assessorId") Long assessorId,
                                           @Param("assessmentType") AssessmentType assessmentType,
                                           @Param("skillIds") List<Long> skillIds);

    /**
     * How many target-role assessments this employee has actually completed.
     *
     * <p>A target-role attempt is the only thing that writes a self-authored SELF assessment —
     * rating yourself by hand was withdrawn — so counting those counts attempts, and the
     * once-only rule is enforced against the assessments themselves rather than against a
     * separate tally that could drift away from them.
     */
    @Query("""
            SELECT COUNT(a) FROM Assessment a
            WHERE a.employee.id = :employeeId
              AND a.assessor.id = :employeeId
              AND a.assessmentType = com.orgskills.intelligence.entity.enums.AssessmentType.SELF
              AND a.status = com.orgskills.intelligence.entity.enums.AssessmentStatus.COMPLETED
            """)
    long countCompletedSelfAssessments(@Param("employeeId") Long employeeId);

    /** When the employee last completed a target-role assessment, or empty if they never have. */
    @Query("""
            SELECT MAX(a.date) FROM Assessment a
            WHERE a.employee.id = :employeeId
              AND a.assessor.id = :employeeId
              AND a.assessmentType = com.orgskills.intelligence.entity.enums.AssessmentType.SELF
              AND a.status = com.orgskills.intelligence.entity.enums.AssessmentStatus.COMPLETED
            """)
    Optional<Instant> findLastCompletedSelfAssessmentAt(@Param("employeeId") Long employeeId);
}
