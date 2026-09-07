package com.okip.entity.transaction;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.okip.entity.master.Skill;
import com.okip.entity.master.Training;

import jakarta.persistence.*;

@Entity
@Table(
    name = "training_skills",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_training_skill",
            columnNames = {"training_id", "skill_id"}
        )
    }
)
public class TrainingSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "training_skill_id")
    private Long trainingSkillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    private Training training;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public TrainingSkill() {
    }

    public Long getTrainingSkillId() {
        return trainingSkillId;
    }

    public void setTrainingSkillId(Long trainingSkillId) {
        this.trainingSkillId = trainingSkillId;
    }

    public Training getTraining() {
        return training;
    }

    public void setTraining(Training training) {
        this.training = training;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}