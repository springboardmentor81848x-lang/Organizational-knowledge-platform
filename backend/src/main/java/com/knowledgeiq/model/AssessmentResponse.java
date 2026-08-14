package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "assessment_responses")
public class AssessmentResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "proficiency_level", nullable = false)
    private Integer proficiencyLevel;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public AssessmentResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Assessment getAssessment() { return assessment; }
    public void setAssessment(Assessment assessment) { this.assessment = assessment; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public Integer getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(Integer proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
