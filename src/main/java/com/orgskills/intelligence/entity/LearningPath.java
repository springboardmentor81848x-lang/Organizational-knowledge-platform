package com.orgskills.intelligence.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_paths")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningPath {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private User employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_skill_id")
    private Skill targetSkill;

    @Column(nullable = false)
    private String title;

    @Column(length = 3000)
    private String description;

    private String targetRole;

    private String targetDepartment;

    private String targetSeverity;

    private Integer totalEstimatedHours;

    @Column(nullable = false)
    private String status;

    private Integer overallProgressPercent;

    private LocalDateTime generatedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean noCoursesAvailable = false;

    @Builder.Default
    @OneToMany(mappedBy = "learningPath", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    private List<LearningPathStep> steps = new ArrayList<>();

    public void setSteps(List<LearningPathStep> newSteps) {
        if (this.steps == null) {
            this.steps = new ArrayList<>();
        } else {
            this.steps.clear();
        }
        if (newSteps != null) {
            this.steps.addAll(newSteps);
        }
    }

    @PrePersist
    public void prePersist() {
        if (this.generatedAt == null) {
            this.generatedAt = LocalDateTime.now();
        }
        if (this.overallProgressPercent == null) {
            this.overallProgressPercent = 0;
        }
        if (this.status == null) {
            this.status = "NOT_STARTED";
        }
        if (this.noCoursesAvailable == null) {
            this.noCoursesAvailable = false;
        }
    }
}
