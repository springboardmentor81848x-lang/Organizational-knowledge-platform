package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "assessments")
@Data
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // SELF, PEER, MANAGER

    @ManyToOne
    @JoinColumn(name = "target_skill_id", nullable = false)
    private Skill targetSkill;

    @Column(nullable = false)
    private String title;

    @Lob
    private String description;
}
