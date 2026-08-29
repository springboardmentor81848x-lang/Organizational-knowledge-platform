package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
