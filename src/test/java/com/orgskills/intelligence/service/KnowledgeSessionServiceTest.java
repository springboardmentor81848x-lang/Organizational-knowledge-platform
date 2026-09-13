package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.session.AttendanceEntry;
import com.orgskills.intelligence.dto.session.AttendanceRequest;
import com.orgskills.intelligence.dto.session.SessionFeedbackRequest;
import com.orgskills.intelligence.dto.session.SessionRegistrationResponse;
import com.orgskills.intelligence.dto.session.SessionRequest;
import com.orgskills.intelligence.dto.session.SessionResponse;
import com.orgskills.intelligence.entity.KnowledgeSession;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.SessionRegistration;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AttendanceStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.entity.enums.SessionStatus;
import com.orgskills.intelligence.exception.ForbiddenException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.KnowledgeSessionRepository;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
import com.orgskills.intelligence.repository.SessionRegistrationRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.list;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KnowledgeSessionServiceTest {

    @Mock
    private KnowledgeSessionRepository sessionRepository;

    @Mock
    private SessionRegistrationRepository registrationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSkillRepository userSkillRepository;

    @Mock
    private MentorshipMatchRepository mentorshipMatchRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private KnowledgeSessionService knowledgeSessionService;

    private User host;
    private User employee;
    private User otherEmployee;
    private KnowledgeSession session;

    @BeforeEach
    void setUp() {
        host = user(1L, "Bob Smith", Role.MANAGER);
        employee = user(2L, "Alice Johnson", Role.EMPLOYEE);
        otherEmployee = user(3L, "Cara Diaz", Role.EMPLOYEE);

        session = new KnowledgeSession();
        session.setId(100L);
        session.setTitle("Java Deep Dive");
        session.setDescription("Streams, records and virtual threads");
        session.setMentor(host);
        session.setSessionDate(Instant.now().plus(7, ChronoUnit.DAYS));
        session.setDurationMinutes(90);
        session.setCapacity(2);
        session.setStatus(SessionStatus.SCHEDULED);
    }

    // ── Creation ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createSession lets an ADVANCED-or-above employee host a SCHEDULED session")
    void mentorCanCreateSession() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(host));
        when(userSkillRepository.findByUserId(1L))
                .thenReturn(List.of(userSkill(host, ProficiencyLevel.EXPERT)));
        when(sessionRepository.save(any(KnowledgeSession.class))).thenAnswer(invocation -> {
            KnowledgeSession saved = invocation.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        SessionResponse response = knowledgeSessionService.createSession(1L, sessionRequest(2));

        assertThat(response.getSessionId()).isEqualTo(100L);
        assertThat(response.getStatus()).isEqualTo(SessionStatus.SCHEDULED);
        assertThat(response.getMentorId()).isEqualTo(1L);
        assertThat(response.getAvailableSeats()).isEqualTo(2);
        assertThat(response.getAverageFeedbackRating()).isNull();
    }

    @Test
    @DisplayName("createSession refuses an employee who is neither a mentor nor an L&D administrator")
    void nonMentorCannotCreateSession() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(userSkillRepository.findByUserId(2L))
                .thenReturn(List.of(userSkill(employee, ProficiencyLevel.BEGINNER)));
        when(mentorshipMatchRepository.findByMenteeIdOrMentorIdOrderByCreatedAtDesc(2L, 2L))
                .thenReturn(List.of());

        assertThatThrownBy(() -> knowledgeSessionService.createSession(2L, sessionRequest(2)))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Only mentors and L&D administrators");

        verify(sessionRepository, never()).save(any(KnowledgeSession.class));
    }

    @Test
    @DisplayName("createSession rejects a date in the past")
    void cannotScheduleInThePast() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(host));
        when(userSkillRepository.findByUserId(1L))
                .thenReturn(List.of(userSkill(host, ProficiencyLevel.EXPERT)));

        SessionRequest request = sessionRequest(2);
        request.setSessionDate(Instant.now().minus(1, ChronoUnit.DAYS));

        assertThatThrownBy(() -> knowledgeSessionService.createSession(1L, request))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("must be in the future");
    }

    // ── Editing and cancelling ──────────────────────────────────────────────────

    @Test
    @DisplayName("updateSession refuses to shrink capacity below the number already registered")
    void cannotShrinkCapacityBelowRegistrations() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(host));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdOrderByRegisteredAtAsc(100L))
                .thenReturn(List.of(registration(1L, employee, AttendanceStatus.REGISTERED, null),
                        registration(2L, otherEmployee, AttendanceStatus.REGISTERED, null)));

        assertThatThrownBy(() -> knowledgeSessionService.updateSession(1L, 100L, sessionRequest(1)))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Capacity cannot be reduced");
    }

    @Test
    @DisplayName("updateSession refuses anyone who is neither the host nor an administrator")
    void onlyHostOrAdminCanEdit() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(otherEmployee));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> knowledgeSessionService.updateSession(3L, 100L, sessionRequest(5)))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("cancelSession marks a session with registrations CANCELLED instead of deleting it")
    void cancelKeepsSessionWithRegistrations() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(host));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdOrderByRegisteredAtAsc(100L))
                .thenReturn(List.of(registration(1L, employee, AttendanceStatus.REGISTERED, null)));

        knowledgeSessionService.cancelSession(1L, 100L);

        assertThat(session.getStatus()).isEqualTo(SessionStatus.CANCELLED);
        verify(sessionRepository).save(session);
        verify(sessionRepository, never()).delete(any(KnowledgeSession.class));
    }

    @Test
    @DisplayName("cancelSession deletes a session that nobody registered for")
    void cancelDeletesEmptySession() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(host));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdOrderByRegisteredAtAsc(100L)).thenReturn(List.of());

        knowledgeSessionService.cancelSession(1L, 100L);

        verify(sessionRepository).delete(session);
        verify(sessionRepository, never()).save(any(KnowledgeSession.class));
    }

    // ── Registration ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("register adds an employee to a session that still has seats")
    void registerSucceeds() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdAndEmployeeId(100L, 2L)).thenReturn(Optional.empty());
        when(registrationRepository.countBySessionId(100L)).thenReturn(1L);
        when(registrationRepository.save(any(SessionRegistration.class))).thenAnswer(invocation -> {
            SessionRegistration saved = invocation.getArgument(0);
            saved.setId(7L);
            return saved;
        });

        SessionRegistrationResponse response = knowledgeSessionService.register(2L, 100L);

        assertThat(response.getRegistrationId()).isEqualTo(7L);
        assertThat(response.getAttendanceStatus()).isEqualTo(AttendanceStatus.REGISTERED);
        assertThat(response.getEmployeeId()).isEqualTo(2L);
    }

    @Test
    @DisplayName("register into a full session is rejected with a clear error")
    void registerRejectedWhenFull() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdAndEmployeeId(100L, 2L)).thenReturn(Optional.empty());
        when(registrationRepository.countBySessionId(100L)).thenReturn(2L);

        assertThatThrownBy(() -> knowledgeSessionService.register(2L, 100L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("is full (2/2 seats taken)");

        verify(registrationRepository, never()).save(any(SessionRegistration.class));
    }

    @Test
    @DisplayName("register twice is rejected rather than silently ignored")
    void duplicateRegistrationRejected() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdAndEmployeeId(100L, 2L))
                .thenReturn(Optional.of(registration(1L, employee, AttendanceStatus.REGISTERED, null)));

        assertThatThrownBy(() -> knowledgeSessionService.register(2L, 100L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already registered");

        verify(registrationRepository, never()).save(any(SessionRegistration.class));
    }

    @Test
    @DisplayName("register is rejected once a session is CANCELLED")
    void cannotRegisterForCancelledSession() {
        session.setStatus(SessionStatus.CANCELLED);
        when(userRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> knowledgeSessionService.register(2L, 100L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("not open for registration");
    }

    @Test
    @DisplayName("cancelRegistration frees the seat")
    void cancelRegistrationDeletesRow() {
        SessionRegistration existing = registration(1L, employee, AttendanceStatus.REGISTERED, null);
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdAndEmployeeId(100L, 2L)).thenReturn(Optional.of(existing));

        knowledgeSessionService.cancelRegistration(2L, 100L);

        verify(registrationRepository).delete(existing);
    }

    @Test
    @DisplayName("cancelRegistration is refused once attendance has been recorded")
    void cannotCancelAfterAttending() {
        SessionRegistration existing = registration(1L, employee, AttendanceStatus.ATTENDED, null);
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdAndEmployeeId(100L, 2L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> knowledgeSessionService.cancelRegistration(2L, 100L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Attendance has already been recorded");
    }

    // ── Attendance ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("markAttendance records ATTENDED and ABSENT per employee")
    void markAttendanceUpdatesRegistrations() {
        SessionRegistration first = registration(1L, employee, AttendanceStatus.REGISTERED, null);
        SessionRegistration second = registration(2L, otherEmployee, AttendanceStatus.REGISTERED, null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(host));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdOrderByRegisteredAtAsc(100L))
                .thenReturn(new ArrayList<>(List.of(first, second)));

        AttendanceRequest request = AttendanceRequest.builder()
                .entries(List.of(
                        new AttendanceEntry(2L, AttendanceStatus.ATTENDED),
                        new AttendanceEntry(3L, AttendanceStatus.ABSENT)))
                .build();

        SessionResponse response = knowledgeSessionService.markAttendance(1L, 100L, request);

        assertThat(first.getAttendanceStatus()).isEqualTo(AttendanceStatus.ATTENDED);
        assertThat(second.getAttendanceStatus()).isEqualTo(AttendanceStatus.ABSENT);
        assertThat(response.getAttendedCount()).isEqualTo(1);
        verify(registrationRepository).saveAll(anyCollection());
    }

    @Test
    @DisplayName("markAttendance rejects an employee who never registered")
    void cannotMarkUnregisteredEmployee() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(host));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdOrderByRegisteredAtAsc(100L)).thenReturn(List.of());

        AttendanceRequest request = AttendanceRequest.builder()
                .entries(List.of(new AttendanceEntry(2L, AttendanceStatus.ATTENDED)))
                .build();

        assertThatThrownBy(() -> knowledgeSessionService.markAttendance(1L, 100L, request))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("is not registered");
    }

    @Test
    @DisplayName("markAttendance refuses anyone who is neither the host nor an administrator")
    void onlyHostOrAdminCanMarkAttendance() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(otherEmployee));
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));

        AttendanceRequest request = AttendanceRequest.builder()
                .entries(List.of(new AttendanceEntry(2L, AttendanceStatus.ATTENDED)))
                .build();

        assertThatThrownBy(() -> knowledgeSessionService.markAttendance(3L, 100L, request))
                .isInstanceOf(ForbiddenException.class);
    }

    // ── Feedback and effectiveness ──────────────────────────────────────────────

    @Test
    @DisplayName("submitFeedback stores a rating once the employee is marked ATTENDED")
    void feedbackAcceptedAfterAttendance() {
        SessionRegistration attended = registration(1L, employee, AttendanceStatus.ATTENDED, null);
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdAndEmployeeId(100L, 2L)).thenReturn(Optional.of(attended));
        when(registrationRepository.save(any(SessionRegistration.class))).thenAnswer(i -> i.getArgument(0));

        SessionRegistrationResponse response = knowledgeSessionService.submitFeedback(2L, 100L,
                SessionFeedbackRequest.builder().rating(5).feedbackText("Excellent walkthrough").build());

        assertThat(response.getFeedbackRating()).isEqualTo(5);
        assertThat(response.getFeedbackText()).isEqualTo("Excellent walkthrough");
        assertThat(response.getFeedbackSubmittedAt()).isNotNull();
    }

    @Test
    @DisplayName("submitFeedback is rejected when the employee was not marked as attended")
    void feedbackRejectedWithoutAttendance() {
        SessionRegistration registered = registration(1L, employee, AttendanceStatus.REGISTERED, null);
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdAndEmployeeId(100L, 2L)).thenReturn(Optional.of(registered));

        assertThatThrownBy(() -> knowledgeSessionService.submitFeedback(2L, 100L,
                SessionFeedbackRequest.builder().rating(4).build()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("only be submitted once you are marked as ATTENDED");

        verify(registrationRepository, never()).save(any(SessionRegistration.class));
    }

    @Test
    @DisplayName("submitFeedback is rejected for an employee who never registered")
    void feedbackRejectedWithoutRegistration() {
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdAndEmployeeId(100L, 3L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> knowledgeSessionService.submitFeedback(3L, 100L,
                SessionFeedbackRequest.builder().rating(4).build()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("not registered");
    }

    @Test
    @DisplayName("getSession exposes the mean feedback rating as session effectiveness")
    void sessionEffectivenessAveragesFeedback() {
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdOrderByRegisteredAtAsc(100L))
                .thenReturn(List.of(
                        registration(1L, employee, AttendanceStatus.ATTENDED, 5),
                        registration(2L, otherEmployee, AttendanceStatus.ATTENDED, 4)));
        when(userRepository.findById(1L)).thenReturn(Optional.of(host));

        SessionResponse response = knowledgeSessionService.getSession(1L, 100L);

        assertThat(response.getAverageFeedbackRating()).isEqualTo(4.5);
        assertThat(response.getFeedbackCount()).isEqualTo(2);
        assertThat(response.getAttendedCount()).isEqualTo(2);
        assertThat(response.getRegistrations()).hasSize(2);
    }

    @Test
    @DisplayName("getSession hides other people's registrations from an employee who does not host it")
    void rosterHiddenFromNonHosts() {
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdOrderByRegisteredAtAsc(100L))
                .thenReturn(List.of(registration(1L, employee, AttendanceStatus.ATTENDED, 3)));
        when(userRepository.findById(3L)).thenReturn(Optional.of(otherEmployee));

        SessionResponse response = knowledgeSessionService.getSession(3L, 100L);

        // Cara is not the host and did not register, so she is told about nobody — but she is
        // told with an empty list rather than a null one, which is a shape her client can read.
        assertThat(response.getRegistrations()).isEmpty();
        assertThat(response.getAverageFeedbackRating()).isEqualTo(3.0);
    }

    @Test
    @DisplayName("getSession still shows an employee their own registration when the roster is hidden")
    void ownRegistrationVisibleToNonHost() {
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(registrationRepository.findBySessionIdOrderByRegisteredAtAsc(100L))
                .thenReturn(List.of(
                        registration(1L, employee, AttendanceStatus.ATTENDED, 3),
                        registration(2L, otherEmployee, AttendanceStatus.REGISTERED, null)));
        when(userRepository.findById(3L)).thenReturn(Optional.of(otherEmployee));

        SessionResponse response = knowledgeSessionService.getSession(3L, 100L);

        // Cara sees her own row and only her own: it is what tells her client to offer "Cancel"
        // rather than "Register", and Alice's attendance is still none of her business.
        assertThat(response.getRegistrations())
                .extracting(SessionRegistrationResponse::getEmployeeId)
                .containsExactly(3L);
    }

    @Test
    @DisplayName("listSessions carries each viewer's own registration so the browse list can be rendered")
    void listSessionsCarriesOwnRegistration() {
        when(sessionRepository.findByStatusOrderBySessionDateAsc(SessionStatus.SCHEDULED))
                .thenReturn(List.of(session));
        when(registrationRepository.findBySessionIdIn(anyCollection()))
                .thenReturn(List.of(
                        registration(1L, employee, AttendanceStatus.REGISTERED, null),
                        registration(2L, otherEmployee, AttendanceStatus.REGISTERED, null)));
        when(userRepository.findById(3L)).thenReturn(Optional.of(otherEmployee));

        List<SessionResponse> result = knowledgeSessionService.listSessions(
                3L, SessionStatus.SCHEDULED, null, false);

        // Never null: the browse list is the one place every client reads this field, and a null
        // here is what took the sessions page down.
        assertThat(result).singleElement()
                .extracting(SessionResponse::getRegistrations, list(SessionRegistrationResponse.class))
                .extracting(SessionRegistrationResponse::getEmployeeId)
                .containsExactly(3L);
    }

    @Test
    @DisplayName("listSessions gives the hosting mentor the full roster")
    void listSessionsGivesHostTheRoster() {
        when(sessionRepository.findByStatusOrderBySessionDateAsc(SessionStatus.SCHEDULED))
                .thenReturn(List.of(session));
        when(registrationRepository.findBySessionIdIn(anyCollection()))
                .thenReturn(List.of(
                        registration(1L, employee, AttendanceStatus.REGISTERED, null),
                        registration(2L, otherEmployee, AttendanceStatus.REGISTERED, null)));
        when(userRepository.findById(1L)).thenReturn(Optional.of(host));

        List<SessionResponse> result = knowledgeSessionService.listSessions(
                1L, SessionStatus.SCHEDULED, null, false);

        // The host marks attendance from this list, so it has to carry everybody.
        assertThat(result).singleElement()
                .extracting(SessionResponse::getRegistrations, list(SessionRegistrationResponse.class))
                .extracting(SessionRegistrationResponse::getEmployeeId)
                .containsExactlyInAnyOrder(2L, 3L);
    }

    // ── Browsing ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("listSessions with availableOnly hides sessions that are already full")
    void availableOnlyHidesFullSessions() {
        KnowledgeSession full = new KnowledgeSession();
        full.setId(101L);
        full.setTitle("Full Session");
        full.setMentor(host);
        full.setSessionDate(Instant.now().plus(3, ChronoUnit.DAYS));
        full.setDurationMinutes(60);
        full.setCapacity(1);
        full.setStatus(SessionStatus.SCHEDULED);

        when(sessionRepository.findByStatusOrderBySessionDateAsc(SessionStatus.SCHEDULED))
                .thenReturn(List.of(session, full));
        when(registrationRepository.findBySessionIdIn(anyCollection()))
                .thenReturn(List.of(registrationFor(full, 5L, employee)));

        List<SessionResponse> result = knowledgeSessionService.listSessions(null, null, null, true);

        assertThat(result).extracting(SessionResponse::getSessionId).containsExactly(100L);
    }

    // ── Helper methods ──────────────────────────────────────────────────────────

    private SessionRequest sessionRequest(int capacity) {
        return SessionRequest.builder()
                .title("Java Deep Dive")
                .description("Streams, records and virtual threads")
                .sessionDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .durationMinutes(90)
                .capacity(capacity)
                .build();
    }

    private User user(Long id, String name, Role role) {
        User created = new User();
        created.setId(id);
        created.setFullName(name);
        created.setEmail(name.split(" ")[0].toLowerCase() + "@corp.com");
        created.setDepartment("Engineering");
        created.setJobTitle("Software Engineer");
        created.setRole(role);
        created.setActive(true);
        return created;
    }

    private UserSkill userSkill(User owner, ProficiencyLevel level) {
        Skill skill = new Skill();
        skill.setId(10L);
        skill.setName("Java");
        UserSkill created = new UserSkill();
        created.setUser(owner);
        created.setSkill(skill);
        created.setProficiencyLevel(level);
        created.setRatingScore(4.0);
        return created;
    }

    private SessionRegistration registration(Long id, User attendee, AttendanceStatus status, Integer rating) {
        return registrationFor(session, id, attendee, status, rating);
    }

    private SessionRegistration registrationFor(KnowledgeSession target, Long id, User attendee) {
        return registrationFor(target, id, attendee, AttendanceStatus.REGISTERED, null);
    }

    private SessionRegistration registrationFor(KnowledgeSession target, Long id, User attendee,
                                                AttendanceStatus status, Integer rating) {
        SessionRegistration created = new SessionRegistration();
        created.setId(id);
        created.setSession(target);
        created.setEmployee(attendee);
        created.setAttendanceStatus(status);
        created.setFeedbackRating(rating);
        return created;
    }
}
