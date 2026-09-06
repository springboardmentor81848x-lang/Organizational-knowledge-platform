package com.kgap.intel.models;

public class Recommendation {
    private String title;
    private String type; // e.g., "Skill", "Course"

    public Recommendation(String title, String type) {
        this.title = title;
        this.type = type;
    }

    public String getTitle() { return title; }
    public String getType() { return type; }
}
