package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    @Query("SELECT f FROM Feedback f WHERE f.knowledgeItemId = :itemId AND f.status = 'active' ORDER BY f.helpfulCount DESC")
    List<Feedback> findByKnowledgeItem(@Param("itemId") Long itemId);

    @Query("SELECT f FROM Feedback f WHERE f.employeeEmail = :email AND f.status = 'active' ORDER BY f.createdAt DESC")
    List<Feedback> findByEmployeeEmail(@Param("email") String email);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.knowledgeItemId = :itemId AND f.status = 'active'")
    Double getAverageRatingForItem(@Param("itemId") Long itemId);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.knowledgeItemId = :itemId AND f.status = 'active'")
    Integer countFeedbackForItem(@Param("itemId") Long itemId);

    @Query("SELECT f FROM Feedback f WHERE f.knowledgeItemId = :itemId AND f.rating >= :minRating AND f.status = 'active'")
    List<Feedback> findHighRatedFeedback(@Param("itemId") Long itemId, @Param("minRating") Integer minRating);

    @Query("SELECT f FROM Feedback f WHERE f.status = 'reported' ORDER BY f.createdAt DESC")
    List<Feedback> findReportedFeedback();

    @Query("SELECT f FROM Feedback f WHERE f.employeeEmail = :email AND f.category = :category ORDER BY f.createdAt DESC")
    List<Feedback> findByEmployeeAndCategory(@Param("email") String email, @Param("category") String category);
}
