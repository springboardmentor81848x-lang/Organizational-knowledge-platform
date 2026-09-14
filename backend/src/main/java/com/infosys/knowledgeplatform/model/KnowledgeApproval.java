package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_approvals")
@Data
public class KnowledgeApproval {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    private String type; // ARCHITECTURE_GUIDELINES, COMPLIANCE_STANDARD, INFRASTRUCTURE_SOP, FRONTEND_STANDARD, etc.
    
    private String authorEmail;
    
    private String authorName;
    
    private String teamName;
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private String status; // PENDING_REVIEW, APPROVED, REJECTED, ARCHIVED
    
    private String reviewedBy;
    
    private LocalDateTime reviewedDate;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
