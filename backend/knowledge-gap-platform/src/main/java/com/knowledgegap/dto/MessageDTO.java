package com.knowledgegap.dto;

import java.time.LocalDateTime;

public class MessageDTO {

    private Long id;
    private Long peerMentorshipId;
    private Long senderId;
    private String senderEmployeeId;
    private String senderName;
    private Long receiverId;
    private String receiverEmployeeId;
    private String receiverName;
    private String message;
    private LocalDateTime sentAt;
    private Boolean readStatus;
    private String skillName;

    public MessageDTO() {
    }

    public MessageDTO(Long id, Long peerMentorshipId, Long senderId, String senderEmployeeId, String senderName,
                      Long receiverId, String receiverEmployeeId, String receiverName,
                      String message, LocalDateTime sentAt, Boolean readStatus, String skillName) {
        this.id = id;
        this.peerMentorshipId = peerMentorshipId;
        this.senderId = senderId;
        this.senderEmployeeId = senderEmployeeId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.receiverEmployeeId = receiverEmployeeId;
        this.receiverName = receiverName;
        this.message = message;
        this.sentAt = sentAt;
        this.readStatus = readStatus;
        this.skillName = skillName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPeerMentorshipId() {
        return peerMentorshipId;
    }

    public void setPeerMentorshipId(Long peerMentorshipId) {
        this.peerMentorshipId = peerMentorshipId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderEmployeeId() {
        return senderEmployeeId;
    }

    public void setSenderEmployeeId(String senderEmployeeId) {
        this.senderEmployeeId = senderEmployeeId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getReceiverEmployeeId() {
        return receiverEmployeeId;
    }

    public void setReceiverEmployeeId(String receiverEmployeeId) {
        this.receiverEmployeeId = receiverEmployeeId;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public Boolean getReadStatus() {
        return readStatus;
    }

    public void setReadStatus(Boolean readStatus) {
        this.readStatus = readStatus;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }
}
