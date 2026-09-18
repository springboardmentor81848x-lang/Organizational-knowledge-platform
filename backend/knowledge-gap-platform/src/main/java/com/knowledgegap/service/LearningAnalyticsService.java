package com.knowledgegap.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.LearningAnalytics;
import com.knowledgegap.dto.LearningVelocityDTO;
import com.knowledgegap.dto.SessionAnalytics;
import com.knowledgegap.entity.KnowledgeSession;
import com.knowledgegap.entity.LearningProgressHistory;
import com.knowledgegap.repository.KnowledgeSessionRepository;
import com.knowledgegap.repository.LearningProgressHistoryRepository;
import com.knowledgegap.repository.SessionFeedbackRepository;
import com.knowledgegap.repository.SessionRegistrationRepository;

@Service
@Transactional(readOnly = true)
public class LearningAnalyticsService {

    private final KnowledgeSessionRepository sessionRepository;
    private final SessionRegistrationRepository registrationRepository;
    private final SessionFeedbackRepository feedbackRepository;
    private final LearningProgressHistoryRepository progressHistoryRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LearningAnalyticsService(
            KnowledgeSessionRepository sessionRepository,
            SessionRegistrationRepository registrationRepository,
            SessionFeedbackRepository feedbackRepository,
            LearningProgressHistoryRepository progressHistoryRepository) {

        this.sessionRepository = sessionRepository;
        this.registrationRepository = registrationRepository;
        this.feedbackRepository = feedbackRepository;
        this.progressHistoryRepository = progressHistoryRepository;
    }

    // =========================================================
    // MENTOR LEARNING ANALYTICS
    // =========================================================

    public LearningAnalytics getMentorAnalytics(Long mentorId) {

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

            totalRegistrations += registrations;
            totalAttended += attended;
            totalFeedback += feedbackCount;

            ratingSum +=
                    averageRating * feedbackCount;

            double sessionAttendanceRate = 0.0;

            if (registrations > 0) {
                sessionAttendanceRate =
                        ((double) attended / registrations)
                                * 100.0;
            }

            double effectiveness =
                    (averageRating / 5.0) * 100.0;

            sessionAttendanceRate =
                    round(sessionAttendanceRate);

            averageRating =
                    round(averageRating);

            effectiveness =
                    round(effectiveness);

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

        // =====================================================
        // OVERALL ATTENDANCE RATE
        // =====================================================

        double attendanceRate = 0.0;

        if (totalRegistrations > 0) {

            attendanceRate =
                    ((double) totalAttended
                            / totalRegistrations)
                            * 100.0;
        }

        // =====================================================
        // OVERALL EFFECTIVENESS
        // =====================================================

        double averageEffectiveness = 0.0;

        if (totalFeedback > 0) {

            double averageRating =
                    ratingSum / totalFeedback;

            averageEffectiveness =
                    (averageRating / 5.0) * 100.0;
        }

        attendanceRate =
                round(attendanceRate);

        averageEffectiveness =
                round(averageEffectiveness);

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
    // EMPLOYEE LEARNING VELOCITY
    // =========================================================

    public List<LearningVelocityDTO>
    getEmployeeLearningVelocity(
            String employeeId) {

        // -----------------------------------------------------
        // GET HISTORY USING BUSINESS EMPLOYEE ID
        // Example: EMP1001
        // -----------------------------------------------------

        List<LearningProgressHistory> history =
                progressHistoryRepository
                        .findByEmployee_EmployeeIdOrderByRecordedAtAsc(
                                employeeId
                        );

        // -----------------------------------------------------
        // GROUP PROGRESS BY DATE
        //
        // If progress is updated multiple times on the same
        // day, the latest progress value is kept.
        // -----------------------------------------------------

        Map<LocalDate, Double> dailyProgress =
                new LinkedHashMap<>();

        for (LearningProgressHistory record : history) {

            if (record.getRecordedAt() == null) {
                continue;
            }

            if (record.getProgressPercentage() == null) {
                continue;
            }

            double progress =
                    Math.max(
                            0,
                            Math.min(
                                    100,
                                    record.getProgressPercentage()
                            )
                    );

            dailyProgress.put(
                    record.getRecordedAt().toLocalDate(),
                    progress
            );
        }

        // -----------------------------------------------------
        // CREATE VELOCITY DTO LIST
        // -----------------------------------------------------

        List<LearningVelocityDTO> result =
                new ArrayList<>();

        for (Map.Entry<LocalDate, Double> entry
                : dailyProgress.entrySet()) {

            result.add(
                    new LearningVelocityDTO(
                            entry.getKey(),
                            round(entry.getValue())
                    )
            );
        }

        return result;
    }

    // =========================================================
    // ROUND
    // =========================================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}