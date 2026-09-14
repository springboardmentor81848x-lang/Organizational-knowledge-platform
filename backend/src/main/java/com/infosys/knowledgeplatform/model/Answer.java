package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "answers")
@Data
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long questionId;

    private String answererEmail;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private Integer upvoteCount = 0;

    private Integer downvoteCount = 0;

    private Boolean isAccepted = false;

    private String status; // active | archived | reported | removed

    private Integer helpfulCount = 0; // how many found this answer helpful

    private String expertise; // level of expertise (beginner | intermediate | expert)

    private Integer answerRating = 0; // average rating for this answer (1-5)

    private Integer ratingCount = 0;
}
