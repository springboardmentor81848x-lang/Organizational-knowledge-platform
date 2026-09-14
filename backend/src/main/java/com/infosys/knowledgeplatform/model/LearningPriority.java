package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_priorities")
@Data
public class LearningPriority {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String skillName;
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    
    private String targetTeams; // Comma-separated team names or team IDs
    
    private Integer targetProficiencyLevel; // 0-100
    
    private Integer currentAvgProficiency; // 0-100
    
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW
    
    private LocalDate targetDate;
    
    private Integer progressPercentage; // 0-100
    
    private String status; // PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED
    
    private Integer enrolledLearners;
    
    private Integer completedLearners;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
