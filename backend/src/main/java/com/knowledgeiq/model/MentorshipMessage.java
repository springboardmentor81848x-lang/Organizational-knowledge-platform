package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mentorship_messages")
public class MentorshipMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mentorship_id", nullable = false)
    private Mentorship mentorship;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "message_type", length = 30)
    private String messageType = "TEXT"; // TEXT, MEETING_LINK, RESOURCE

    @Column(name = "resource_url", length = 500)
    private String resourceUrl;

    @Column(name = "resource_title", length = 200)
    private String resourceTitle;

    @Column(name = "read_status")
    private Boolean readStatus = false;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    public MentorshipMessage() {}

    public MentorshipMessage(Mentorship mentorship, User sender, User receiver, String message) {
        this.mentorship = mentorship;
        this.sender = sender;
        this.receiver = receiver;
        this.message = message;
        this.messageType = "TEXT";
        this.createdAt = ZonedDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Mentorship getMentorship() { return mentorship; }
    public void setMentorship(Mentorship mentorship) { this.mentorship = mentorship; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

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
