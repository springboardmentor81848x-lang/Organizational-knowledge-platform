package com.okip.dto.assessment;

import java.util.Map;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SkillAssessmentRequestDTO {
    private Long employeeId; // if null, defaults to logged-in user (self-assessment)

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotBlank(message = "Assessment type is required (SELF, PEER, MANAGER)")
    private String assessmentType;

    private String assessedProficiency; // calculated authoritatively by backend for SELF

    private Integer score; // calculated authoritatively by backend for SELF
    private String comments;

    private Map<String, Integer> quizAnswers; // Map of questionId -> selectedOptionIndex (0-3)

    public SkillAssessmentRequestDTO() {}

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }

    public String getAssessedProficiency() { return assessedProficiency; }
    public void setAssessedProficiency(String assessedProficiency) { this.assessedProficiency = assessedProficiency; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public Map<String, Integer> getQuizAnswers() { return quizAnswers; }
    public void setQuizAnswers(Map<String, Integer> quizAnswers) { this.quizAnswers = quizAnswers; }
}
