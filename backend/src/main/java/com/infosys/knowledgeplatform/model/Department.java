package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Data
public class Department {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String name;
    
    private String code;
    
    private String description;
    
    private String headEmail;
    
    private Integer totalEmployees;
    
    private Double avgCompetencyGap;
    
    private Double trainingVelocity;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
