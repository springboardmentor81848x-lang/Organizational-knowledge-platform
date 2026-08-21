package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
    @UniqueConstraint(name = "uk_enrollment_user_program", columnNames = {"user_id", "program_id"})
})
@Data
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "program_id")
    private TrainingProgram program;

    private String employeeEmail; // Deprecated, kept for backward compatibility

    private String programTitle;

    private String provider;

    private String status; // enrolled | in_progress | completed

    @Min(0)
    @Max(100)
    private Integer progressPercent;

    private LocalDateTime enrolledAt;

    private LocalDateTime completedAt;
}
