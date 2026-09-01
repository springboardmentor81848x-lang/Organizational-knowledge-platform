package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "assessor_id")
    private Long assessorId;

    @Column(name = "assessment_type")
    private String assessmentType;

    private Integer score;

    private Boolean passed;

    @Column(name = "previous_proficiency_level")
    private Integer previousProficiencyLevel;

    @Column(name = "new_proficiency_level")
    private Integer newProficiencyLevel;

    @Column(name = "skill_improvement")
    private Integer skillImprovement;

    @Column(name = "gap_before")
    private Integer gapBefore;

    @Column(name = "gap_after")
    private Integer gapAfter;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "taken_at")
    @Builder.Default
    private LocalDateTime takenAt = LocalDateTime.now();
}
