package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@Data
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String askerEmail;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String topic; // technical | process | domain | general

    private String status; // open | in_progress | resolved | closed

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;

    private Integer viewCount = 0;

    private Integer answerCount = 0;

    private Integer upvoteCount = 0;

    private String tags; // comma-separated tags

    private String relatedSkills; // comma-separated related skills

    private Boolean isAnswered = false;

    private Long acceptedAnswerId; // ID of the accepted answer
}
