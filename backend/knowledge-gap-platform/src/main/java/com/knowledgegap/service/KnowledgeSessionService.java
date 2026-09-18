package com.knowledgegap.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.KnowledgeSession;
import com.knowledgegap.entity.SessionRegistration;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.KnowledgeSessionRepository;
import com.knowledgegap.repository.SessionRegistrationRepository;

@Service
@Transactional
public class KnowledgeSessionService {

    private final KnowledgeSessionRepository sessionRepository;
    private final EmployeeRepository employeeRepository;
    private final SessionRegistrationRepository registrationRepository;
    private final NotificationService notificationService;

    public KnowledgeSessionService(
            KnowledgeSessionRepository sessionRepository,
            EmployeeRepository employeeRepository,
            SessionRegistrationRepository registrationRepository,
            NotificationService notificationService) {

        this.sessionRepository = sessionRepository;
        this.employeeRepository = employeeRepository;
        this.registrationRepository = registrationRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // CREATE SESSION
    // =========================================================

    public KnowledgeSession createSession(
            KnowledgeSession session,
            Long mentorId) {

        if (session == null) {
            throw new IllegalArgumentException(
                    "Session details are required");
        }

        Employee mentor =
                employeeRepository.findById(mentorId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Mentor not found"));

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (session.getTitle() == null ||
                session.getTitle().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Session title is required");
        }

        if (session.getSessionDate() == null) {

            throw new IllegalArgumentException(
                    "Session date and time is required");
        }

        if (session.getDurationMinutes() == null ||
                session.getDurationMinutes() <= 0) {

            throw new IllegalArgumentException(
                    "Duration must be greater than 0 minutes");
        }

        if (session.getMaxParticipants() == null ||
                session.getMaxParticipants() <= 0) {

            throw new IllegalArgumentException(
                    "Maximum participants must be greater than 0");
        }

        if (session.getPlatform() == null ||
                session.getPlatform().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Platform is required");
        }

        if (session.getMeetingLink() == null ||
                session.getMeetingLink().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Meeting link is required");
        }

        // -----------------------------------------------------
        // SET MENTOR
        // -----------------------------------------------------

        session.setMentor(mentor);

        // New sessions are always scheduled
        session.setStatus("SCHEDULED");

        return sessionRepository.save(session);
    }

    // =========================================================
    // GET SESSION BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public KnowledgeSession getSessionById(
            Long sessionId) {

        return sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Knowledge session not found"));
    }

    // =========================================================
    // GET ALL SESSIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<KnowledgeSession> getAllSessions() {

        return sessionRepository.findAll();
    }

    // =========================================================
    // GET MENTOR SESSIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<KnowledgeSession> getSessionsByMentor(
            Long mentorId) {

        // Make sure mentor exists
        employeeRepository.findById(mentorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Mentor not found"));

        return sessionRepository
                .findByMentorId(mentorId);
    }

    // =========================================================
    // GET AVAILABLE SESSIONS FOR EMPLOYEES
    // =========================================================

    @Transactional(readOnly = true)
    public List<KnowledgeSession> getAvailableSessions() {

        return sessionRepository
                .findByStatusOrderBySessionDateAsc(
                        "SCHEDULED");
    }

    // =========================================================
    // UPDATE SESSION
    // =========================================================

    public KnowledgeSession updateSession(
            Long sessionId,
            KnowledgeSession updatedSession,
            Long mentorId) {

        KnowledgeSession existingSession =
                sessionRepository.findById(sessionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Knowledge session not found"));

        // -----------------------------------------------------
        // VERIFY MENTOR
        // -----------------------------------------------------

        if (existingSession.getMentor() == null ||
                !existingSession.getMentor()
                        .getId()
                        .equals(mentorId)) {

            throw new IllegalStateException(
                    "You are not authorized to update this session");
        }

        // -----------------------------------------------------
        // CANNOT UPDATE CANCELLED/COMPLETED SESSION
        // -----------------------------------------------------

        if ("CANCELLED".equalsIgnoreCase(
                existingSession.getStatus())) {

            throw new IllegalStateException(
                    "Cancelled sessions cannot be updated");
        }

        if ("COMPLETED".equalsIgnoreCase(
                existingSession.getStatus())) {

            throw new IllegalStateException(
                    "Completed sessions cannot be updated");
        }

        // -----------------------------------------------------
        // VALIDATE UPDATED DATA
        // -----------------------------------------------------

        if (updatedSession.getTitle() == null ||
                updatedSession.getTitle().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Session title is required");
        }

        if (updatedSession.getSessionDate() == null) {

            throw new IllegalArgumentException(
                    "Session date and time is required");
        }

        if (updatedSession.getDurationMinutes() == null ||
                updatedSession.getDurationMinutes() <= 0) {

            throw new IllegalArgumentException(
                    "Duration must be greater than 0 minutes");
        }

        if (updatedSession.getMaxParticipants() == null ||
                updatedSession.getMaxParticipants() <= 0) {

            throw new IllegalArgumentException(
                    "Maximum participants must be greater than 0");
        }

        if (updatedSession.getPlatform() == null ||
                updatedSession.getPlatform().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Platform is required");
        }

        if (updatedSession.getMeetingLink() == null ||
                updatedSession.getMeetingLink().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Meeting link is required");
        }

        // -----------------------------------------------------
        // CHECK CURRENT REGISTRATIONS
        // -----------------------------------------------------

        Long registeredCount =
                registrationRepository
                        .countBySessionIdAndStatus(
                                sessionId,
                                "REGISTERED");

        if (updatedSession.getMaxParticipants()
                < registeredCount) {

            throw new IllegalStateException(
                    "Maximum participants cannot be less than the current number of registered participants");
        }

        // -----------------------------------------------------
        // UPDATE FIELDS
        // -----------------------------------------------------

        existingSession.setTitle(
                updatedSession.getTitle());

        existingSession.setDescription(
                updatedSession.getDescription());

        existingSession.setSessionDate(
                updatedSession.getSessionDate());

        existingSession.setDurationMinutes(
                updatedSession.getDurationMinutes());

        existingSession.setMaxParticipants(
                updatedSession.getMaxParticipants());

        existingSession.setPlatform(
                updatedSession.getPlatform());

        existingSession.setMeetingLink(
                updatedSession.getMeetingLink());

        KnowledgeSession savedSession =
                sessionRepository.save(existingSession);

        // =====================================================
        // NOTIFY REGISTERED EMPLOYEES
        // =====================================================

        notifyRegisteredEmployees(
                savedSession,
                "SESSION_UPDATED",
                "The knowledge session '"
                        + savedSession.getTitle()
                        + "' has been updated. Please check the latest session details.");

        return savedSession;
    }

    // =========================================================
    // CANCEL SESSION
    // =========================================================

    public KnowledgeSession cancelSession(
            Long sessionId,
            Long mentorId) {

        KnowledgeSession session =
                sessionRepository.findById(sessionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Knowledge session not found"));

        // -----------------------------------------------------
        // VERIFY MENTOR
        // -----------------------------------------------------

        if (session.getMentor() == null ||
                !session.getMentor()
                        .getId()
                        .equals(mentorId)) {

            throw new IllegalStateException(
                    "You are not authorized to cancel this session");
        }

        // -----------------------------------------------------
        // CHECK STATUS
        // -----------------------------------------------------

        if ("CANCELLED".equalsIgnoreCase(
                session.getStatus())) {

            throw new IllegalStateException(
                    "Session is already cancelled");
        }

        if ("COMPLETED".equalsIgnoreCase(
                session.getStatus())) {

            throw new IllegalStateException(
                    "Completed sessions cannot be cancelled");
        }

        // -----------------------------------------------------
        // CHANGE STATUS
        // -----------------------------------------------------

        session.setStatus("CANCELLED");

        KnowledgeSession savedSession =
                sessionRepository.save(session);

        // =====================================================
        // NOTIFY REGISTERED EMPLOYEES
        // =====================================================

        notifyRegisteredEmployees(
                savedSession,
                "SESSION_CANCELLED",
                "The knowledge session '"
                        + savedSession.getTitle()
                        + "' has been cancelled by the mentor.");

        return savedSession;
    }

    // =========================================================
    // COMPLETE SESSION
    // =========================================================

    public KnowledgeSession completeSession(
            Long sessionId,
            Long mentorId) {

        KnowledgeSession session =
                sessionRepository.findById(sessionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Knowledge session not found"));

        // -----------------------------------------------------
        // VERIFY MENTOR
        // -----------------------------------------------------

        if (session.getMentor() == null ||
                !session.getMentor()
                        .getId()
                        .equals(mentorId)) {

            throw new IllegalStateException(
                    "You are not authorized to complete this session");
        }

        // -----------------------------------------------------
        // CHECK STATUS
        // -----------------------------------------------------

        if ("CANCELLED".equalsIgnoreCase(
                session.getStatus())) {

            throw new IllegalStateException(
                    "Cancelled sessions cannot be completed");
        }

        if ("COMPLETED".equalsIgnoreCase(
                session.getStatus())) {

            throw new IllegalStateException(
                    "Session is already completed");
        }

        // -----------------------------------------------------
        // COMPLETE
        // -----------------------------------------------------

        session.setStatus("COMPLETED");

        KnowledgeSession savedSession =
                sessionRepository.save(session);

        // =====================================================
        // NOTIFY REGISTERED EMPLOYEES
        // =====================================================

        notifyRegisteredEmployees(
                savedSession,
                "SESSION_COMPLETED",
                "The knowledge session '"
                        + savedSession.getTitle()
                        + "' has been completed. Attendees can now submit session feedback.");

        return savedSession;
    }

    // =========================================================
    // NOTIFY REGISTERED EMPLOYEES
    // =========================================================

    private void notifyRegisteredEmployees(
            KnowledgeSession session,
            String notificationType,
            String message) {

        List<SessionRegistration> registrations =
                registrationRepository
                        .findBySessionIdAndStatus(
                                session.getId(),
                                "REGISTERED");

        for (SessionRegistration registration :
                registrations) {

            Employee employee =
                    registration.getEmployee();

            if (employee != null) {

                notificationService.createNotification(
                        employee,
                        notificationType,
                        message);
            }
        }
    }
}