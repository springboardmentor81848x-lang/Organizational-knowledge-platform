package com.orgskills.intelligence.entity;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The level awarded for one skill within an assessment.
 *
 * <p>{@code proficiency} and {@code score} are null while the assessment is still PENDING: a
 * scheduled assessment records which skills it will cover before anyone has judged them. Both
 * are required once results are submitted.
 *
 * <p>{@code previousProficiency} and {@code improvement} are captured at submission time so the
 * before/after comparison survives later reassessments, which would otherwise overwrite the only
 * record of where the employee started.
 */
@Entity
@Table(name = "assessment_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resultId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    private ProficiencyLevel proficiency;

    /** Optional raw mark out of 100 backing the awarded level; informational only. */
    private Double score;

    /** The level the employee held immediately before this assessment was submitted. */
    @Enumerated(EnumType.STRING)
    @Column(name = "previous_proficiency")
    private ProficiencyLevel previousProficiency;

    /** New level score minus previous level score, on the canonical 0-4 scale. */
    private Integer improvement;
}
