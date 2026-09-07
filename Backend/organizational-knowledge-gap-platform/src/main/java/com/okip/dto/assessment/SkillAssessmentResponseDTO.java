package com.okip.dto.assessment;

import java.time.LocalDateTime;

public class SkillAssessmentResponseDTO {
    private Long assessmentId;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String employeeDepartment;
    private Long evaluatorId;
    private String evaluatorName;
    private Long skillId;
    private String skillName;
    private String assessmentType;
    private String assessedProficiency;
    private Integer score;
    private String comments;
    private String status;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerComments;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;

    public SkillAssessmentResponseDTO() {}

    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getEmployeeDepartment() { return employeeDepartment; }
    public void setEmployeeDepartment(String employeeDepartment) { this.employeeDepartment = employeeDepartment; }

    public Long getEvaluatorId() { return evaluatorId; }
    public void setEvaluatorId(Long evaluatorId) { this.evaluatorId = evaluatorId; }

    public String getEvaluatorName() { return evaluatorName; }
    public void setEvaluatorName(String evaluatorName) { this.evaluatorName = evaluatorName; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }

    public String getAssessedProficiency() { return assessedProficiency; }
    public void setAssessedProficiency(String assessedProficiency) { this.assessedProficiency = assessedProficiency; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getReviewerId() { return reviewerId; }
    public void setReviewerId(Long reviewerId) { this.reviewerId = reviewerId; }

    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }

    public String getReviewerComments() { return reviewerComments; }
    public void setReviewerComments(String reviewerComments) { this.reviewerComments = reviewerComments; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
