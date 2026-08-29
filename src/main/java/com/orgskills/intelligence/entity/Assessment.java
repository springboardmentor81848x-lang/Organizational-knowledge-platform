package com.orgskills.intelligence.entity;

import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * One assessment of an employee by an assessor. The assessment is a header: the levels actually
 * awarded live in its {@link AssessmentResult} rows, one per skill, so a single manager review
 * can cover several skills at once and still be submitted atomically.
 */
@Entity
@Table(name = "assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The employee being assessed; surfaced as {@code employeeId} on the API. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    /** Who is assessing. Equal to the employee for a SELF assessment. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessor_id", nullable = false)
    private User assessor;

    @Enumerated(EnumType.STRING)
    @Column(name = "assessment_type", nullable = false)
    private AssessmentType assessmentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentStatus status = AssessmentStatus.PENDING;

    /** When the assessment was scheduled; set to the submission time once results arrive. */
    @Column(nullable = false)
    private Instant date;

    @Column(length = 2000)
    private String comments;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant submittedAt;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentResult> results = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        if (this.date == null) {
            this.date = now;
        }
    }
}
