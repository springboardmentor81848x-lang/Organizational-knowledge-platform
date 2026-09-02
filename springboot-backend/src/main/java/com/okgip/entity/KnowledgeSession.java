package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "host_mentor_id", nullable = false)
    private Employee hostMentor;

    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(name = "session_date", nullable = false)
    private LocalDateTime sessionDate;

    @Column(name = "duration_minutes")
    @Builder.Default
    private Integer durationMinutes = 60;

    @Column(name = "max_capacity")
    @Builder.Default
    private Integer maxCapacity = 25;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "location")
    private String location;

    @Builder.Default
    private String status = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "average_rating")
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(name = "effectiveness_score")
    @Builder.Default
    private Double effectivenessScore = 0.0;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
