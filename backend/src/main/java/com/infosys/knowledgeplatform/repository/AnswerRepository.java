package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    @Query("SELECT a FROM Answer a WHERE a.questionId = :questionId AND a.status = 'active' ORDER BY a.isAccepted DESC, a.upvoteCount DESC")
    List<Answer> findByQuestionId(@Param("questionId") Long questionId);

    @Query("SELECT a FROM Answer a WHERE a.answererEmail = :email ORDER BY a.createdAt DESC")
    List<Answer> findByAnswererEmail(@Param("email") String email);

    @Query("SELECT a FROM Answer a WHERE a.questionId = :questionId AND a.isAccepted = true")
    Answer findAcceptedAnswer(@Param("questionId") Long questionId);

    @Query("SELECT COUNT(a) FROM Answer a WHERE a.answererEmail = :email")
    Integer countAnswersProvidedByUser(@Param("email") String email);

    @Query("SELECT a FROM Answer a WHERE a.status = 'active' ORDER BY a.upvoteCount DESC LIMIT 10")
    List<Answer> findTopRatedAnswers();

    @Query("SELECT a FROM Answer a WHERE a.answererEmail = :email AND a.isAccepted = true")
    List<Answer> findAcceptedAnswersByUser(@Param("email") String email);

    @Query("SELECT a FROM Answer a WHERE a.status = 'active' AND a.answerRating >= :minRating ORDER BY a.answerRating DESC")
    List<Answer> findHighRatedAnswers(@Param("minRating") Integer minRating);

    @Query("SELECT a FROM Answer a WHERE a.questionId = :questionId AND a.status = 'active' ORDER BY a.createdAt DESC")
    List<Answer> findAllAnswersForQuestion(@Param("questionId") Long questionId);
}
