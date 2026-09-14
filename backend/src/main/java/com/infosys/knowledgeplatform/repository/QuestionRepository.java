package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("SELECT q FROM Question q WHERE q.askerEmail = :email ORDER BY q.createdAt DESC")
    List<Question> findByAskerEmail(@Param("email") String email);

    @Query("SELECT q FROM Question q WHERE q.status = 'open' OR q.status = 'in_progress' ORDER BY q.createdAt DESC")
    List<Question> findOpenQuestions();

    @Query("SELECT q FROM Question q WHERE q.status = :status ORDER BY q.createdAt DESC")
    List<Question> findByStatus(@Param("status") String status);

    @Query("SELECT q FROM Question q WHERE q.topic = :topic ORDER BY q.upvoteCount DESC")
    List<Question> findByTopic(@Param("topic") String topic);

    @Query("SELECT q FROM Question q WHERE q.tags LIKE %:tag% ORDER BY q.createdAt DESC")
    List<Question> findByTag(@Param("tag") String tag);

    @Query("SELECT q FROM Question q WHERE q.title LIKE %:keyword% OR q.description LIKE %:keyword% ORDER BY q.upvoteCount DESC")
    List<Question> searchQuestions(@Param("keyword") String keyword);

    @Query("SELECT q FROM Question q WHERE q.isAnswered = false ORDER BY q.upvoteCount DESC, q.createdAt DESC")
    List<Question> findUnansweredQuestions();

    @Query("SELECT q FROM Question q ORDER BY q.viewCount DESC LIMIT 10")
    List<Question> findTrendingQuestions();

    @Query("SELECT COUNT(q) FROM Question q WHERE q.askerEmail = :email")
    Integer countQuestionsAskedByUser(@Param("email") String email);
}
