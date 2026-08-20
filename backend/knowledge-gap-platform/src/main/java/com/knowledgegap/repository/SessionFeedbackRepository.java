package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.knowledgegap.entity.SessionFeedback;

public interface SessionFeedbackRepository
        extends JpaRepository<SessionFeedback, Long> {

    // =========================================================
    // GET FEEDBACK FOR SESSION
    // =========================================================

    List<SessionFeedback> findBySessionId(
            Long sessionId);

    // =========================================================
    // GET FEEDBACK BY EMPLOYEE
    // =========================================================

    List<SessionFeedback> findByEmployeeId(
            Long employeeId);

    // =========================================================
    // FIND EMPLOYEE FEEDBACK FOR SESSION
    // =========================================================

    Optional<SessionFeedback>
    findBySessionIdAndEmployeeId(
            Long sessionId,
            Long employeeId);

    // =========================================================
    // AVERAGE RATING FOR SESSION
    // =========================================================

    @Query("""
           SELECT AVG(f.rating)
           FROM SessionFeedback f
           WHERE f.session.id = :sessionId
           """)
    Double findAverageRatingBySessionId(
            @Param("sessionId") Long sessionId);

    // =========================================================
    // TOTAL FEEDBACK FOR SESSION
    // =========================================================

    @Query("""
           SELECT COUNT(f)
           FROM SessionFeedback f
           WHERE f.session.id = :sessionId
           """)
    Long countFeedbackBySessionId(
            @Param("sessionId") Long sessionId);

    // =========================================================
    // AVERAGE RATING FOR MENTOR
    // =========================================================

    @Query("""
           SELECT AVG(f.rating)
           FROM SessionFeedback f
           WHERE f.session.mentor.id = :mentorId
           """)
    Double findAverageRatingByMentorId(
            @Param("mentorId") Long mentorId);

    // =========================================================
    // TOTAL FEEDBACK FOR MENTOR
    // =========================================================

    @Query("""
           SELECT COUNT(f)
           FROM SessionFeedback f
           WHERE f.session.mentor.id = :mentorId
           """)
    Long countFeedbackByMentorId(
            @Param("mentorId") Long mentorId);
}