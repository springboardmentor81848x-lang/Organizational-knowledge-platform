package com.orgskills.intelligence.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.session.AttendanceEntry;
import com.orgskills.intelligence.dto.session.AttendanceRequest;
import com.orgskills.intelligence.dto.session.SessionFeedbackRequest;
import com.orgskills.intelligence.dto.session.SessionRegistrationResponse;
import com.orgskills.intelligence.dto.session.SessionRequest;
import com.orgskills.intelligence.dto.session.SessionResponse;
import com.orgskills.intelligence.entity.enums.AttendanceStatus;
import com.orgskills.intelligence.entity.enums.SessionStatus;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.KnowledgeSessionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = KnowledgeSessionController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class KnowledgeSessionControllerTest {

    private static final Instant FUTURE = Instant.parse("2026-12-01T10:00:00Z");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private KnowledgeSessionService knowledgeSessionService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("POST /api/sessions creates a session for the acting mentor")
    void createSession() throws Exception {
        when(knowledgeSessionService.createSession(eq(1L), any(SessionRequest.class))).thenReturn(sessionResponse());

        mockMvc.perform(post("/api/sessions").principal(principal(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionId").value(100))
                .andExpect(jsonPath("$.status").value("SCHEDULED"))
                .andExpect(jsonPath("$.availableSeats").value(1));
    }

    @Test
    @DisplayName("POST /api/sessions rejects a body without a title")
    void createSessionValidatesBody() throws Exception {
        SessionRequest invalid = sessionRequest();
        invalid.setTitle("  ");

        mockMvc.perform(post("/api/sessions").principal(principal(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/sessions surfaces a non-mentor host as 401")
    void createSessionRejectsNonMentor() throws Exception {
        when(knowledgeSessionService.createSession(eq(2L), any(SessionRequest.class)))
                .thenThrow(new UnauthorizedException("Only mentors and L&D administrators can host sessions"));

        mockMvc.perform(post("/api/sessions").principal(principal(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/sessions/{id} edits a session")
    void updateSession() throws Exception {
        when(knowledgeSessionService.updateSession(eq(1L), eq(100L), any(SessionRequest.class)))
                .thenReturn(sessionResponse());

        mockMvc.perform(put("/api/sessions/100").principal(principal(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value(100));
    }

    @Test
    @DisplayName("DELETE /api/sessions/{id} cancels a session")
    void cancelSession() throws Exception {
        mockMvc.perform(delete("/api/sessions/100").principal(principal(1L)))
                .andExpect(status().isNoContent());

        verify(knowledgeSessionService).cancelSession(1L, 100L);
    }

    @Test
    @DisplayName("GET /api/sessions browses available sessions")
    void listSessions() throws Exception {
        when(knowledgeSessionService.listSessions(null, null, true)).thenReturn(List.of(sessionResponse()));

        mockMvc.perform(get("/api/sessions").param("availableOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sessionId").value(100))
                .andExpect(jsonPath("$[0].full").value(false));
    }

    @Test
    @DisplayName("GET /api/sessions/{id} exposes the average feedback rating")
    void getSessionExposesEffectiveness() throws Exception {
        when(knowledgeSessionService.getSession(1L, 100L)).thenReturn(sessionResponse());

        mockMvc.perform(get("/api/sessions/100").principal(principal(1L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageFeedbackRating").value(4.5))
                .andExpect(jsonPath("$.feedbackCount").value(2))
                .andExpect(jsonPath("$.attendedCount").value(2));
    }

    @Test
    @DisplayName("POST /api/sessions/{id}/register registers the caller")
    void register() throws Exception {
        when(knowledgeSessionService.register(2L, 100L)).thenReturn(registrationResponse(AttendanceStatus.REGISTERED, null));

        mockMvc.perform(post("/api/sessions/100/register").principal(principal(2L)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.registrationId").value(7))
                .andExpect(jsonPath("$.attendanceStatus").value("REGISTERED"));
    }

    @Test
    @DisplayName("POST /api/sessions/{id}/register returns 400 with a clear message when the session is full")
    void registerFullSessionReturnsClearError() throws Exception {
        when(knowledgeSessionService.register(2L, 100L))
                .thenThrow(new ValidationException("Session \"Java Deep Dive\" is full (2/2 seats taken)"));

        mockMvc.perform(post("/api/sessions/100/register").principal(principal(2L)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Session \"Java Deep Dive\" is full (2/2 seats taken)"));
    }

    @Test
    @DisplayName("DELETE /api/sessions/{id}/register cancels the caller's registration")
    void cancelRegistration() throws Exception {
        mockMvc.perform(delete("/api/sessions/100/register").principal(principal(2L)))
                .andExpect(status().isNoContent());

        verify(knowledgeSessionService).cancelRegistration(2L, 100L);
    }

    @Test
    @DisplayName("PUT /api/sessions/{id}/attendance marks attendance per employee")
    void markAttendance() throws Exception {
        AttendanceRequest request = AttendanceRequest.builder()
                .entries(List.of(new AttendanceEntry(2L, AttendanceStatus.ATTENDED)))
                .build();
        when(knowledgeSessionService.markAttendance(eq(1L), eq(100L), any(AttendanceRequest.class)))
                .thenReturn(sessionResponse());

        mockMvc.perform(put("/api/sessions/100/attendance").principal(principal(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attendedCount").value(2));
    }

    @Test
    @DisplayName("PUT /api/sessions/{id}/attendance rejects an empty entry list")
    void markAttendanceValidatesBody() throws Exception {
        mockMvc.perform(put("/api/sessions/100/attendance").principal(principal(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AttendanceRequest.builder().entries(List.of()).build())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/sessions/{id}/feedback stores a rating")
    void submitFeedback() throws Exception {
        when(knowledgeSessionService.submitFeedback(eq(2L), eq(100L), any(SessionFeedbackRequest.class)))
                .thenReturn(registrationResponse(AttendanceStatus.ATTENDED, 5));

        mockMvc.perform(post("/api/sessions/100/feedback").principal(principal(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                SessionFeedbackRequest.builder().rating(5).feedbackText("Great").build())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.feedbackRating").value(5));
    }

    @Test
    @DisplayName("POST /api/sessions/{id}/feedback rejects a rating outside 1-5")
    void feedbackRatingIsBounded() throws Exception {
        mockMvc.perform(post("/api/sessions/100/feedback").principal(principal(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                SessionFeedbackRequest.builder().rating(9).build())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/sessions/{id}/feedback returns 400 when attendance was not recorded")
    void feedbackWithoutAttendanceReturns400() throws Exception {
        doThrow(new ValidationException("Feedback can only be submitted once you are marked as ATTENDED"))
                .when(knowledgeSessionService).submitFeedback(eq(2L), eq(100L), any(SessionFeedbackRequest.class));

        mockMvc.perform(post("/api/sessions/100/feedback").principal(principal(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                SessionFeedbackRequest.builder().rating(4).build())))
                .andExpect(status().isBadRequest());
    }

    private SessionRequest sessionRequest() {
        return SessionRequest.builder()
                .title("Java Deep Dive")
                .description("Streams, records and virtual threads")
                .sessionDate(FUTURE)
                .durationMinutes(90)
                .capacity(3)
                .build();
    }

    private SessionResponse sessionResponse() {
        return SessionResponse.builder()
                .sessionId(100L)
                .title("Java Deep Dive")
                .description("Streams, records and virtual threads")
                .mentorId(1L)
                .mentorName("Bob Smith")
                .sessionDate(FUTURE)
                .durationMinutes(90)
                .capacity(3)
                .status(SessionStatus.SCHEDULED)
                .registeredCount(2)
                .availableSeats(1)
                .full(false)
                .attendedCount(2)
                .feedbackCount(2)
                .averageFeedbackRating(4.5)
                .createdAt(FUTURE.minus(30, ChronoUnit.DAYS))
                .updatedAt(FUTURE.minus(30, ChronoUnit.DAYS))
                .build();
    }

    private SessionRegistrationResponse registrationResponse(AttendanceStatus status, Integer rating) {
        return SessionRegistrationResponse.builder()
                .registrationId(7L)
                .sessionId(100L)
                .sessionTitle("Java Deep Dive")
                .employeeId(2L)
                .employeeName("Alice Johnson")
                .attendanceStatus(status)
                .feedbackRating(rating)
                .registeredAt(FUTURE.minus(10, ChronoUnit.DAYS))
                .build();
    }

    private Authentication principal(Long userId) {
        CustomPrincipal customPrincipal = new CustomPrincipal(userId, "user@corp.com", "n/a",
                true,
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
        return new UsernamePasswordAuthenticationToken(customPrincipal, "n/a", customPrincipal.getAuthorities());
    }
}
