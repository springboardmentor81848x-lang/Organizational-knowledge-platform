package com.knowledgegap.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "peer_assessment_results")
public class PeerAssessmentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // PEER ASSESSMENT ATTEMPT
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "attempt_id", nullable = false)
    private AssessmentAttempt attempt;

    // =========================================================
    // SKILL
    // =========================================================

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    // =========================================================
    // PEER RATING
    // 1 = Beginner
    // 2 = Intermediate
    // 3 = Competent
    // 4 = Advanced
    // 5 = Expert
    // =========================================================

    @Column(name = "rating", nullable = false)
    private Integer rating;

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
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

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }
}