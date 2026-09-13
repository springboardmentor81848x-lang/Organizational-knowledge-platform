package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.AssessmentReattemptRequest;
import com.orgskills.intelligence.entity.enums.ReattemptRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AssessmentReattemptRequestRepository extends JpaRepository<AssessmentReattemptRequest, Long> {

    List<AssessmentReattemptRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    Optional<AssessmentReattemptRequest> findFirstByEmployeeIdAndStatusOrderByCreatedAtAsc(
            Long employeeId, ReattemptRequestStatus status);

    /**
     * The oldest approval this employee has not yet spent, which is the one an attempt consumes.
     * Oldest first so a queue of approvals is used in the order it was granted.
     */
    Optional<AssessmentReattemptRequest> findFirstByEmployeeIdAndStatusAndConsumedAtIsNullOrderByDecidedAtAsc(
            Long employeeId, ReattemptRequestStatus status);

    /**
     * Requests an approver can act on, newest first, with the employee and the decider joined in
     * so the response can name them without a query per row.
     */
    @Query("""
            SELECT r FROM AssessmentReattemptRequest r
            JOIN FETCH r.employee e
            LEFT JOIN FETCH e.manager
            LEFT JOIN FETCH r.decidedBy
            WHERE (:status IS NULL OR r.status = :status)
            ORDER BY r.createdAt DESC
            """)
    List<AssessmentReattemptRequest> findForReview(@Param("status") ReattemptRequestStatus status);
}
