package com.orgskills.intelligence.entity;

import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
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
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * An employee's enrolment in one training course. {@code progress} is the overall percentage
 * for the course; the finer-grained per-topic breakdown lives in {@link LearningMilestone}.
 *
 * <p>There is deliberately no unique constraint on (employee, course): re-taking a course after
 * it has been completed or has expired is legitimate. Only a duplicate <em>active</em> enrolment
 * is rejected, which the service enforces.
 */
@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    /** The training this enrolment is for; surfaced as {@code trainingId} on the API. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status = EnrollmentStatus.NOT_STARTED;

    @Column(nullable = false)
    private Double progress = 0.0;

    @Column(name = "start_date", nullable = false, updatable = false)
    private Instant startDate;

    @Column(name = "completion_date")
    private Instant completionDate;

    /** Optional date the employee is expected to finish by; drives the deadline reminder. */
    @Column(name = "target_completion_date")
    private Instant targetCompletionDate;

    @Column(nullable = false)
    private Instant lastProgressUpdateAt;

    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequence ASC")
    private List<LearningMilestone> milestones = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (this.startDate == null) {
            this.startDate = now;
        }
        this.lastProgressUpdateAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.lastProgressUpdateAt = Instant.now();
    }
}
