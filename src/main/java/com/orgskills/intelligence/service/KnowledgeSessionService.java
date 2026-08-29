package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.session.AttendanceEntry;
import com.orgskills.intelligence.dto.session.AttendanceRequest;
import com.orgskills.intelligence.dto.session.SessionFeedbackRequest;
import com.orgskills.intelligence.dto.session.SessionRegistrationResponse;
import com.orgskills.intelligence.dto.session.SessionRequest;
import com.orgskills.intelligence.dto.session.SessionResponse;
import com.orgskills.intelligence.entity.KnowledgeSession;
import com.orgskills.intelligence.entity.SessionRegistration;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AttendanceStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.entity.enums.SessionStatus;
import com.orgskills.intelligence.exception.ForbiddenException;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.KnowledgeSessionRepository;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
import com.orgskills.intelligence.repository.SessionRegistrationRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KnowledgeSessionService {

    /** Roles that may host or administer sessions regardless of their own skill profile. */
    private static final Set<Role> SESSION_ADMIN_ROLES =
            EnumSet.of(Role.LND_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN);

    /** Proficiency at or above which an employee counts as a mentor able to host a session. */
    private static final ProficiencyLevel MENTOR_PROFICIENCY_THRESHOLD = ProficiencyLevel.ADVANCED;

    private final KnowledgeSessionRepository sessionRepository;
    private final SessionRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final MentorshipMatchRepository mentorshipMatchRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    // ── Session CRUD ────────────────────────────────────────────────────────────

    /** Creates a SCHEDULED session hosted by the acting mentor or L&D administrator. */
    @Transactional
    public SessionResponse createSession(Long actorId, SessionRequest request) {
        User host = getUser(actorId);
        requireCanHostSessions(host);
        requireFutureDate(request.getSessionDate());

        KnowledgeSession session = new KnowledgeSession();
        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setMentor(host);
        session.setSessionDate(request.getSessionDate());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setCapacity(request.getCapacity());
        session.setStatus(SessionStatus.SCHEDULED);

        KnowledgeSession saved = sessionRepository.save(session);
        auditLogService.logEvent(actorId, host.getEmail(), "CREATE_SESSION", "KnowledgeSession",
                saved.getId().toString(), "Created knowledge session: " + saved.getTitle());

        return toResponse(saved, List.of(), true);
    }

    @Transactional
    public SessionResponse updateSession(Long actorId, Long sessionId, SessionRequest request) {
        User actor = getUser(actorId);
        KnowledgeSession session = getSession(sessionId);
        requireHostOrAdmin(session, actor);

        if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new ValidationException("A CANCELLED session can no longer be edited");
        }
        if (request.getStatus() == SessionStatus.CANCELLED) {
            throw new ValidationException("Use DELETE /api/sessions/" + sessionId + " to cancel a session");
        }

        List<SessionRegistration> registrations = registrationRepository.findBySessionIdOrderByRegisteredAtAsc(sessionId);
        if (request.getCapacity() < registrations.size()) {
            throw new ValidationException("Capacity cannot be reduced to " + request.getCapacity()
                    + "; " + registrations.size() + " employee(s) are already registered");
        }
        boolean dateChanged = !session.getSessionDate().equals(request.getSessionDate());
        if (dateChanged) {
            requireFutureDate(request.getSessionDate());
        }

        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setSessionDate(request.getSessionDate());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setCapacity(request.getCapacity());
        if (request.getStatus() != null) {
            session.setStatus(request.getStatus());
        }

        KnowledgeSession saved = sessionRepository.save(session);
        if (dateChanged) {
            notifyRegistrants(registrations, "Session rescheduled",
                    "\"" + saved.getTitle() + "\" has moved to " + saved.getSessionDate());
        }
        auditLogService.logEvent(actorId, actor.getEmail(), "UPDATE_SESSION", "KnowledgeSession",
                saved.getId().toString(), "Updated knowledge session: " + saved.getTitle());

        return toResponse(saved, registrations, true);
    }

    /**
     * Cancels a session. A session with registrations is kept and marked CANCELLED so the
     * attendee history survives; an empty session is removed outright.
     */
    @Transactional
    public void cancelSession(Long actorId, Long sessionId) {
        User actor = getUser(actorId);
        KnowledgeSession session = getSession(sessionId);
        requireHostOrAdmin(session, actor);

        List<SessionRegistration> registrations = registrationRepository.findBySessionIdOrderByRegisteredAtAsc(sessionId);
        if (registrations.isEmpty()) {
            sessionRepository.delete(session);
            auditLogService.logEvent(actorId, actor.getEmail(), "DELETE_SESSION", "KnowledgeSession",
                    sessionId.toString(), "Deleted knowledge session with no registrations: " + session.getTitle());
            return;
        }

        session.setStatus(SessionStatus.CANCELLED);
        sessionRepository.save(session);
        notifyRegistrants(registrations, "Session cancelled",
                "\"" + session.getTitle() + "\" scheduled for " + session.getSessionDate() + " has been cancelled");
        auditLogService.logEvent(actorId, actor.getEmail(), "CANCEL_SESSION", "KnowledgeSession",
                sessionId.toString(), "Cancelled knowledge session: " + session.getTitle());
    }

    // ── Browsing ────────────────────────────────────────────────────────────────

    /**
     * Lists sessions, optionally narrowed to a status or host. When {@code availableOnly}
     * is set, only SCHEDULED sessions in the future with a free seat are returned.
     */
    @Transactional(readOnly = true)
    public List<SessionResponse> listSessions(SessionStatus status, Long mentorId, boolean availableOnly) {
        SessionStatus effectiveStatus = availableOnly ? SessionStatus.SCHEDULED : status;
        List<KnowledgeSession> sessions = findSessions(effectiveStatus, mentorId);
        if (sessions.isEmpty()) {
            return List.of();
        }

        Map<Long, List<SessionRegistration>> registrationsBySession = registrationRepository
                .findBySessionIdIn(sessions.stream().map(KnowledgeSession::getId).toList())
                .stream()
                .collect(Collectors.groupingBy(registration -> registration.getSession().getId()));

        Instant now = Instant.now();
        return sessions.stream()
                .map(session -> toResponse(session,
                        registrationsBySession.getOrDefault(session.getId(), List.of()), false))
                .filter(response -> !availableOnly
                        || (!response.isFull() && response.getSessionDate().isAfter(now)))
                .toList();
    }

    @Transactional(readOnly = true)
    public SessionResponse getSession(Long actorId, Long sessionId) {
        KnowledgeSession session = getSession(sessionId);
        List<SessionRegistration> registrations = registrationRepository.findBySessionIdOrderByRegisteredAtAsc(sessionId);
        boolean canSeeRoster = actorId != null
                && userRepository.findById(actorId).map(actor -> isHostOrAdmin(session, actor)).orElse(false);
        return toResponse(session, registrations, canSeeRoster);
    }

    // ── Registration ────────────────────────────────────────────────────────────

    @Transactional
    public SessionRegistrationResponse register(Long employeeId, Long sessionId) {
        User employee = getUser(employeeId);
        KnowledgeSession session = getSession(sessionId);

        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new ValidationException("Session \"" + session.getTitle() + "\" is "
                    + session.getStatus() + " and is not open for registration");
        }
        if (!session.getSessionDate().isAfter(Instant.now())) {
            throw new ValidationException("Registration for \"" + session.getTitle()
                    + "\" is closed; the session has already started");
        }
        if (session.getMentor().getId().equals(employeeId)) {
            throw new ValidationException("The host cannot register as an attendee of their own session");
        }
        if (registrationRepository.findBySessionIdAndEmployeeId(sessionId, employeeId).isPresent()) {
            throw new ValidationException("You are already registered for \"" + session.getTitle() + "\"");
        }

        long registered = registrationRepository.countBySessionId(sessionId);
        if (registered >= session.getCapacity()) {
            throw new ValidationException("Session \"" + session.getTitle() + "\" is full ("
                    + registered + "/" + session.getCapacity() + " seats taken)");
        }

        SessionRegistration registration = new SessionRegistration();
        registration.setSession(session);
        registration.setEmployee(employee);
        registration.setAttendanceStatus(AttendanceStatus.REGISTERED);

        SessionRegistration saved = registrationRepository.save(registration);
        notificationService.createNotification(session.getMentor(), "New session registration",
                employee.getFullName() + " registered for \"" + session.getTitle() + "\"",
                NotificationType.INFO);

        return toRegistrationResponse(saved);
    }

    @Transactional
    public void cancelRegistration(Long employeeId, Long sessionId) {
        KnowledgeSession session = getSession(sessionId);
        SessionRegistration registration = registrationRepository
                .findBySessionIdAndEmployeeId(sessionId, employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No registration found for employee " + employeeId + " on session " + sessionId));

        if (registration.getAttendanceStatus() == AttendanceStatus.ATTENDED) {
            throw new ValidationException("Attendance has already been recorded; the registration cannot be cancelled");
        }

        registrationRepository.delete(registration);
        notificationService.createNotification(session.getMentor(), "Session registration cancelled",
                registration.getEmployee().getFullName() + " cancelled their place in \"" + session.getTitle() + "\"",
                NotificationType.INFO);
    }

    // ── Attendance & feedback ───────────────────────────────────────────────────

    /** Marks attendance for one or more registered employees. Host or L&D administrator only. */
    @Transactional
    public SessionResponse markAttendance(Long actorId, Long sessionId, AttendanceRequest request) {
        User actor = getUser(actorId);
        KnowledgeSession session = getSession(sessionId);
        requireHostOrAdmin(session, actor);

        if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new ValidationException("Attendance cannot be recorded for a CANCELLED session");
        }

        Map<Long, SessionRegistration> byEmployee = registrationRepository
                .findBySessionIdOrderByRegisteredAtAsc(sessionId).stream()
                .collect(Collectors.toMap(registration -> registration.getEmployee().getId(), Function.identity()));

        for (AttendanceEntry entry : request.getEntries()) {
            SessionRegistration registration = byEmployee.get(entry.getEmployeeId());
            if (registration == null) {
                throw new ValidationException("Employee " + entry.getEmployeeId()
                        + " is not registered for \"" + session.getTitle() + "\"");
            }
            registration.setAttendanceStatus(entry.getAttendanceStatus());
        }

        registrationRepository.saveAll(byEmployee.values());
        auditLogService.logEvent(actorId, actor.getEmail(), "MARK_ATTENDANCE", "KnowledgeSession",
                sessionId.toString(), "Recorded attendance for " + request.getEntries().size() + " employee(s)");

        return toResponse(session, List.copyOf(byEmployee.values()), true);
    }

    /** Records an attendee's rating and comments, which feed the session effectiveness score. */
    @Transactional
    public SessionRegistrationResponse submitFeedback(Long employeeId, Long sessionId, SessionFeedbackRequest request) {
        KnowledgeSession session = getSession(sessionId);
        SessionRegistration registration = registrationRepository
                .findBySessionIdAndEmployeeId(sessionId, employeeId)
                .orElseThrow(() -> new ValidationException(
                        "You are not registered for \"" + session.getTitle() + "\""));

        if (registration.getAttendanceStatus() != AttendanceStatus.ATTENDED) {
            throw new ValidationException("Feedback can only be submitted once you are marked as ATTENDED; "
                    + "your attendance is currently " + registration.getAttendanceStatus());
        }

        registration.setFeedbackRating(request.getRating());
        registration.setFeedbackText(request.getFeedbackText());
        registration.setFeedbackSubmittedAt(Instant.now());

        return toRegistrationResponse(registrationRepository.save(registration));
    }

    // ── Helper methods ──────────────────────────────────────────────────────────

    private List<KnowledgeSession> findSessions(SessionStatus status, Long mentorId) {
        if (mentorId != null && status != null) {
            return sessionRepository.findByMentorIdAndStatusOrderBySessionDateAsc(mentorId, status);
        }
        if (mentorId != null) {
            return sessionRepository.findByMentorIdOrderBySessionDateAsc(mentorId);
        }
        if (status != null) {
            return sessionRepository.findByStatusOrderBySessionDateAsc(status);
        }
        return sessionRepository.findAllByOrderBySessionDateAsc();
    }

    /**
     * A session host is an L&D administrator, or a mentor: an employee who already mentors
     * someone or holds a skill at ADVANCED or above. Mentors are not a distinct role, so
     * this mirrors how the mentorship module identifies them.
     */
    private void requireCanHostSessions(User host) {
        if (SESSION_ADMIN_ROLES.contains(host.getRole())) {
            return;
        }
        boolean hasSeniorSkill = userSkillRepository.findByUserId(host.getId()).stream()
                .map(UserSkill::getProficiencyLevel)
                .anyMatch(level -> level.ordinal() >= MENTOR_PROFICIENCY_THRESHOLD.ordinal());
        boolean mentorsSomeone = mentorshipMatchRepository
                .findByMenteeIdOrMentorIdOrderByCreatedAtDesc(host.getId(), host.getId()).stream()
                .anyMatch(mentorship -> mentorship.getMentor().getId().equals(host.getId()));

        if (!hasSeniorSkill && !mentorsSomeone) {
            throw new ForbiddenException("Only mentors and L&D administrators can host knowledge-sharing "
                    + "sessions. Reach " + MENTOR_PROFICIENCY_THRESHOLD + " in a skill or mentor an employee first.");
        }
    }

    private boolean isHostOrAdmin(KnowledgeSession session, User actor) {
        return session.getMentor().getId().equals(actor.getId()) || SESSION_ADMIN_ROLES.contains(actor.getRole());
    }

    private void requireHostOrAdmin(KnowledgeSession session, User actor) {
        if (!isHostOrAdmin(session, actor)) {
            throw new ForbiddenException("Only the hosting mentor or an L&D administrator can manage this session");
        }
    }

    private void requireFutureDate(Instant sessionDate) {
        if (!sessionDate.isAfter(Instant.now())) {
            throw new ValidationException("Session date must be in the future");
        }
    }

    private void notifyRegistrants(List<SessionRegistration> registrations, String title, String message) {
        registrations.forEach(registration -> notificationService.createNotification(
                registration.getEmployee(), title, message, NotificationType.INFO));
    }

    private KnowledgeSession getSession(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found for id: " + sessionId));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));
    }

    private SessionResponse toResponse(KnowledgeSession session, List<SessionRegistration> registrations,
                                       boolean includeRoster) {
        long registeredCount = registrations.size();
        long attendedCount = registrations.stream()
                .filter(registration -> registration.getAttendanceStatus() == AttendanceStatus.ATTENDED)
                .count();
        List<Integer> ratings = registrations.stream()
                .map(SessionRegistration::getFeedbackRating)
                .filter(rating -> rating != null)
                .toList();
        Double averageRating = ratings.isEmpty() ? null
                : Math.round(ratings.stream().mapToInt(Integer::intValue).average().orElse(0.0) * 100.0) / 100.0;

        return SessionResponse.builder()
                .sessionId(session.getId())
                .title(session.getTitle())
                .description(session.getDescription())
                .mentorId(session.getMentor().getId())
                .mentorName(session.getMentor().getFullName())
                .sessionDate(session.getSessionDate())
                .durationMinutes(session.getDurationMinutes())
                .capacity(session.getCapacity())
                .status(session.getStatus())
                .registeredCount(registeredCount)
                .availableSeats((int) Math.max(0, session.getCapacity() - registeredCount))
                .full(registeredCount >= session.getCapacity())
                .attendedCount(attendedCount)
                .feedbackCount(ratings.size())
                .averageFeedbackRating(averageRating)
                .registrations(includeRoster
                        ? registrations.stream().map(this::toRegistrationResponse).toList()
                        : null)
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }

    private SessionRegistrationResponse toRegistrationResponse(SessionRegistration registration) {
        return SessionRegistrationResponse.builder()
                .registrationId(registration.getId())
                .sessionId(registration.getSession().getId())
                .sessionTitle(registration.getSession().getTitle())
                .employeeId(registration.getEmployee().getId())
                .employeeName(registration.getEmployee().getFullName())
                .attendanceStatus(registration.getAttendanceStatus())
                .feedbackRating(registration.getFeedbackRating())
                .feedbackText(registration.getFeedbackText())
                .registeredAt(registration.getRegisteredAt())
                .feedbackSubmittedAt(registration.getFeedbackSubmittedAt())
                .build();
    }
}
