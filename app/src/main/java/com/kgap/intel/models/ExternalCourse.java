package com.kgap.intel.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class ExternalCourse implements Serializable {
    @SerializedName("id")
    private Long id;

    @SerializedName("title")
    private String title;

    @SerializedName("description")
    private String description;

    @SerializedName("skillName")
    private String skillName;

    @SerializedName("level")
    private String level;

    @SerializedName("provider")
    private String provider;

    @SerializedName("durationHours")
    private Integer durationHours;

    @SerializedName("courseLink")
    private String courseLink;

    public ExternalCourse() {
    }

    public ExternalCourse(Long id, String title, String description, String skillName, String level, String provider, Integer durationHours, String courseLink) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.skillName = skillName;
        this.level = level;
        this.provider = provider;
        this.durationHours = durationHours;
        this.courseLink = courseLink;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public Integer getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(Integer durationHours) {
        this.durationHours = durationHours;
    }

    public String getCourseLink() {
        return courseLink;
    }

    public void setCourseLink(String courseLink) {
        this.courseLink = courseLink;
    }
}
