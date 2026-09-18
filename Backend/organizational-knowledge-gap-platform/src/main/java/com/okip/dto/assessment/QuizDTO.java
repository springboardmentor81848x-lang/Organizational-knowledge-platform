package com.okip.dto.assessment;

import java.util.List;

public class QuizDTO {
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private int totalQuestions;
    private List<QuizQuestionDTO> questions;

    public QuizDTO() {}

    public QuizDTO(Long skillId, String skillName, String skillCategory, int totalQuestions, List<QuizQuestionDTO> questions) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.skillCategory = skillCategory;
        this.totalQuestions = totalQuestions;
        this.questions = questions;
    }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getSkillCategory() { return skillCategory; }
    public void setSkillCategory(String skillCategory) { this.skillCategory = skillCategory; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public List<QuizQuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestionDTO> questions) { this.questions = questions; }
}
