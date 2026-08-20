package com.knowledgeiq.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

public class MentorshipMessageDto {
    private UUID id;
    private UUID mentorshipId;
    private UUID senderId;
    private String senderName;
    private String senderAvatar;
    private UUID receiverId;
    private String receiverName;
    private String message;
    private String messageType;
    private String resourceUrl;
    private String resourceTitle;
    private Boolean readStatus;
    private ZonedDateTime createdAt;

    public MentorshipMessageDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getMentorshipId() { return mentorshipId; }
    public void setMentorshipId(UUID mentorshipId) { this.mentorshipId = mentorshipId; }

    public UUID getSenderId() { return senderId; }
    public void setSenderId(UUID senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderAvatar() { return senderAvatar; }
    public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }

    public UUID getReceiverId() { return receiverId; }
    public void setReceiverId(UUID receiverId) { this.receiverId = receiverId; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public String getResourceUrl() { return resourceUrl; }
    public void setResourceUrl(String resourceUrl) { this.resourceUrl = resourceUrl; }

    public String getResourceTitle() { return resourceTitle; }
    public void setResourceTitle(String resourceTitle) { this.resourceTitle = resourceTitle; }

    public Boolean getReadStatus() { return readStatus; }
    public void setReadStatus(Boolean readStatus) { this.readStatus = readStatus; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
