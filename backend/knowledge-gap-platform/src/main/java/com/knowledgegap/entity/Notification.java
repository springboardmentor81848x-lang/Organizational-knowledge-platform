package com.knowledgegap.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Employee who receives the notification
    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private Employee recipient;

    // Example: MENTORSHIP_REQUEST
    private String type;

    // Notification message
    @Column(nullable = false)
    private String message;

    // false = unread, true = read
    @Column(nullable = false)
    private boolean readStatus = false;

    // Notification creation time
    @Column(nullable = false)
    private LocalDateTime createdDate;

    public Notification() {
    }

    public Long getId() {
        return id;
    }

    public Employee getRecipient() {
        return recipient;
    }

    public void setRecipient(Employee recipient) {
        this.recipient = recipient;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isReadStatus() {
        return readStatus;
    }

    public void setReadStatus(boolean readStatus) {
        this.readStatus = readStatus;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}