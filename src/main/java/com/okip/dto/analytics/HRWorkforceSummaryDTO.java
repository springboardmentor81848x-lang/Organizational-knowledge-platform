package com.okip.dto.analytics;

import java.util.List;
import java.util.Map;

public class HRWorkforceSummaryDTO {
    private long totalEmployees;
    private long totalDepartments;
    private long totalSkillsTracked;
    private long totalTrainingsCompleted;
    private double overallOrgReadiness;
    private double averageGapScore;
    private Map<String, Long> skillCategoryDistribution;
    private Map<String, Long> proficiencyDistribution;
    private List<DepartmentComparisonDTO> departmentSummaries;

    public HRWorkforceSummaryDTO() {}

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

    public long getTotalSkillsTracked() { return totalSkillsTracked; }
    public void setTotalSkillsTracked(long totalSkillsTracked) { this.totalSkillsTracked = totalSkillsTracked; }

    public long getTotalTrainingsCompleted() { return totalTrainingsCompleted; }
    public void setTotalTrainingsCompleted(long totalTrainingsCompleted) { this.totalTrainingsCompleted = totalTrainingsCompleted; }

    public double getOverallOrgReadiness() { return overallOrgReadiness; }
    public void setOverallOrgReadiness(double overallOrgReadiness) { this.overallOrgReadiness = overallOrgReadiness; }

    public double getAverageGapScore() { return averageGapScore; }
    public void setAverageGapScore(double averageGapScore) { this.averageGapScore = averageGapScore; }

    public Map<String, Long> getSkillCategoryDistribution() { return skillCategoryDistribution; }
    public void setSkillCategoryDistribution(Map<String, Long> skillCategoryDistribution) { this.skillCategoryDistribution = skillCategoryDistribution; }

    public Map<String, Long> getProficiencyDistribution() { return proficiencyDistribution; }
    public void setProficiencyDistribution(Map<String, Long> proficiencyDistribution) { this.proficiencyDistribution = proficiencyDistribution; }

    public List<DepartmentComparisonDTO> getDepartmentSummaries() { return departmentSummaries; }
    public void setDepartmentSummaries(List<DepartmentComparisonDTO> departmentSummaries) { this.departmentSummaries = departmentSummaries; }
}
