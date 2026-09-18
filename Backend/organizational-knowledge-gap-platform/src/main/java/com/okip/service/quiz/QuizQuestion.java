package com.okip.service.quiz;

import java.util.List;

public class QuizQuestion {
    private String id;
    private String question;
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    private List<String> options;
    private int correctOptionIndex; // 0-based index

    public QuizQuestion() {}

    public QuizQuestion(String id, String question, String difficulty, List<String> options, int correctOptionIndex) {
        this.id = id;
        this.question = question;
        this.difficulty = difficulty;
        this.options = options;
        this.correctOptionIndex = correctOptionIndex;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public int getCorrectOptionIndex() { return correctOptionIndex; }
    public void setCorrectOptionIndex(int correctOptionIndex) { this.correctOptionIndex = correctOptionIndex; }
}
