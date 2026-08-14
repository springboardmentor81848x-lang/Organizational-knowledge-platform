package com.knowledgeiq.dto;

import java.util.List;
import java.util.Map;

public class EmployeeDashboardDto {
    private String level;
    private Integer skillScore;
    private Integer gapPercent;
    private int coursesActive;
    private int certificates;
    private List<Map<String, Object>> growth;
    private List<Map<String, Object>> radar;
    private List<Map<String, Object>> skillsTable;
    private List<Map<String, Object>> path;
    private Map<String, Object> pathInfo;
    private List<Map<String, Object>> activity;
    private List<Map<String, Object>> assessments;

    public EmployeeDashboardDto() {}

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Integer getSkillScore() { return skillScore; }
    public void setSkillScore(Integer skillScore) { this.skillScore = skillScore; }

    public Integer getGapPercent() { return gapPercent; }
    public void setGapPercent(Integer gapPercent) { this.gapPercent = gapPercent; }

    public int getCoursesActive() { return coursesActive; }
    public void setCoursesActive(int coursesActive) { this.coursesActive = coursesActive; }

    public int getCertificates() { return certificates; }
    public void setCertificates(int certificates) { this.certificates = certificates; }

    public List<Map<String, Object>> getGrowth() { return growth; }
    public void setGrowth(List<Map<String, Object>> growth) { this.growth = growth; }

    public List<Map<String, Object>> getRadar() { return radar; }
    public void setRadar(List<Map<String, Object>> radar) { this.radar = radar; }

    public List<Map<String, Object>> getSkillsTable() { return skillsTable; }
    public void setSkillsTable(List<Map<String, Object>> skillsTable) { this.skillsTable = skillsTable; }

    public List<Map<String, Object>> getPath() { return path; }
    public void setPath(List<Map<String, Object>> path) { this.path = path; }

    public Map<String, Object> getPathInfo() { return pathInfo; }
    public void setPathInfo(Map<String, Object> pathInfo) { this.pathInfo = pathInfo; }

    public List<Map<String, Object>> getActivity() { return activity; }
    public void setActivity(List<Map<String, Object>> activity) { this.activity = activity; }

    public List<Map<String, Object>> getAssessments() { return assessments; }
    public void setAssessments(List<Map<String, Object>> assessments) { this.assessments = assessments; }
}
