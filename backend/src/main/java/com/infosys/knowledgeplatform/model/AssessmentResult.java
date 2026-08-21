package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_results")
@Data
public class AssessmentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne
    @JoinColumn(name = "evaluator_id", nullable = false)
    private User evaluator;

    @ManyToOne
    @JoinColumn(name = "evaluatee_id", nullable = false)
    private User evaluatee;

    @Column(nullable = false)
    private int score; // 1 to 5

    @Lob
    private String feedback;

    @Column(nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();
}
