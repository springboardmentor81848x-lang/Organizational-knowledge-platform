package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String employeeEmail;

    private Long programId;

    private String programTitle;

    private String provider;

    private String status; // enrolled | in_progress | completed

    private Integer progressPercent;

    private LocalDateTime enrolledAt;

    private LocalDateTime completedAt;
}
