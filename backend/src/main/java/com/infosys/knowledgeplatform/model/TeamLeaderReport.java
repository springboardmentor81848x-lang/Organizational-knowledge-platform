package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_leader_reports")
@Data
public class TeamLeaderReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "team_id")
    private DepartmentTeam team;
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    
    private String submittedByEmail;
    
    private String submittedByName;
    
    @Column(columnDefinition = "TEXT")
    private String highlights;
    
    @Column(columnDefinition = "TEXT")
    private String challenges;
    
    @Column(columnDefinition = "TEXT")
    private String recommendations;
    
    private String status; // PENDING, REVIEWED, ACTION_TAKEN, RESOLVED
    
    private Integer riskLevel; // 0-10, where 10 is highest risk
    
    private String reviewedBy;
    
    private LocalDateTime reviewedDate;
    
    private LocalDateTime submittedDate;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
