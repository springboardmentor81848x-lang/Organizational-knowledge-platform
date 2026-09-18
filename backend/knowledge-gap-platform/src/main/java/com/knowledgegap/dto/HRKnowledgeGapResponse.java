package com.knowledgegap.dto;

import java.util.List;

public class HRKnowledgeGapResponse {

    private long totalEmployees;
    private long employeesWithGaps;
    private long totalKnowledgeGaps;
    private double averageGap;
    private long criticalGaps;

    private GapDistribution gapDistribution;
    private List<TopSkillGap> topSkills;
    private List<EmployeeGapAnalysis> employeePerformance;

    public HRKnowledgeGapResponse() {
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getEmployeesWithGaps() {
        return employeesWithGaps;
    }

    public void setEmployeesWithGaps(long employeesWithGaps) {
        this.employeesWithGaps = employeesWithGaps;
    }

    public long getTotalKnowledgeGaps() {
        return totalKnowledgeGaps;
    }

    public void setTotalKnowledgeGaps(long totalKnowledgeGaps) {
        this.totalKnowledgeGaps = totalKnowledgeGaps;
    }

    public double getAverageGap() {
        return averageGap;
    }

    public void setAverageGap(double averageGap) {
        this.averageGap = averageGap;
    }

    public long getCriticalGaps() {
        return criticalGaps;
    }

    public void setCriticalGaps(long criticalGaps) {
        this.criticalGaps = criticalGaps;
    }

    public GapDistribution getGapDistribution() {
        return gapDistribution;
    }

    public void setGapDistribution(GapDistribution gapDistribution) {
        this.gapDistribution = gapDistribution;
    }

    public List<TopSkillGap> getTopSkills() {
        return topSkills;
    }

    public void setTopSkills(List<TopSkillGap> topSkills) {
        this.topSkills = topSkills;
    }

    public List<EmployeeGapAnalysis> getEmployeePerformance() {
        return employeePerformance;
    }

    public void setEmployeePerformance(List<EmployeeGapAnalysis> employeePerformance) {
        this.employeePerformance = employeePerformance;
    }


    // ==========================================
    // Gap Distribution
    // ==========================================

    public static class GapDistribution {

        private long low;
        private long medium;
        private long high;
        private long critical;

        public long getLow() {
            return low;
        }

        public void setLow(long low) {
            this.low = low;
        }

        public long getMedium() {
            return medium;
        }

        public void setMedium(long medium) {
            this.medium = medium;
        }

        public long getHigh() {
            return high;
        }

        public void setHigh(long high) {
            this.high = high;
        }

        public long getCritical() {
            return critical;
        }

        public void setCritical(long critical) {
            this.critical = critical;
        }
    }


    // ==========================================
    // Top Skill Gap
    // ==========================================

    public static class TopSkillGap {

        private String skill;
        private long employeesAffected;
        private double averageGap;

        public TopSkillGap() {
        }

        public TopSkillGap(
                String skill,
                long employeesAffected,
                double averageGap) {

            this.skill = skill;
            this.employeesAffected = employeesAffected;
            this.averageGap = averageGap;
        }

        public String getSkill() {
            return skill;
        }

        public void setSkill(String skill) {
            this.skill = skill;
        }

        public long getEmployeesAffected() {
            return employeesAffected;
        }

        public void setEmployeesAffected(long employeesAffected) {
            this.employeesAffected = employeesAffected;
        }

        public double getAverageGap() {
            return averageGap;
        }

        public void setAverageGap(double averageGap) {
            this.averageGap = averageGap;
        }
    }


    // ==========================================
    // Employee Gap Analysis
    // ==========================================

    public static class EmployeeGapAnalysis {

        private String employeeId;
        private String employeeName;
        private String designation;
        private double averageSkillLevel;
        private double averageGap;
        private String gapStatus;

        public EmployeeGapAnalysis() {
        }

        public EmployeeGapAnalysis(
                String employeeId,
                String employeeName,
                String designation,
                double averageSkillLevel,
                double averageGap,
                String gapStatus) {

            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.designation = designation;
            this.averageSkillLevel = averageSkillLevel;
            this.averageGap = averageGap;
            this.gapStatus = gapStatus;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public void setEmployeeName(String employeeName) {
            this.employeeName = employeeName;
        }

        public String getDesignation() {
            return designation;
        }

        public void setDesignation(String designation) {
            this.designation = designation;
        }

        public double getAverageSkillLevel() {
            return averageSkillLevel;
        }

        public void setAverageSkillLevel(double averageSkillLevel) {
            this.averageSkillLevel = averageSkillLevel;
        }

        public double getAverageGap() {
            return averageGap;
        }

        public void setAverageGap(double averageGap) {
            this.averageGap = averageGap;
        }

        public String getGapStatus() {
            return gapStatus;
        }

        public void setGapStatus(String gapStatus) {
            this.gapStatus = gapStatus;
        }
    }
}