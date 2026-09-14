package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "department_teams")
@Data
public class DepartmentTeam {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String name;
    
    private String description;
    
    private String teamLeadEmail;
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    
    private Integer membersCount;
    
    private Double avgCompetencyGap;
    
    private Double trainingProgress;
    
    private Integer activeProjects;
    
    private Integer criticalGaps;
    
    private String status; // ACTIVE, INACTIVE, NEEDS_SUPPORT
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
