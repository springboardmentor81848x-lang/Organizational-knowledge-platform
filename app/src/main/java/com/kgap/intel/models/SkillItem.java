package com.kgap.intel.models;

import com.google.gson.annotations.SerializedName;

public class SkillItem {
    private String id;
    
    @SerializedName("skillName")
    private String name;

    private String category;
    private int proficiency;
    private String level; // Beginner, Intermediate, Advanced
    private String experience;
    private String lastUpdated;

    public SkillItem(String id, String name, String category, int proficiency, String level, String experience, String lastUpdated) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.proficiency = proficiency;
        this.level = level;
        this.experience = experience;
        this.lastUpdated = lastUpdated;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public int getProficiency() { return proficiency; }
    public String getLevel() { return level; }
    public String getExperience() { return experience; }
    public String getLastUpdated() { return lastUpdated; }
}
