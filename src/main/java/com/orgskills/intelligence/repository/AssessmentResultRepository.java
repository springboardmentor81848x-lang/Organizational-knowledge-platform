package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, Long> {

    List<AssessmentResult> findByAssessmentId(Long assessmentId);

    /**
     * Every submitted result for an employee, newest assessment first. The history endpoint walks
     * this once and groups by skill, rather than issuing a query per skill.
     */
    @Query("""
            SELECT r FROM AssessmentResult r
            JOIN FETCH r.skill
            JOIN FETCH r.assessment a
            WHERE a.employee.id = :employeeId
              AND a.status = com.orgskills.intelligence.entity.enums.AssessmentStatus.COMPLETED
              AND r.proficiency IS NOT NULL
            ORDER BY a.date DESC, r.resultId DESC
            """)
    List<AssessmentResult> findSubmittedResultsForEmployee(@Param("employeeId") Long employeeId);

    /**
     * The same, for a whole team or department in one query. Analytics walks the result set in
     * memory rather than issuing a query per employee.
     */
    @Query("""
            SELECT r FROM AssessmentResult r
            JOIN FETCH r.skill
            JOIN FETCH r.assessment a
            JOIN FETCH a.employee
            WHERE a.employee.id IN :employeeIds
              AND a.status = com.orgskills.intelligence.entity.enums.AssessmentStatus.COMPLETED
              AND r.proficiency IS NOT NULL
            ORDER BY a.date DESC, r.resultId DESC
            """)
    List<AssessmentResult> findSubmittedResultsForEmployees(@Param("employeeIds") Collection<Long> employeeIds);

    /**
     * Mean level movement across every submitted assessment, on the canonical 0-4 scale.
     * Aggregated in the database so the organization dashboard does not load every result row.
     * Returns null when nothing has been assessed yet.
     */
    @Query("""
            SELECT AVG(r.improvement) FROM AssessmentResult r
            WHERE r.improvement IS NOT NULL
              AND r.assessment.status = com.orgskills.intelligence.entity.enums.AssessmentStatus.COMPLETED
            """)
    Double findAverageImprovement();
}
