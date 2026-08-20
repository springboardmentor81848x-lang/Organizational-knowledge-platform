package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "knowledge_session_registrations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "user_id"})
})
public class KnowledgeSessionRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private KnowledgeSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "attendance_status", nullable = false, length = 30)
    private String attendanceStatus = "REGISTERED"; // REGISTERED, ATTENDED, ABSENT, CANCELLED

    @Column(name = "registered_at")
    private ZonedDateTime registeredAt = ZonedDateTime.now();

    public KnowledgeSessionRegistration() {}

    public KnowledgeSessionRegistration(KnowledgeSession session, User user) {
        this.session = session;
        this.user = user;
        this.attendanceStatus = "REGISTERED";
        this.registeredAt = ZonedDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public KnowledgeSession getSession() { return session; }
    public void setSession(KnowledgeSession session) { this.session = session; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

    public ZonedDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(ZonedDateTime registeredAt) { this.registeredAt = registeredAt; }
}
