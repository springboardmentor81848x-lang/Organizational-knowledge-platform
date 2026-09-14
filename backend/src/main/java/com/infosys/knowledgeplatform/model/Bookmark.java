package com.infosys.knowledgeplatform.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookmarks")
@Data
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String employeeEmail;

    private Long knowledgeItemId;

    private String itemTitle;

    private String itemAuthor;

    private String itemCategory;

    private LocalDateTime bookmarkedAt = LocalDateTime.now();

    private String folderName; // for organizing bookmarks (e.g., "Python Tips", "Design Patterns")

    private String notes; // personal notes about the bookmark

    private Boolean isActive = true;
}
