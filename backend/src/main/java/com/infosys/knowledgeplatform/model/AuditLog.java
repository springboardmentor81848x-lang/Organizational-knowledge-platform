package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String action;

    private String entityType;

    private String entityId;

    private Instant createdAt = Instant.now();

    @Lob
    private String metadata;
}
