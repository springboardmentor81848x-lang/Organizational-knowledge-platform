package com.knowledgegap.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "mentor_expertise",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"mentor_id", "skill_id"}
        )
    }
)
public class MentorExpertise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Existing mentor/employee
    @ManyToOne
    @JoinColumn(name = "mentor_id", nullable = false)
    private Employee mentor;

    // Existing skill
    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    // 1 = Beginner
    // 2 = Elementary
    // 3 = Intermediate
    // 4 = Advanced
    // 5 = Expert
    @Column(nullable = false)
    private Integer proficiencyLevel;

    public MentorExpertise() {
    }

    public Long getId() {
        return id;
    }

    public Employee getMentor() {
        return mentor;
    }

    public void setMentor(Employee mentor) {
        this.mentor = mentor;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public Integer getProficiencyLevel() {
        return proficiencyLevel;
    }

    public void setProficiencyLevel(Integer proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }
}