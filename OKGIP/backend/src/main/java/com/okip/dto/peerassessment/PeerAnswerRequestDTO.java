package com.okip.dto.peerassessment;

public class PeerAnswerRequestDTO {

    private Long questionId;
    private Integer rating;

    public PeerAnswerRequestDTO() {
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }
}