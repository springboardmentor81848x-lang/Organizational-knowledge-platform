package com.knowledgegap.service;

import java.time.LocalDateTime;
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
public class SessionRegistrationService {

    private final SessionRegistrationRepository registrationRepository;
    private final KnowledgeSessionRepository sessionRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public SessionRegistrationService(
            SessionRegistrationRepository registrationRepository,
            KnowledgeSessionRepository sessionRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService) {

        this.registrationRepository = registrationRepository;
        this.sessionRepository = sessionRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // REGISTER EMPLOYEE FOR SESSION
    // =========================================================

    public SessionRegistration registerForSession(
            Long sessionId,
            String employeeId) {

        KnowledgeSession session =
                sessionRepository.findById(sessionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Knowledge session not found"));

        Employee employee =
                employeeRepository.findByEmployeeId(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeId));

        // -----------------------------------------------------
        // CHECK SESSION STATUS
        // -----------------------------------------------------

        if (!"SCHEDULED".equalsIgnoreCase(
                session.getStatus())) {

            throw new IllegalStateException(
                    "Only scheduled sessions can be registered");
        }

        // -----------------------------------------------------
        // CHECK EXISTING REGISTRATION
        // -----------------------------------------------------

        var existingRegistration =
                registrationRepository
                        .findBySessionIdAndEmployeeId(
                                sessionId,
                                employee.getId());

        if (existingRegistration.isPresent()) {

            SessionRegistration existing =
                    existingRegistration.get();

            // Allow re-registration after cancellation
            if ("CANCELLED".equalsIgnoreCase(
                    existing.getStatus())) {

                // Check capacity before re-registering
                Long registeredCount =
                        registrationRepository
                                .countBySessionIdAndStatus(
                                        sessionId,
                                        "REGISTERED");

                if (registeredCount >=
                        session.getMaxParticipants()) {

                    throw new IllegalStateException(
                            "Session has reached maximum capacity");
                }

                existing.setStatus("REGISTERED");
                existing.setAttended(false);
                existing.setRegisteredAt(
                        LocalDateTime.now());

                SessionRegistration saved =
                        registrationRepository.save(existing);

                // Notify mentor
                if (session.getMentor() != null) {

                    notificationService.createNotification(
                            session.getMentor(),
                            "SESSION_REGISTRATION",
                            employee.getFirstName()
                                    + " has registered again for your knowledge session: "
                                    + session.getTitle()
                    );
                }

                return saved;
            }

            throw new IllegalStateException(
                    "Employee is already registered for this session");
        }

        // =====================================================
        // CAPACITY VALIDATION
        // =====================================================

        Long registeredCount =
                registrationRepository
                        .countBySessionIdAndStatus(
                                sessionId,
                                "REGISTERED");

        if (registeredCount >=
                session.getMaxParticipants()) {

            throw new IllegalStateException(
                    "Session has reached maximum capacity");
        }

        // =====================================================
        // CREATE REGISTRATION
        // =====================================================

        SessionRegistration registration =
                new SessionRegistration();

        registration.setSession(session);
        registration.setEmployee(employee);
        registration.setStatus("REGISTERED");
        registration.setAttended(false);
        registration.setRegisteredAt(
                LocalDateTime.now());

        SessionRegistration saved =
                registrationRepository.save(
                        registration);

        // =====================================================
        // NOTIFY MENTOR
        // =====================================================

        if (session.getMentor() != null) {

            notificationService.createNotification(
                    session.getMentor(),
                    "SESSION_REGISTRATION",
                    employee.getFirstName()
                            + " has registered for your knowledge session: "
                            + session.getTitle()
            );
        }

        return saved;
    }

    // =========================================================
    // CANCEL REGISTRATION
    // =========================================================

    public SessionRegistration cancelRegistration(
            Long sessionId,
            String employeeId) {

        KnowledgeSession session =
                sessionRepository.findById(sessionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Knowledge session not found"));

        Employee employee =
                employeeRepository.findByEmployeeId(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeId));

        SessionRegistration registration =
                registrationRepository
                        .findBySessionIdAndEmployeeId(
                                sessionId,
                                employee.getId())
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Employee is not registered for this session"));

        // -----------------------------------------------------
        // ALREADY CANCELLED
        // -----------------------------------------------------

        if ("CANCELLED".equalsIgnoreCase(
                registration.getStatus())) {

            throw new IllegalStateException(
                    "Registration has already been cancelled");
        }

        // -----------------------------------------------------
        // CANNOT CANCEL AFTER ATTENDANCE
        // -----------------------------------------------------

        if (Boolean.TRUE.equals(
                registration.getAttended())) {

            throw new IllegalStateException(
                    "Registration cannot be cancelled after attendance is marked");
        }

        // -----------------------------------------------------
        // CANCEL
        // -----------------------------------------------------

        registration.setStatus("CANCELLED");

        SessionRegistration saved =
                registrationRepository.save(
                        registration);

        // -----------------------------------------------------
        // NOTIFY MENTOR
        // -----------------------------------------------------

        if (session.getMentor() != null) {

            notificationService.createNotification(
                    session.getMentor(),
                    "SESSION_REGISTRATION_CANCELLED",
                    employee.getFirstName()
                            + " cancelled registration for your knowledge session: "
                            + session.getTitle()
            );
        }

        return saved;
    }

    // =========================================================
    // GET ALL REGISTRATIONS FOR SESSION
    // =========================================================

    @Transactional(readOnly = true)
    public List<SessionRegistration>
    getSessionRegistrations(Long sessionId) {

        // Verify session exists
        sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Knowledge session not found"));

        return registrationRepository
                .findBySessionId(sessionId);
    }

    // =========================================================
    // GET ALL REGISTRATIONS FOR EMPLOYEE
    // =========================================================

    @Transactional(readOnly = true)
    public List<SessionRegistration>
    getEmployeeRegistrations(String employeeId) {

        Employee employee =
                employeeRepository.findByEmployeeId(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeId));

        return registrationRepository
                .findByEmployeeId(employee.getId());
    }

    // =========================================================
    // GET ACTIVE REGISTRATIONS FOR SESSION
    // =========================================================

    @Transactional(readOnly = true)
    public List<SessionRegistration>
    getActiveSessionRegistrations(
            Long sessionId) {

        // Verify session exists
        sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Knowledge session not found"));

        return registrationRepository
                .findBySessionIdAndStatus(
                        sessionId,
                        "REGISTERED");
    }

    // =========================================================
    // GET REGISTERED PARTICIPANT COUNT
    // =========================================================

    @Transactional(readOnly = true)
    public Long getRegisteredCount(
            Long sessionId) {

        // Verify session exists
        sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Knowledge session not found"));

        Long count =
                registrationRepository
                        .countBySessionIdAndStatus(
                                sessionId,
                                "REGISTERED");

        return count != null ? count : 0L;
    }

    // =========================================================
    // MARK ATTENDANCE
    // =========================================================

    public SessionRegistration markAttendance(
            Long registrationId,
            Boolean attended) {

        SessionRegistration registration =
                registrationRepository.findById(
                        registrationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Registration not found"));

        // -----------------------------------------------------
        // CANCELLED REGISTRATION
        // -----------------------------------------------------

        if ("CANCELLED".equalsIgnoreCase(
                registration.getStatus())) {

            throw new IllegalStateException(
                    "Cannot mark attendance for a cancelled registration");
        }

        // -----------------------------------------------------
        // ONLY REGISTERED EMPLOYEES
        // -----------------------------------------------------

        if (!"REGISTERED".equalsIgnoreCase(
                registration.getStatus())) {

            throw new IllegalStateException(
                    "Only registered employees can have attendance marked");
        }

        registration.setAttended(
                Boolean.TRUE.equals(attended));

        return registrationRepository.save(
                registration);
    }

    // =========================================================
    // GET ONE REGISTRATION
    // =========================================================

    @Transactional(readOnly = true)
    public SessionRegistration getRegistrationById(
            Long registrationId) {

        return registrationRepository
                .findById(registrationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Registration not found"));
    }

    // =========================================================
    // CHECK EMPLOYEE REGISTRATION
    // =========================================================

    @Transactional(readOnly = true)
    public boolean isEmployeeRegistered(
            Long sessionId,
            String employeeId) {

        Employee employee =
                employeeRepository.findByEmployeeId(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeId));

        return registrationRepository
                .findBySessionIdAndEmployeeId(
                        sessionId,
                        employee.getId())
                .map(registration ->
                        "REGISTERED".equalsIgnoreCase(
                                registration.getStatus()))
                .orElse(false);
    }
}