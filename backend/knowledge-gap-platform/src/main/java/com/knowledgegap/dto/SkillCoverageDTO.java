package com.knowledgegap.dto;

import java.util.List;

public class SkillCoverageDTO {

    // =========================================================
    // SUMMARY
    // =========================================================

    private long totalSkills;
    private long wellCoveredSkills;
    private long partiallyCoveredSkills;
    private long criticalCoverageSkills;

    // =========================================================
    // SKILL DETAILS
    // =========================================================

    private List<SkillCoverageItemDTO> skills;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SkillCoverageDTO() {
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public long getTotalSkills() {
        return totalSkills;
    }

    public void setTotalSkills(long totalSkills) {
        this.totalSkills = totalSkills;
    }

    public long getWellCoveredSkills() {
        return wellCoveredSkills;
    }

    public void setWellCoveredSkills(long wellCoveredSkills) {
        this.wellCoveredSkills = wellCoveredSkills;
    }

    public long getPartiallyCoveredSkills() {
        return partiallyCoveredSkills;
    }

    public void setPartiallyCoveredSkills(long partiallyCoveredSkills) {
        this.partiallyCoveredSkills = partiallyCoveredSkills;
    }

    public long getCriticalCoverageSkills() {
        return criticalCoverageSkills;
    }

    public void setCriticalCoverageSkills(long criticalCoverageSkills) {
        this.criticalCoverageSkills = criticalCoverageSkills;
    }

    public List<SkillCoverageItemDTO> getSkills() {
        return skills;
    }

    public void setSkills(List<SkillCoverageItemDTO> skills) {
        this.skills = skills;
    }

    // =========================================================
    // INNER DTO
    // =========================================================

    public static class SkillCoverageItemDTO {

        private Long skillId;
        private String skillName;
        private String category;

        private long employeeCount;

        private double averageLevel;

        private int requiredLevel;

        private double coveragePercentage;

        private String status;

        // -----------------------------------------------------
        // CONSTRUCTOR
        // -----------------------------------------------------

        public SkillCoverageItemDTO() {
        }

        // -----------------------------------------------------
        // GETTERS / SETTERS
        // -----------------------------------------------------

        public Long getSkillId() {
            return skillId;
        }

        public void setSkillId(Long skillId) {
            this.skillId = skillId;
        }

        public String getSkillName() {
            return skillName;
        }

        public void setSkillName(String skillName) {
            this.skillName = skillName;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public long getEmployeeCount() {
            return employeeCount;
        }

        public void setEmployeeCount(long employeeCount) {
            this.employeeCount = employeeCount;
        }

        public double getAverageLevel() {
            return averageLevel;
        }

        public void setAverageLevel(double averageLevel) {
            this.averageLevel = averageLevel;
        }

        public int getRequiredLevel() {
            return requiredLevel;
        }

        public void setRequiredLevel(int requiredLevel) {
            this.requiredLevel = requiredLevel;
        }

        public double getCoveragePercentage() {
            return coveragePercentage;
        }

        public void setCoveragePercentage(double coveragePercentage) {
            this.coveragePercentage = coveragePercentage;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}