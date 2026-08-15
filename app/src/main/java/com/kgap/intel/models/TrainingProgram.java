package com.kgap.intel.models;

import java.util.List;

public class TrainingProgram {
    private String id;
    private String title;
    private String description;
    private String platform; // "Internal" or external platforms like "Coursera"
    private String url;
    private String duration;
    private String difficulty;
    private List<String> mappedSkills;
    private boolean isActive;
    private String prerequisites;

    public TrainingProgram(String id, String title, String description, String platform, String url, String duration, String difficulty, List<String> mappedSkills, boolean isActive) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.platform = platform;
        this.url = url;
        this.duration = duration;
        this.difficulty = difficulty;
        this.mappedSkills = mappedSkills;
        this.isActive = isActive;
    }

    // Getters and Setters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getPlatform() { return platform; }
    public String getUrl() { return url; }
    public String getDuration() { return duration; }
    public String getDifficulty() { return difficulty; }
    public List<String> getMappedSkills() { return mappedSkills; }
    public boolean isActive() { return isActive; }
    public String getPrerequisites() { return prerequisites; }
    public void setPrerequisites(String prerequisites) { this.prerequisites = prerequisites; }
}
