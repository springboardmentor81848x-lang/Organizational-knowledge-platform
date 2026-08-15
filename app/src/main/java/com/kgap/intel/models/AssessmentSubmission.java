package com.kgap.intel.models;

import java.util.List;

public class AssessmentSubmission {
    private Long employeeId;
    private List<Answer> answers;

    public AssessmentSubmission(Long employeeId, List<Answer> answers) {
        this.employeeId = employeeId;
        this.answers = answers;
    }

    public static class Answer {
        private Long questionId;
        private String selectedAnswer;

        public Answer(Long questionId, String selectedAnswer) {
            this.questionId = questionId;
            this.selectedAnswer = selectedAnswer;
        }
    }
}
