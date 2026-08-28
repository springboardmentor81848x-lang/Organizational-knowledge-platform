package com.knowledgegap.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "assessment_gap_results")
public class AssessmentGapResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "attempt_id")
    private AssessmentAttempt attempt;

    @Column(name = "skill_name")
    private String skillName;

    @Column(name = "actual_score")
    private Integer actualScore;

    @Column(name = "required_score")
    private Integer requiredScore;

    @Column(name = "gap")
    private Integer gap;

    @Column(name = "gap_severity")
    private String gapSeverity;

    // =========================================================
    // MODULE 5 - HISTORICAL COMPARISON
    // =========================================================

    @Column(name = "previous_level")
    private Integer previousLevel;

    @Column(name = "assessed_level")
    private Integer assessedLevel;

    @Column(name = "improvement")
    private Integer improvement;

    public AssessmentGapResult() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AssessmentAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(AssessmentAttempt attempt) {
        this.attempt = attempt;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Integer getActualScore() {
        return actualScore;
    }

    public void setActualScore(Integer actualScore) {
        this.actualScore = actualScore;
    }

    public Integer getRequiredScore() {
        return requiredScore;
    }

    public void setRequiredScore(Integer requiredScore) {
        this.requiredScore = requiredScore;
    }

    public Integer getGap() {
        return gap;
    }

    public void setGap(Integer gap) {
        this.gap = gap;
    }

    public String getGapSeverity() {
        return gapSeverity;
    }

    public void setGapSeverity(String gapSeverity) {
        this.gapSeverity = gapSeverity;
    }

    public Integer getPreviousLevel() {
        return previousLevel;
    }

    public void setPreviousLevel(Integer previousLevel) {
        this.previousLevel = previousLevel;
    }

    public Integer getAssessedLevel() {
        return assessedLevel;
    }

    public void setAssessedLevel(Integer assessedLevel) {
        this.assessedLevel = assessedLevel;
    }

    public Integer getImprovement() {
        return improvement;
    }

    public void setImprovement(Integer improvement) {
        this.improvement = improvement;
    }
}