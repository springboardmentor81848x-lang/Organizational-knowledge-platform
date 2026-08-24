package com.knowledgeiq.repository;

import com.knowledgeiq.model.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, UUID> {
    List<CommunityPost> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);
    List<CommunityPost> findAllByOrderByCreatedAtDesc();
}
