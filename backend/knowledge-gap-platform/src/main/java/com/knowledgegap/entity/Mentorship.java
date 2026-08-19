package com.knowledgegap.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "mentorship")
public class Mentorship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Employee who needs help
    @ManyToOne
    @JoinColumn(name = "mentee_id", nullable = false)
    private Employee mentee;

    // Employee who will provide mentorship
    @ManyToOne
    @JoinColumn(name = "mentor_id", nullable = false)
    private Employee mentor;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    private String goal;

    private String status;

    private LocalDate startDate;

    private LocalDate endDate;

    public Mentorship() {
    }

    public Long getId() {
        return id;
    }

    public Employee getMentee() {
        return mentee;
    }

    public void setMentee(Employee mentee) {
        this.mentee = mentee;
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

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}