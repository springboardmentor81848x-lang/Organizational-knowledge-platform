package com.orgskills.intelligence.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.mentorship.MentorshipRequest;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.dto.mentorship.RecommendedMentorResponse;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.MentorshipService;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MentorshipController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class MentorshipControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MentorshipService mentorshipService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser
    @DisplayName("GET /api/mentorships/recommendations returns ranked mentor suggestions")
    void getRecommendations() throws Exception {
        RecommendedMentorResponse mentor = RecommendedMentorResponse.builder()
                .mentorId(2L)
                .mentorName("Bob Mentor")
                .mentorEmail("bob@corp.com")
                .department("Engineering")
                .jobTitle("Principal Engineer")
                .skillId(10L)
                .skillName("Java")
                .mentorProficiency(ProficiencyLevel.EXPERT)
                .mentorRatingScore(5.0)
                .menteeProficiency(ProficiencyLevel.BEGINNER)
                .sameDepartment(true)
                .available(true)
                .activeMentorships(1L)
                .completedMentorships(3L)
                .matchScore(86.0)
                .reasons(List.of("Works in the same department (Engineering)."))
                .build();
        when(mentorshipService.findRecommendedMentors(1L, 10L)).thenReturn(List.of(mentor));

        mockMvc.perform(get("/api/mentorships/recommendations")
                        .param("employeeId", "1")
                        .param("skillId", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].mentorId").value(2))
                .andExpect(jsonPath("$[0].mentorProficiency").value("EXPERT"))
                .andExpect(jsonPath("$[0].sameDepartment").value(true))
                .andExpect(jsonPath("$[0].matchScore").value(86.0));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/mentorships creates a REQUESTED mentorship")
    void requestMentorship() throws Exception {
        MentorshipRequest request = MentorshipRequest.builder()
                .menteeId(1L)
                .mentorId(2L)
                .skillId(10L)
                .goal("Reach ADVANCED in Java")
                .startDate(LocalDate.of(2026, 9, 1))
                .build();
        when(mentorshipService.requestMentorship(any(MentorshipRequest.class)))
                .thenReturn(response(MentorshipStatus.REQUESTED));

        mockMvc.perform(post("/api/mentorships")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mentorshipId").value(42))
                .andExpect(jsonPath("$.status").value("REQUESTED"))
                .andExpect(jsonPath("$.goal").value("Reach ADVANCED in Java"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/mentorships rejects a request that is missing the mentor id")
    void requestMentorshipValidatesBody() throws Exception {
        MentorshipRequest request = MentorshipRequest.builder().menteeId(1L).skillId(10L).build();

        mockMvc.perform(post("/api/mentorships")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/mentorships/{id}/accept activates the mentorship")
    void acceptMentorship() throws Exception {
        when(mentorshipService.acceptMentorship(42L, 2L)).thenReturn(response(MentorshipStatus.ACTIVE));

        mockMvc.perform(put("/api/mentorships/42/accept").principal(principal(2L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("PUT /api/mentorships/{id}/reject rejects the mentorship")
    void rejectMentorship() throws Exception {
        when(mentorshipService.rejectMentorship(42L, 2L)).thenReturn(response(MentorshipStatus.REJECTED));

        mockMvc.perform(put("/api/mentorships/42/reject").principal(principal(2L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    @DisplayName("PUT /api/mentorships/{id}/accept surfaces a duplicate ACTIVE mentorship as 400")
    void acceptSurfacesValidationFailure() throws Exception {
        when(mentorshipService.acceptMentorship(42L, 2L))
                .thenThrow(new ValidationException("The mentee already has an ACTIVE mentorship for Java"));

        mockMvc.perform(put("/api/mentorships/42/accept").principal(principal(2L)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/mentorships lists the mentorships for an employee")
    void listMentorships() throws Exception {
        when(mentorshipService.getMentorshipsForUser(1L)).thenReturn(List.of(response(MentorshipStatus.ACTIVE)));

        mockMvc.perform(get("/api/mentorships").param("employeeId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].mentorshipId").value(42))
                .andExpect(jsonPath("$[0].menteeId").value(1))
                .andExpect(jsonPath("$[0].mentorId").value(2));
    }

    private MentorshipResponse response(MentorshipStatus status) {
        return MentorshipResponse.builder()
                .mentorshipId(42L)
                .mentorId(2L)
                .mentorName("Bob Mentor")
                .menteeId(1L)
                .menteeName("Alice Mentee")
                .skillId(10L)
                .skillName("Java")
                .goal("Reach ADVANCED in Java")
                .startDate(LocalDate.of(2026, 9, 1))
                .status(status)
                .createdAt(Instant.parse("2026-08-26T10:00:00Z"))
                .build();
    }

    private Authentication principal(Long userId) {
        CustomPrincipal customPrincipal = new CustomPrincipal(userId, "mentor@corp.com", "n/a",
                true,
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
        return new UsernamePasswordAuthenticationToken(customPrincipal, "n/a", customPrincipal.getAuthorities());
    }
}
