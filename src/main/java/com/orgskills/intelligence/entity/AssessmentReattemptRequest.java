package com.orgskills.intelligence.entity;

import com.orgskills.intelligence.entity.enums.ReattemptRequestStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * An employee asking a higher authority for another attempt at the target-role assessment.
 *
 * <p>The assessment may be taken once. Every later attempt has to be paid for by one of these,
 * approved by the employee's manager or by an HR, L&amp;D or administrator account — which is
 * why an approval is single-use: {@link #consumedAt} is stamped by the attempt it permitted, and
 * an approval that has been consumed no longer unlocks anything. Without that the first approval
 * would be a permanent licence to retake, and the once-only rule would hold for exactly one
 * request.
 */
@Entity
@Table(name = "assessment_reattempt_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentReattemptRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The employee asking for another attempt. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    /** Why they are asking. Required, because an approver has nothing else to judge on. */
    @Column(nullable = false, length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReattemptRequestStatus status = ReattemptRequestStatus.PENDING;

    /** How many attempts the employee had already taken when they asked. */
    @Column(name = "attempts_at_request", nullable = false)
    private Integer attemptsAtRequest = 0;

    /** Who decided. Null while the request is still PENDING. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by_id")
    private User decidedBy;

    @Column(length = 1000)
    private String decisionNote;

    private Instant decidedAt;

    /** When the approval was spent on an attempt. Null means it is still good for one. */
    private Instant consumedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    /** An approval nobody has taken an assessment on yet. */
    public boolean isUnspentApproval() {
        return status == ReattemptRequestStatus.APPROVED && consumedAt == null;
    }
}
