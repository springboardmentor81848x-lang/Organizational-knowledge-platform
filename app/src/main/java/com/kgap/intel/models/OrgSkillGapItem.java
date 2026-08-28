package com.kgap.intel.models;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class OrgSkillGapItem implements Serializable {
    private String skillName;
    private String departmentsSummary;
    private int impactedCount;
    private int totalRoleHolders;
    private String highestSeverity; // HIGH, MEDIUM, LOW
    private String requiredProficiency;
    private int averageGapPercent;
    private List<String> impactedEmployees = new ArrayList<>();

    public OrgSkillGapItem() {}

    public OrgSkillGapItem(String skillName, String departmentsSummary, int impactedCount, int totalRoleHolders, String highestSeverity, String requiredProficiency, int averageGapPercent) {
        this.skillName = skillName;
        this.departmentsSummary = departmentsSummary;
        this.impactedCount = impactedCount;
        this.totalRoleHolders = totalRoleHolders;
        this.highestSeverity = highestSeverity;
        this.requiredProficiency = requiredProficiency;
        this.averageGapPercent = averageGapPercent;
    }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getDepartmentsSummary() { return departmentsSummary; }
    public void setDepartmentsSummary(String departmentsSummary) { this.departmentsSummary = departmentsSummary; }

    public int getImpactedCount() { return impactedCount; }
    public void setImpactedCount(int impactedCount) { this.impactedCount = impactedCount; }

    public int getTotalRoleHolders() { return totalRoleHolders; }
    public void setTotalRoleHolders(int totalRoleHolders) { this.totalRoleHolders = totalRoleHolders; }

    public String getHighestSeverity() { return highestSeverity; }
    public void setHighestSeverity(String highestSeverity) { this.highestSeverity = highestSeverity; }

    public String getRequiredProficiency() { return requiredProficiency; }
    public void setRequiredProficiency(String requiredProficiency) { this.requiredProficiency = requiredProficiency; }

    public int getAverageGapPercent() { return averageGapPercent; }
    public void setAverageGapPercent(int averageGapPercent) { this.averageGapPercent = averageGapPercent; }

    public List<String> getImpactedEmployees() { return impactedEmployees; }
    public void setImpactedEmployees(List<String> impactedEmployees) { this.impactedEmployees = impactedEmployees; }
}
