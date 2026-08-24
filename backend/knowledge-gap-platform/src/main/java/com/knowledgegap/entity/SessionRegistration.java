package com.knowledgegap.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "session_registrations",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"session_id", "employee_id"})
    }
)
public class SessionRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Knowledge session for which the employee registered
    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private KnowledgeSession session;

    // Employee who registered for the session
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // Date and time when the employee registered
    @Column(nullable = false)
    private LocalDateTime registeredAt;

    // REGISTERED or CANCELLED
    @Column(nullable = false)
    private String status;

    // Whether the employee attended the session
    @Column(nullable = false)
    private Boolean attended = false;

    public SessionRegistration() {
    }

    public Long getId() {
        return id;
    }

    public KnowledgeSession getSession() {
        return session;
    }

    public void setSession(KnowledgeSession session) {
        this.session = session;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getAttended() {
        return attended;
    }

    public void setAttended(Boolean attended) {
        this.attended = attended;
    }
}