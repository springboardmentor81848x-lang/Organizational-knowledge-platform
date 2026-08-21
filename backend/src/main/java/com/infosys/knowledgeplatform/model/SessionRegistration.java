package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_registrations")
@Data
public class SessionRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private KnowledgeSession session;

    @ManyToOne
    @JoinColumn(name = "attendee_id", nullable = false)
    private User attendee;

    @Column(nullable = false)
    private String status = "REGISTERED";

    @Column(nullable = false)
    private LocalDateTime registeredAt = LocalDateTime.now();
}
