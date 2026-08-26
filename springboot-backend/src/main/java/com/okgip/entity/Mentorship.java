package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mentorships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mentorship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mentor_id", nullable = false)
    private Employee mentor;

    @ManyToOne
    @JoinColumn(name = "mentee_id", nullable = false)
    private Employee mentee;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    private String goal;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Builder.Default
    private String status = "REQUESTED"; // REQUESTED, ACCEPTED, REJECTED, ACTIVE, COMPLETED, CANCELLED

    private Integer rating; // 1-5 rating after completion

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
