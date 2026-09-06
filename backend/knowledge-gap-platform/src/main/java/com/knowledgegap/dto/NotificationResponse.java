package com.knowledgegap.dto;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private String employeeId;
    private String type;
    private String message;
    private boolean readStatus;
    private LocalDateTime createdDate;

    public NotificationResponse() {
    }

    public NotificationResponse(
            Long id,
            String employeeId,
            String type,
            String message,
            boolean readStatus,
            LocalDateTime createdDate) {

        this.id = id;
        this.employeeId = employeeId;
        this.type = type;
        this.message = message;
        this.readStatus = readStatus;
        this.createdDate = createdDate;
    }

    public Long getId() {
        return id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public boolean isReadStatus() {
        return readStatus;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
}