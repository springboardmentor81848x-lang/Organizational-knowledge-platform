package com.kgap.intel.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class ChatMessageItem implements Serializable {
    @SerializedName("id")
    private Long id;

    @SerializedName("senderId")
    private Long senderId;

    @SerializedName("senderName")
    private String senderName;

    @SerializedName("recipientId")
    private Long recipientId;

    @SerializedName("message")
    private String message;

    @SerializedName("isRead")
    private Boolean isRead;

    @SerializedName("createdAt")
    private String createdAt;

    public ChatMessageItem() {}

    public ChatMessageItem(Long senderId, String senderName, Long recipientId, String message) {
        this.senderId = senderId;
        this.senderName = senderName;
        this.recipientId = recipientId;
        this.message = message;
        this.isRead = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
