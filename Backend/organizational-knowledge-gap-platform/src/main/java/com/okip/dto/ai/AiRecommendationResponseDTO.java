package com.okip.dto.ai;

import java.util.List;

public class AiRecommendationResponseDTO {

    private Long employeeId;

    private String employeeCode;

    private String employeeName;

    private List<PriorityGapDTO> priorityGaps;

    private List<LearningPathDTO> learningPath;

    private List<RecommendedCourseDTO> recommendedCourses;

    public AiRecommendationResponseDTO() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public List<PriorityGapDTO> getPriorityGaps() {
        return priorityGaps;
    }

    public void setPriorityGaps(List<PriorityGapDTO> priorityGaps) {
        this.priorityGaps = priorityGaps;
    }

    public List<LearningPathDTO> getLearningPath() {
        return learningPath;
    }

    public void setLearningPath(List<LearningPathDTO> learningPath) {
        this.learningPath = learningPath;
    }

    public List<RecommendedCourseDTO> getRecommendedCourses() {
        return recommendedCourses;
    }

    public void setRecommendedCourses(
            List<RecommendedCourseDTO> recommendedCourses) {

        this.recommendedCourses = recommendedCourses;
    }
}