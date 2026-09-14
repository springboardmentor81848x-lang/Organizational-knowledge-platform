package com.infosys.knowledgeplatform.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_improvements")
@Data
public class EmployeeImprovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String employeeEmail;

    private String employeeName;
    private String role;
    private String targetRole;
    private Integer overallScore;

    @Lob
    private String gapSummary;

    @Lob
    private String enrolledCourses;

    @Lob
    private String improvementSummary;

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void touchTimestamp() {
        lastUpdated = LocalDateTime.now();
    }
}