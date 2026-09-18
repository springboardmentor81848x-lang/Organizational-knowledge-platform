package com.orgskills.intelligence.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.employee.LearningMilestoneResponse;
import com.orgskills.intelligence.dto.employee.UpdateProgressRequest;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.TrainingProgressService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TrainingProgressController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class TrainingProgressControllerTest {

    private static final Instant START = Instant.parse("2026-01-01T00:00:00Z");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TrainingProgressService trainingProgressService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("POST /api/enrollments enrols the caller and returns 201")
    void enroll() throws Exception {
        when(trainingProgressService.enroll(eq(1L), any(EnrollmentRequest.class)))
                .thenReturn(enrollmentResponse(EnrollmentStatus.NOT_STARTED, 0.0, null));

        mockMvc.perform(post("/api/enrollments").principal(principal(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EnrollmentRequest(10L))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.enrollmentId").value(100))
                .andExpect(jsonPath("$.trainingId").value(10))
                .andExpect(jsonPath("$.status").value("NOT_STARTED"))
                .andExpect(jsonPath("$.milestones[0].title").value("Core Java"));
    }

    @Test
    @DisplayName("POST /api/enrollments rejects a body without a training id")
    void enrollValidatesBody() throws Exception {
        mockMvc.perform(post("/api/enrollments").principal(principal(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/enrollments surfaces a duplicate active enrollment as 400")
    void enrollRejectsDuplicate() throws Exception {
        when(trainingProgressService.enroll(eq(1L), any(EnrollmentRequest.class)))
                .thenThrow(new ValidationException("Employee is already enrolled in Core Java and has not completed it yet"));

        mockMvc.perform(post("/api/enrollments").principal(principal(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EnrollmentRequest(10L))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/enrollments?employeeId= lists that employee's enrollments")
    void listByEmployeeId() throws Exception {
        when(trainingProgressService.getEnrollments(1L, 3L))
                .thenReturn(List.of(enrollmentResponse(EnrollmentStatus.IN_PROGRESS, 40.0, null)));

        mockMvc.perform(get("/api/enrollments").principal(principal(1L)).param("employeeId", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].progress").value(40.0))
                .andExpect(jsonPath("$[0].startDate").exists())
                .andExpect(jsonPath("$[0].milestones[0].status").value("NOT_STARTED"));
    }

    @Test
    @DisplayName("GET /api/enrollments without employeeId defaults to the caller")
    void listDefaultsToCaller() throws Exception {
        when(trainingProgressService.getEnrollments(eq(1L), isNull())).thenReturn(List.of());

        mockMvc.perform(get("/api/enrollments").principal(principal(1L)))
                .andExpect(status().isOk());

        verify(trainingProgressService).getEnrollments(1L, null);
    }

    @Test
    @DisplayName("PUT /api/enrollments/{id}/progress updates the overall percentage")
    void updateProgress() throws Exception {
        when(trainingProgressService.updateProgress(eq(1L), eq(100L), any(UpdateProgressRequest.class)))
                .thenReturn(enrollmentResponse(EnrollmentStatus.IN_PROGRESS, 80.0, null));

        mockMvc.perform(put("/api/enrollments/100/progress").principal(principal(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateProgressRequest(80.0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progress").value(80.0))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("PUT /api/enrollments/{id}/progress rejects a percentage above 100")
    void updateProgressValidatesRange() throws Exception {
        mockMvc.perform(put("/api/enrollments/100/progress").principal(principal(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateProgressRequest(140.0))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/enrollments/{id}/complete returns the completed enrollment")
    void complete() throws Exception {
        when(trainingProgressService.complete(1L, 100L))
                .thenReturn(enrollmentResponse(EnrollmentStatus.COMPLETED, 100.0, START.plusSeconds(86400)));

        mockMvc.perform(put("/api/enrollments/100/complete").principal(principal(1L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.progress").value(100.0))
                .andExpect(jsonPath("$.completionDate").exists());
    }

    private EnrollmentResponse enrollmentResponse(EnrollmentStatus status, Double progress, Instant completionDate) {
        return EnrollmentResponse.builder()
                .enrollmentId(100L)
                .employeeId(1L)
                .employeeName("Alice Johnson")
                .trainingId(10L)
                .trainingTitle("Advanced Java Concurrency")
                .provider("Coursera")
                .status(status)
                .progress(progress)
                .startDate(START)
                .completionDate(completionDate)
                .milestones(List.of(LearningMilestoneResponse.builder()
                        .milestoneId(1L)
                        .trainingId(10L)
                        .title("Core Java")
                        .sequence(1)
                        .completionPercentage(0.0)
                        .status(EnrollmentStatus.NOT_STARTED)
                        .build()))
                .build();
    }

    private Authentication principal(Long userId) {
        CustomPrincipal customPrincipal = new CustomPrincipal(userId, "user@orgskills.com", "",
                true,
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
        return new UsernamePasswordAuthenticationToken(customPrincipal, null, customPrincipal.getAuthorities());
    }
}
