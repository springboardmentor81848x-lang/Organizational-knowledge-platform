package com.orgskills.intelligence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A sub-step inside a training course — "Core Java", "Multithreading" — so a learner's position
 * in a course reads as a list of named topics rather than one opaque percentage. Milestone
 * completion is tracked independently of {@link Enrollment#getProgress()}: the overall figure is
 * whatever the learning platform reports, and is not recomputed from these rows.
 *
 * <p>A row with a {@code null} enrolment is the course-level <em>template</em> defining the topics
 * of a training. Enrolling copies the template into learner-owned rows, which is where completion
 * is recorded.
 */
@Entity
@Table(name = "learning_milestones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LearningMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long milestoneId;

    /** The training this milestone belongs to; surfaced as {@code trainingId} on the API. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "training_id", nullable = false)
    private Course training;

    /** Null on a course-level template row; set on a learner's copy. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id")
    private Enrollment enrollment;

    @Column(nullable = false)
    private String title;

    /** Display/teaching order within the course. Column is renamed: SEQUENCE is SQL-reserved. */
    @Column(name = "sequence_no", nullable = false)
    private Integer sequence;

    @Column(nullable = false)
    private Double completionPercentage = 0.0;
}
