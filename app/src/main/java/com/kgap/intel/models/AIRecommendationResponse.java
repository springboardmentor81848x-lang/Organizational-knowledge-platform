package com.kgap.intel.models;

import java.io.Serializable;

public class AIRecommendationResponse implements Serializable {
    private String skillName;
    private String currentLevel;
    private String requiredLevel;
    private String gapLevel;
    private int priority;
    private String recommendation;
    private String reason;

    public String getSkillName() { return skillName; }
    public String getCurrentLevel() { return currentLevel; }
    public String getRequiredLevel() { return requiredLevel; }
    public String getGapLevel() { return gapLevel; }
    public int getPriority() { return priority; }
    public String getRecommendation() { return recommendation; }
    public String getReason() { return reason; }
}
