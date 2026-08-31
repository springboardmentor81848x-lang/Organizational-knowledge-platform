package com.knowledgegap.dto;

public class SendMessageRequest {

    private Long mentorshipId;
    private String senderEmployeeId;
    private String message;

    public SendMessageRequest() {
    }

    public SendMessageRequest(Long mentorshipId, String senderEmployeeId, String message) {
        this.mentorshipId = mentorshipId;
        this.senderEmployeeId = senderEmployeeId;
        this.message = message;
    }

    public Long getMentorshipId() {
        return mentorshipId;
    }

    public void setMentorshipId(Long mentorshipId) {
        this.mentorshipId = mentorshipId;
    }

    public String getSenderEmployeeId() {
        return senderEmployeeId;
    }

    public void setSenderEmployeeId(String senderEmployeeId) {
        this.senderEmployeeId = senderEmployeeId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
