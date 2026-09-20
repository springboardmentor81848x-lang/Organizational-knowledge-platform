package com.okip.dto.assessment;

import java.util.List;

public class QuizQuestionDTO {
    private String id;
    private String question;
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    private List<String> options;

    public QuizQuestionDTO() {}

    public QuizQuestionDTO(String id, String question, String difficulty, List<String> options) {
        this.id = id;
        this.question = question;
        this.difficulty = difficulty;
        this.options = options;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
}
