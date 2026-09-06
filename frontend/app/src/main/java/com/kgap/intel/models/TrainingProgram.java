package com.kgap.intel.models;

import java.util.List;

public class TrainingProgram {
    private String id;
    private String title;
    private String description;
    private String platform; // "Internal Corporate Program" or "Coursera"
    private String url;
    private String duration;
    private String difficulty;
    private List<String> mappedSkills;
    private boolean isActive;
    private String prerequisites;
    private String meetingLink;
    private String sessionSchedule;
    private String instructor;

    public TrainingProgram() {}

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
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public List<String> getMappedSkills() { return mappedSkills; }
    public void setMappedSkills(List<String> mappedSkills) { this.mappedSkills = mappedSkills; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getPrerequisites() { return prerequisites; }
    public void setPrerequisites(String prerequisites) { this.prerequisites = prerequisites; }

    public String getMeetingLink() { return meetingLink != null ? meetingLink : "https://meet.google.com/kgap-live-session"; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getSessionSchedule() { return sessionSchedule != null ? sessionSchedule : "📅 Every Tue & Thu • 04:00 PM - 05:30 PM"; }
    public void setSessionSchedule(String sessionSchedule) { this.sessionSchedule = sessionSchedule; }

    public String getInstructor() { return instructor != null ? instructor : "Senior Technical Lead"; }
    public void setInstructor(String instructor) { this.instructor = instructor; }
}
