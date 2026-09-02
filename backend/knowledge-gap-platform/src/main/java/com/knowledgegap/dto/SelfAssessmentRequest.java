package com.knowledgegap.dto;

import java.util.List;

public class SelfAssessmentRequest {

    private Long employeeId;

    private List<SkillAssessmentRequest> skills;

    public SelfAssessmentRequest() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public List<SkillAssessmentRequest> getSkills() {
        return skills;
    }

    public void setSkills(List<SkillAssessmentRequest> skills) {
        this.skills = skills;
    }
}