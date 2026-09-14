package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String employeeEmail;

    private Long knowledgeItemId;

    private String itemTitle;

    private Integer rating; // 1-5 stars

    @Column(columnDefinition = "TEXT")
    private String comment;

    private String category; // relevance | clarity | completeness | usefulness | accuracy

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private Integer helpfulCount = 0; // how many found this feedback helpful

    private Boolean isAnonymous = false;

    private String status; // active | reported | removed
}
