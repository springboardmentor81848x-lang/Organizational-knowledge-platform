package com.kgap.intel.models;

import java.util.List;

public class MenteeProgress {
    private String menteeId;
    private String menteeName;
    private String role;
    private int overallProgress; // Percentage
    private List<String> currentSkills;
    private List<String> skillGaps;
    private String currentLearningPath;
    private List<String> recentCertifications;

    public MenteeProgress(String menteeId, String menteeName, String role, int overallProgress, List<String> currentSkills, List<String> skillGaps, String currentLearningPath) {
        this.menteeId = menteeId;
        this.menteeName = menteeName;
        this.role = role;
        this.overallProgress = overallProgress;
        this.currentSkills = currentSkills;
        this.skillGaps = skillGaps;
        this.currentLearningPath = currentLearningPath;
    }

    // Getters and Setters
    public String getMenteeId() { return menteeId; }
    public String getMenteeName() { return menteeName; }
    public String getRole() { return role; }
    public int getOverallProgress() { return overallProgress; }
    public List<String> getCurrentSkills() { return currentSkills; }
    public List<String> getSkillGaps() { return skillGaps; }
    public String getCurrentLearningPath() { return currentLearningPath; }
    public List<String> getRecentCertifications() { return recentCertifications; }
    public void setRecentCertifications(List<String> recentCertifications) { this.recentCertifications = recentCertifications; }
}
