package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "training_programs")
@Data
public class TrainingProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String provider; 
    private String url;
    private String targetSkillCategory;
    private int durationHours;
}
