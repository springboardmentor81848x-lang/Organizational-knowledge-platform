package com.knowledgegap.dto;

import java.util.List;

public class ManagerAssessmentRequest {

    private Long assessmentId;

    private String employeeIdentifier;

    private String managerIdentifier;

    private List<ManagerAssessmentSkillRequest> skills;

    public ManagerAssessmentRequest() {
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getEmployeeIdentifier() {
        return employeeIdentifier;
    }

    public void setEmployeeIdentifier(
            String employeeIdentifier) {

        this.employeeIdentifier = employeeIdentifier;
    }

    public String getManagerIdentifier() {
        return managerIdentifier;
    }

    public void setManagerIdentifier(
            String managerIdentifier) {

        this.managerIdentifier = managerIdentifier;
    }

    public List<ManagerAssessmentSkillRequest> getSkills() {
        return skills;
    }

    public void setSkills(
            List<ManagerAssessmentSkillRequest> skills) {

        this.skills = skills;
    }
}