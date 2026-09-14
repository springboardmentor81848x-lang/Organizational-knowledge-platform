package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_items")
@Data
public class KnowledgeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String authorEmail;

    private String category; // technical | soft-skills | domain | tools | process

    private String tags; // comma-separated tags

    private String visibility; // public | private | team

    private Integer viewCount = 0;

    private Integer helpfulCount = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private String status; // active | archived | draft

    private String attachmentUrl; // URL to PDF, doc, etc.

    private Integer rating = 0; // average rating out of 5

    private Integer ratingCount = 0;
}
