package com.okip.dto.peerassessment;

import java.util.List;

public class PeerAssessmentDTO {

    private Long assessmentId;
    private Long employeeId;
    private String employeeName;

    private Long skillId;
    private String skillName;

    private String assessmentName;
    private Integer totalMarks;

    private List<PeerQuestionDTO> questions;

    public PeerAssessmentDTO() {
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

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

    public String getAssessmentName() {
        return assessmentName;
    }

    public void setAssessmentName(String assessmentName) {
        this.assessmentName = assessmentName;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public List<PeerQuestionDTO> getQuestions() {
        return questions;
    }

    public void setQuestions(List<PeerQuestionDTO> questions) {
        this.questions = questions;
    }
}