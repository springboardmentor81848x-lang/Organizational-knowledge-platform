package com.orgskills.intelligence.entity;

import com.orgskills.intelligence.entity.enums.RiskSeverity;
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

@Entity
@Table(name = "gap_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GapAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(nullable = false)
    private Double targetScore;

    @Column(nullable = false)
    private Double currentScore;

    @Column(nullable = false)
    private Double gapScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskSeverity riskSeverity;

    /**
     * True when the employee has no record of this skill at all. Distinct from holding it at
     * UNAWARE, which also scores 0 on the canonical scale but means the skill is on file.
     */
    @Column(name = "missing_skill", nullable = false)
    private Boolean missingSkill = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
