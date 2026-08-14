package com.knowledgeiq.dto;

import java.util.List;
import java.util.UUID;

public class RoleMappingDto {
    private String roleTitle;
    private String roleDescription;
    private String departmentName;
    private String departmentDescription;
    private List<BenchmarkMappingItem> benchmarks;

    public RoleMappingDto() {}

    public RoleMappingDto(String roleTitle, String roleDescription, String departmentName, String departmentDescription, List<BenchmarkMappingItem> benchmarks) {
        this.roleTitle = roleTitle;
        this.roleDescription = roleDescription;
        this.departmentName = departmentName;
        this.departmentDescription = departmentDescription;
        this.benchmarks = benchmarks;
    }

    public String getRoleTitle() { return roleTitle; }
    public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }

    public String getRoleDescription() { return roleDescription; }
    public void setRoleDescription(String roleDescription) { this.roleDescription = roleDescription; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentDescription() { return departmentDescription; }
    public void setDepartmentDescription(String departmentDescription) { this.departmentDescription = departmentDescription; }

    public List<BenchmarkMappingItem> getBenchmarks() { return benchmarks; }
    public void setBenchmarks(List<BenchmarkMappingItem> benchmarks) { this.benchmarks = benchmarks; }

    public static class BenchmarkMappingItem {
        private UUID skillId;
        private String skillName;
        private String categoryName;
        private Integer requiredLevel;
        private Integer actualLevel;
        private Integer gapPercent;
        private Boolean isCritical;

        public BenchmarkMappingItem() {}

        public BenchmarkMappingItem(UUID skillId, String skillName, String categoryName, Integer requiredLevel, Integer actualLevel, Integer gapPercent, Boolean isCritical) {
            this.skillId = skillId;
            this.skillName = skillName;
            this.categoryName = categoryName;
            this.requiredLevel = requiredLevel;
            this.actualLevel = actualLevel;
            this.gapPercent = gapPercent;
            this.isCritical = isCritical;
        }

        public UUID getSkillId() { return skillId; }
        public void setSkillId(UUID skillId) { this.skillId = skillId; }

        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public Integer getRequiredLevel() { return requiredLevel; }
        public void setRequiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; }

        public Integer getActualLevel() { return actualLevel; }
        public void setActualLevel(Integer actualLevel) { this.actualLevel = actualLevel; }

        public Integer getGapPercent() { return gapPercent; }
        public void setGapPercent(Integer gapPercent) { this.gapPercent = gapPercent; }

        public Boolean getIsCritical() { return isCritical; }
        public void setIsCritical(Boolean isCritical) { this.isCritical = isCritical; }
    }
}
