package com.kgap.intel.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class NotificationItem implements Serializable {

    @SerializedName("id")
    private Long id;

    @SerializedName(value = "employeeId", alternate = {"recipientId"})
    private Long recipientId;

    @SerializedName("title")
    private String title;

    @SerializedName("type")
    private String type;

    @SerializedName("message")
    private String message;

    @SerializedName(value = "readStatus", alternate = {"isRead"})
    private Boolean isRead;

    @SerializedName("createdAt")
    private String createdAt;

    public NotificationItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead != null && isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
