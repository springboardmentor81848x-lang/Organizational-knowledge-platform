package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "role_skill_benchmarks")
public class RoleSkillBenchmark {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "required_level", nullable = false)
    private Integer requiredLevel;

    @Column(name = "is_critical")
    private Boolean isCritical = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    public RoleSkillBenchmark() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public Integer getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; }

    public Boolean getIsCritical() { return isCritical; }
    public void setIsCritical(Boolean isCritical) { this.isCritical = isCritical; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
}
