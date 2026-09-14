package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(name = "employee_skills")
@Data
public class EmployeeSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String employeeEmail;

    private Long skillId;

    private String skillName;

    private Integer proficiency; // 1-4 mapping to Beginner..Expert

    private Integer targetProficiency;

    private Instant updatedAt = Instant.now();
}
