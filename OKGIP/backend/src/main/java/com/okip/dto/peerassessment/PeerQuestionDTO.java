package com.okip.dto.peerassessment;

public class PeerQuestionDTO {

    private Long questionId;
    private String questionType;
    private String questionText;
    private Integer marks;
    private Integer questionOrder;

    public PeerQuestionDTO() {
    }

    public PeerQuestionDTO(
            Long questionId,
            String questionType,
            String questionText,
            Integer marks,
            Integer questionOrder) {

        this.questionId = questionId;
        this.questionType = questionType;
        this.questionText = questionText;
        this.marks = marks;
        this.questionOrder = questionOrder;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public Integer getMarks() {
        return marks;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }
}