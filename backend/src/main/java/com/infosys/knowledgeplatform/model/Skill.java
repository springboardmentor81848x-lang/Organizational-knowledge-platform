package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "skills")
@Data
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    private String category;

    @Column(length = 2000)
    private String description;

    private String skillType; // technical, soft, domain

    private Integer criticality; // 1-5
}
