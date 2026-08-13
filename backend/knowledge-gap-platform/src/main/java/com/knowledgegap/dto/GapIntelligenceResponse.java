package com.knowledgegap.dto;

import java.util.List;

public class GapIntelligenceResponse {

    private List<SkillGapData> gapBySkill;
    private List<HeatmapData> heatmap;
    private List<DepartmentGapData> departmentGaps;
    private List<GapDistributionData> gapDistribution;
    private List<CriticalGapData> criticalGaps;

    public GapIntelligenceResponse() {
    }

    public List<SkillGapData> getGapBySkill() {
        return gapBySkill;
    }

    public void setGapBySkill(List<SkillGapData> gapBySkill) {
        this.gapBySkill = gapBySkill;
    }

    public List<HeatmapData> getHeatmap() {
        return heatmap;
    }

    public void setHeatmap(List<HeatmapData> heatmap) {
        this.heatmap = heatmap;
    }

    public List<DepartmentGapData> getDepartmentGaps() {
        return departmentGaps;
    }

    public void setDepartmentGaps(List<DepartmentGapData> departmentGaps) {
        this.departmentGaps = departmentGaps;
    }

    public List<GapDistributionData> getGapDistribution() {
        return gapDistribution;
    }

    public void setGapDistribution(List<GapDistributionData> gapDistribution) {
        this.gapDistribution = gapDistribution;
    }

    public List<CriticalGapData> getCriticalGaps() {
        return criticalGaps;
    }

    public void setCriticalGaps(List<CriticalGapData> criticalGaps) {
        this.criticalGaps = criticalGaps;
    }

    public static class SkillGapData {
        private String skill;
        private long critical;
        private long moderate;
        private long low;

        public SkillGapData() {}

        public SkillGapData(String skill, long critical,
                            long moderate, long low) {
            this.skill = skill;
            this.critical = critical;
            this.moderate = moderate;
            this.low = low;
        }

        public String getSkill() {
            return skill;
        }

        public void setSkill(String skill) {
            this.skill = skill;
        }

        public long getCritical() {
            return critical;
        }

        public void setCritical(long critical) {
            this.critical = critical;
        }

        public long getModerate() {
            return moderate;
        }

        public void setModerate(long moderate) {
            this.moderate = moderate;
        }

        public long getLow() {
            return low;
        }

        public void setLow(long low) {
            this.low = low;
        }
    }

    public static class HeatmapData {
        private String employee;
        private String skill;
        private int gap;

        public HeatmapData() {}

        public HeatmapData(String employee, String skill, int gap) {
            this.employee = employee;
            this.skill = skill;
            this.gap = gap;
        }

        public String getEmployee() {
            return employee;
        }

        public void setEmployee(String employee) {
            this.employee = employee;
        }

        public String getSkill() {
            return skill;
        }

        public void setSkill(String skill) {
            this.skill = skill;
        }

        public int getGap() {
            return gap;
        }

        public void setGap(int gap) {
            this.gap = gap;
        }
    }

    public static class DepartmentGapData {
        private String department;
        private double averageGap;

        public DepartmentGapData() {}

        public DepartmentGapData(String department, double averageGap) {
            this.department = department;
            this.averageGap = averageGap;
        }

        public String getDepartment() {
            return department;
        }

        public void setDepartment(String department) {
            this.department = department;
        }

        public double getAverageGap() {
            return averageGap;
        }

        public void setAverageGap(double averageGap) {
            this.averageGap = averageGap;
        }
    }

    public static class GapDistributionData {
        private String level;
        private long count;

        public GapDistributionData() {}

        public GapDistributionData(String level, long count) {
            this.level = level;
            this.count = count;
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }

    public static class CriticalGapData {
        private String employee;
        private String department;
        private String designation;
        private String skill;
        private int currentLevel;
        private int requiredLevel;
        private int gap;
        private String severity;

        public CriticalGapData() {}

        public CriticalGapData(
                String employee,
                String department,
                String designation,
                String skill,
                int currentLevel,
                int requiredLevel,
                int gap,
                String severity) {

            this.employee = employee;
            this.department = department;
            this.designation = designation;
            this.skill = skill;
            this.currentLevel = currentLevel;
            this.requiredLevel = requiredLevel;
            this.gap = gap;
            this.severity = severity;
        }

        public String getEmployee() {
            return employee;
        }

        public void setEmployee(String employee) {
            this.employee = employee;
        }

        public String getDepartment() {
            return department;
        }

        public void setDepartment(String department) {
            this.department = department;
        }

        public String getDesignation() {
            return designation;
        }

        public void setDesignation(String designation) {
            this.designation = designation;
        }

        public String getSkill() {
            return skill;
        }

        public void setSkill(String skill) {
            this.skill = skill;
        }

        public int getCurrentLevel() {
            return currentLevel;
        }

        public void setCurrentLevel(int currentLevel) {
            this.currentLevel = currentLevel;
        }

        public int getRequiredLevel() {
            return requiredLevel;
        }

        public void setRequiredLevel(int requiredLevel) {
            this.requiredLevel = requiredLevel;
        }

        public int getGap() {
            return gap;
        }

        public void setGap(int gap) {
            this.gap = gap;
        }

        public String getSeverity() {
            return severity;
        }

        public void setSeverity(String severity) {
            this.severity = severity;
        }
    }
}