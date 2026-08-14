package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "training_courses")
public class TrainingCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_skill_id")
    private Skill targetSkill;

    @Column(name = "target_level")
    private Integer targetLevel;

    private String provider; // e.g. Internal, Coursera, Udemy

    @Column(name = "course_url")
    private String courseUrl;

    @Column(name = "duration_hours")
    private Integer durationHours = 5;

    @Transient
    private Boolean isPlaceholder = false;

    public TrainingCourse() {}

    public Boolean getIsPlaceholder() { return isPlaceholder; }
    public void setIsPlaceholder(Boolean isPlaceholder) { this.isPlaceholder = isPlaceholder; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Skill getTargetSkill() { return targetSkill; }
    public void setTargetSkill(Skill targetSkill) { this.targetSkill = targetSkill; }

    public Integer getTargetLevel() { return targetLevel; }
    public void setTargetLevel(Integer targetLevel) { this.targetLevel = targetLevel; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getCourseUrl() { return courseUrl; }
    public void setCourseUrl(String courseUrl) { this.courseUrl = courseUrl; }

    public Integer getDurationHours() { return durationHours; }
    public void setDurationHours(Integer durationHours) { this.durationHours = durationHours; }
}
