package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.LearningAnalytics;
import com.knowledgegap.dto.SessionAnalytics;
import com.knowledgegap.entity.KnowledgeSession;
import com.knowledgegap.entity.SessionFeedback;
import com.knowledgegap.repository.KnowledgeSessionRepository;
import com.knowledgegap.repository.SessionFeedbackRepository;
import com.knowledgegap.repository.SessionRegistrationRepository;

@Service
@Transactional(readOnly = true)
public class LearningAnalyticsService {

    private final KnowledgeSessionRepository sessionRepository;
    private final SessionRegistrationRepository registrationRepository;
    private final SessionFeedbackRepository feedbackRepository;

    public LearningAnalyticsService(
            KnowledgeSessionRepository sessionRepository,
            SessionRegistrationRepository registrationRepository,
            SessionFeedbackRepository feedbackRepository) {

        this.sessionRepository = sessionRepository;
        this.registrationRepository = registrationRepository;
        this.feedbackRepository = feedbackRepository;
    }

    // =========================================================
    // MENTOR LEARNING ANALYTICS
    // =========================================================

    public LearningAnalytics getMentorAnalytics(Long mentorId) {

        // -----------------------------------------------------
        // Get mentor sessions
        // -----------------------------------------------------

        List<KnowledgeSession> sessions =
                sessionRepository.findByMentorId(mentorId);

        long totalSessions = sessions.size();

        long completedSessions =
                sessions.stream()
                        .filter(session ->
                                "COMPLETED".equalsIgnoreCase(
                                        session.getStatus()))
                        .count();

        long totalRegistrations = 0L;
        long totalAttended = 0L;
        long totalFeedback = 0L;

        double ratingSum = 0.0;

        List<SessionAnalytics> sessionAnalytics =
                new ArrayList<>();

        // -----------------------------------------------------
        // Analyze every session
        // -----------------------------------------------------

        for (KnowledgeSession session : sessions) {

            Long registrations =
                    registrationRepository
                            .countBySessionIdAndStatus(
                                    session.getId(),
                                    "REGISTERED");

            if (registrations == null) {
                registrations = 0L;
            }

            Long attended =
                    registrationRepository
                            .countBySessionIdAndAttendedTrue(
                                    session.getId());

            if (attended == null) {
                attended = 0L;
            }

            Long feedbackCount =
                    feedbackRepository
                            .countFeedbackBySessionId(
                                    session.getId());

            if (feedbackCount == null) {
                feedbackCount = 0L;
            }

            Double averageRating =
                    feedbackRepository
                            .findAverageRatingBySessionId(
                                    session.getId());

            if (averageRating == null) {
                averageRating = 0.0;
            }

            // -------------------------------------------------
            // Add to overall totals
            // -------------------------------------------------

            totalRegistrations += registrations;
            totalAttended += attended;
            totalFeedback += feedbackCount;

            ratingSum +=
                    averageRating * feedbackCount;

            // -------------------------------------------------
            // Session attendance rate
            // -------------------------------------------------

            double sessionAttendanceRate = 0.0;

            if (registrations > 0) {

                sessionAttendanceRate =
                        ((double) attended / registrations)
                        * 100.0;
            }

            // -------------------------------------------------
            // Session effectiveness
            // Rating is out of 5.
            // Convert to percentage.
            // -------------------------------------------------

            double effectiveness =
                    (averageRating / 5.0) * 100.0;

            sessionAttendanceRate =
                    round(sessionAttendanceRate);

            averageRating =
                    round(averageRating);

            effectiveness =
                    round(effectiveness);

            // -------------------------------------------------
            // Session analytics
            // -------------------------------------------------

            SessionAnalytics analytics =
                    new SessionAnalytics(
                            session.getId(),
                            session.getTitle(),
                            session.getStatus(),
                            registrations,
                            attended,
                            sessionAttendanceRate,
                            feedbackCount,
                            averageRating,
                            effectiveness
                    );

            sessionAnalytics.add(analytics);
        }

        // -----------------------------------------------------
        // Overall attendance rate
        // -----------------------------------------------------

        double attendanceRate = 0.0;

        if (totalRegistrations > 0) {

            attendanceRate =
                    ((double) totalAttended
                            / totalRegistrations)
                    * 100.0;
        }

        // -----------------------------------------------------
        // Overall average rating
        // -----------------------------------------------------

        double averageEffectiveness = 0.0;

        if (totalFeedback > 0) {

            double averageRating =
                    ratingSum / totalFeedback;

            averageEffectiveness =
                    (averageRating / 5.0) * 100.0;
        }

        // -----------------------------------------------------
        // Round values
        // -----------------------------------------------------

        attendanceRate =
                round(attendanceRate);

        averageEffectiveness =
                round(averageEffectiveness);

        // -----------------------------------------------------
        // Return analytics
        // -----------------------------------------------------

        return new LearningAnalytics(
                mentorId,
                totalSessions,
                completedSessions,
                totalRegistrations,
                totalAttended,
                attendanceRate,
                averageEffectiveness,
                totalFeedback,
                sessionAnalytics
        );
    }

    // =========================================================
    // SESSION EFFECTIVENESS
    // =========================================================

    public Double getSessionEffectiveness(
            Long sessionId) {

        Double averageRating =
                feedbackRepository
                        .findAverageRatingBySessionId(
                                sessionId);

        if (averageRating == null) {
            return 0.0;
        }

        double effectiveness =
                (averageRating / 5.0) * 100.0;

        return round(effectiveness);
    }

    // =========================================================
    // ROUND DOUBLE
    // =========================================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}