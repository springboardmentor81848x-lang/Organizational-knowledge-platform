package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.KnowledgeSession;
import com.knowledgegap.entity.SessionFeedback;
import com.knowledgegap.entity.SessionRegistration;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.KnowledgeSessionRepository;
import com.knowledgegap.repository.SessionFeedbackRepository;
import com.knowledgegap.repository.SessionRegistrationRepository;

@Service
public class SessionFeedbackService {

    private final SessionFeedbackRepository feedbackRepository;
    private final KnowledgeSessionRepository sessionRepository;
    private final EmployeeRepository employeeRepository;
    private final SessionRegistrationRepository registrationRepository;

    public SessionFeedbackService(
            SessionFeedbackRepository feedbackRepository,
            KnowledgeSessionRepository sessionRepository,
            EmployeeRepository employeeRepository,
            SessionRegistrationRepository registrationRepository) {

        this.feedbackRepository = feedbackRepository;
        this.sessionRepository = sessionRepository;
        this.employeeRepository = employeeRepository;
        this.registrationRepository = registrationRepository;
    }

    // Submit feedback for a session
    @Transactional
    public SessionFeedback submitFeedback(
            Long sessionId,
            Long employeeId,
            Integer rating,
            String comments) {

        KnowledgeSession session =
                sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Knowledge session not found"));

        Employee employee =
                employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found"));

        if (!"COMPLETED".equals(session.getStatus())) {
            throw new IllegalStateException(
                    "Feedback can be submitted only after session completion");
        }

        // Check attendance
        SessionRegistration registration =
                registrationRepository
                .findBySessionIdAndEmployeeId(
                        sessionId,
                        employeeId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Employee was not registered for this session"));

        if (!Boolean.TRUE.equals(registration.getAttended())) {
            throw new IllegalStateException(
                    "Only employees who attended the session can submit feedback");
        }

        // Validate rating
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException(
                    "Rating must be between 1 and 5");
        }

        // Prevent duplicate feedback
        if (feedbackRepository
                .findBySessionIdAndEmployeeId(
                        sessionId,
                        employeeId)
                .isPresent()) {

            throw new IllegalStateException(
                    "Feedback has already been submitted for this session");
        }

        SessionFeedback feedback = new SessionFeedback();

        feedback.setSession(session);
        feedback.setEmployee(employee);
        feedback.setRating(rating);
        feedback.setComments(comments);
        feedback.setSubmittedAt(LocalDateTime.now());

        return feedbackRepository.save(feedback);
    }

    // Get all feedback for a session
    public List<SessionFeedback> getFeedbackBySession(
            Long sessionId) {

        return feedbackRepository.findBySessionId(sessionId);
    }

    // Get feedback submitted by an employee
    public List<SessionFeedback> getFeedbackByEmployee(
            Long employeeId) {

        return feedbackRepository.findByEmployeeId(employeeId);
    }

    // Calculate average rating / session effectiveness
    public Double getSessionEffectiveness(Long sessionId) {

        Double averageRating =
                feedbackRepository
                .findAverageRatingBySessionId(sessionId);

        if (averageRating == null) {
            return 0.0;
        }

        return averageRating;
    }

    // Get one feedback record
    public SessionFeedback getFeedbackById(Long feedbackId) {

        return feedbackRepository.findById(feedbackId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Feedback not found"));
    }
}