package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.Assessment;
import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    List<Assessment> findByEmployeeIdOrderByDateDesc(Long employeeId);

    List<Assessment> findByAssessorIdOrderByDateDesc(Long assessorId);

    List<Assessment> findByEmployeeIdAndStatusOrderByDateDesc(Long employeeId, AssessmentStatus status);

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
}
