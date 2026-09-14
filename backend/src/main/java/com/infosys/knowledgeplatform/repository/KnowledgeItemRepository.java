package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.KnowledgeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeItemRepository extends JpaRepository<KnowledgeItem, Long> {

    @Query("SELECT k FROM KnowledgeItem k WHERE k.status = 'active' ORDER BY k.createdAt DESC LIMIT :limit")
    List<KnowledgeItem> findRecentKnowledge(@Param("limit") Integer limit);

    @Query("SELECT k FROM KnowledgeItem k WHERE k.status = 'active' AND k.category = :category ORDER BY k.rating DESC")
    List<KnowledgeItem> findByCategory(@Param("category") String category);

    @Query("SELECT k FROM KnowledgeItem k WHERE k.status = 'active' AND (k.title LIKE %:keyword% OR k.tags LIKE %:keyword%) ORDER BY k.viewCount DESC")
    List<KnowledgeItem> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT k FROM KnowledgeItem k WHERE k.authorEmail = :email AND k.status != 'archived'")
    List<KnowledgeItem> findByAuthorEmail(@Param("email") String email);

    @Query("SELECT k FROM KnowledgeItem k WHERE k.status = 'active' AND k.rating >= :minRating ORDER BY k.rating DESC")
    List<KnowledgeItem> findTopRatedKnowledge(@Param("minRating") Integer minRating);

    @Query("SELECT k FROM KnowledgeItem k WHERE k.status = 'active' ORDER BY k.viewCount DESC LIMIT 10")
    List<KnowledgeItem> findTrendingKnowledge();

    @Query("SELECT k FROM KnowledgeItem k WHERE k.status = 'active' AND k.tags LIKE %:tag%")
    List<KnowledgeItem> findByTag(@Param("tag") String tag);
}
