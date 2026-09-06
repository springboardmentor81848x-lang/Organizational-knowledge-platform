package com.kgap.intel.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class ScoredCourseRecommendation implements Serializable {
    @SerializedName("course")
    private ExternalCourse course;

    @SerializedName("score")
    private int score;

    @SerializedName("matchPercentage")
    private int matchPercentage;

    @SerializedName("matchReason")
    private String matchReason;

    @SerializedName("skillName")
    private String skillName;

    @SerializedName("gapLevel")
    private String gapLevel;

    public ScoredCourseRecommendation() {}

    public ExternalCourse getCourse() { return course; }
    public void setCourse(ExternalCourse course) { this.course = course; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(int matchPercentage) { this.matchPercentage = matchPercentage; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getGapLevel() { return gapLevel; }
    public void setGapLevel(String gapLevel) { this.gapLevel = gapLevel; }
}
