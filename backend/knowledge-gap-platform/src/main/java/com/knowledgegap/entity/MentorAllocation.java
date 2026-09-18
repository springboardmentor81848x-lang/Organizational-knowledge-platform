package com.knowledgegap.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mentor_allocations")
public class MentorAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Employee who needs mentorship
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // Mentor recommended by Admin/HR
    @ManyToOne
    @JoinColumn(name = "mentor_id", nullable = false)
    private Employee mentor;

    // Skill gap for which mentor is recommended
    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    // Admin/HR who made the recommendation
    @ManyToOne
    @JoinColumn(name = "recommended_by")
    private Employee recommendedBy;

    private String reason;

    private String status;

    private LocalDateTime createdAt;

    public MentorAllocation() {
    }

    public Long getId() {
        return id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
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

    public Employee getRecommendedBy() {
        return recommendedBy;
    }

    public void setRecommendedBy(Employee recommendedBy) {
        this.recommendedBy = recommendedBy;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}