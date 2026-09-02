package com.knowledgegap.dto;

public class AssessmentQuestionResponse {

    private Long id;
    private String skillName;
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String difficulty;
    private Integer marks;

    public AssessmentQuestionResponse() {
    }

    public AssessmentQuestionResponse(
            Long id,
            String skillName,
            String question,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String difficulty,
            Integer marks) {

        this.id = id;
        this.skillName = skillName;
        this.question = question;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.difficulty = difficulty;
        this.marks = marks;
    }

    public Long getId() {
        return id;
    }

    public String getSkillName() {
        return skillName;
    }

    public String getQuestion() {
        return question;
    }

    public String getOptionA() {
        return optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public Integer getMarks() {
        return marks;
    }
}