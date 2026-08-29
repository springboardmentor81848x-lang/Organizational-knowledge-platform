package com.orgskills.intelligence.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultRequest;
import com.orgskills.intelligence.dto.assessment.AssessmentResultResponse;
import com.orgskills.intelligence.dto.assessment.CreateAssessmentRequest;
import com.orgskills.intelligence.dto.assessment.SkillProgressionResponse;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.AssessmentService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AssessmentController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class AssessmentControllerTest {

    private static final Instant DATE = Instant.parse("2026-03-01T00:00:00Z");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AssessmentService assessmentService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("POST /api/assessments schedules an assessment and returns 201")
    void createAssessment() throws Exception {
        when(assessmentService.createAssessment(eq(2L), any(CreateAssessmentRequest.class)))
                .thenReturn(response(AssessmentStatus.PENDING, null, null));

        mockMvc.perform(post("/api/assessments").principal(principal(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assessmentId").value(500))
                .andExpect(jsonPath("$.employeeId").value(1))
                .andExpect(jsonPath("$.assessmentType").value("MANAGER"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("POST /api/assessments rejects a body with no skills")
    void createAssessmentValidatesBody() throws Exception {
        CreateAssessmentRequest invalid = createRequest();
        invalid.setSkillIds(List.of());

        mockMvc.perform(post("/api/assessments").principal(principal(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/assessments/{id}/submit returns the completed assessment with improvement")
    void submitAssessment() throws Exception {
        when(assessmentService.submitAssessment(eq(2L), eq(500L), any(SubmitAssessmentRequest.class)))
                .thenReturn(response(AssessmentStatus.COMPLETED, ProficiencyLevel.ADVANCED, 2));

        mockMvc.perform(post("/api/assessments/500/submit").principal(principal(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.results[0].proficiency").value("ADVANCED"))
                .andExpect(jsonPath("$.results[0].proficiencyScore").value(3))
                .andExpect(jsonPath("$.results[0].improvement").value(2));
    }

    @Test
    @DisplayName("POST /api/assessments/{id}/submit surfaces an out-of-range proficiency as 400")
    void submitRejectsInvalidProficiency() throws Exception {
        when(assessmentService.submitAssessment(eq(2L), eq(500L), any(SubmitAssessmentRequest.class)))
                .thenThrow(new ValidationException("Skill 10: Proficiency score must be between 0 and 4, got: 7"));

        mockMvc.perform(post("/api/assessments/500/submit").principal(principal(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitRequest())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/assessments/{id}/submit rejects an empty result list")
    void submitValidatesBody() throws Exception {
        mockMvc.perform(post("/api/assessments/500/submit").principal(principal(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"results\":[]}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/assessments/{id}/results lists the awarded levels")
    void getResults() throws Exception {
        when(assessmentService.getResults(1L, 500L)).thenReturn(List.of(resultResponse(ProficiencyLevel.ADVANCED, 2)));

        mockMvc.perform(get("/api/assessments/500/results").principal(principal(1L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].skillName").value("Spring Boot"))
                .andExpect(jsonPath("$[0].previousProficiency").value("BEGINNER"))
                .andExpect(jsonPath("$[0].improvement").value(2));
    }

    @Test
    @DisplayName("GET /api/assessments?employeeId= returns that employee's history")
    void getAssessmentsByEmployee() throws Exception {
        when(assessmentService.getAssessments(2L, 1L))
                .thenReturn(List.of(response(AssessmentStatus.COMPLETED, ProficiencyLevel.ADVANCED, 2)));

        mockMvc.perform(get("/api/assessments").principal(principal(2L)).param("employeeId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].assessmentId").value(500))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"));
    }

    @Test
    @DisplayName("GET /api/assessments without employeeId defaults to the caller")
    void getAssessmentsDefaultsToCaller() throws Exception {
        when(assessmentService.getAssessments(eq(1L), isNull())).thenReturn(List.of());

        mockMvc.perform(get("/api/assessments").principal(principal(1L)))
                .andExpect(status().isOk());

        verify(assessmentService).getAssessments(1L, null);
    }

    @Test
    @DisplayName("GET /api/assessments/history/{employeeId} returns previous versus current per skill")
    void getHistory() throws Exception {
        when(assessmentService.getHistory(1L, 1L)).thenReturn(List.of(SkillProgressionResponse.builder()
                .skillId(10L)
                .skillName("Spring Boot")
                .previousProficiency(ProficiencyLevel.BEGINNER)
                .previousScore(1)
                .previousAssessedAt(DATE.minusSeconds(86400))
                .currentProficiency(ProficiencyLevel.ADVANCED)
                .currentScore(3)
                .currentAssessedAt(DATE)
                .improvement(2)
                .assessmentCount(2)
                .build()));

        mockMvc.perform(get("/api/assessments/history/1").principal(principal(1L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].previousProficiency").value("BEGINNER"))
                .andExpect(jsonPath("$[0].currentProficiency").value("ADVANCED"))
                .andExpect(jsonPath("$[0].improvement").value(2))
                .andExpect(jsonPath("$[0].assessmentCount").value(2));
    }

    private CreateAssessmentRequest createRequest() {
        CreateAssessmentRequest request = new CreateAssessmentRequest();
        request.setEmployeeId(1L);
        request.setAssessmentType(AssessmentType.MANAGER);
        request.setSkillIds(List.of(10L));
        return request;
    }

    private SubmitAssessmentRequest submitRequest() {
        SubmitAssessmentRequest request = new SubmitAssessmentRequest();
        request.setResults(List.of(new AssessmentResultRequest(10L, ProficiencyLevel.ADVANCED)));
        return request;
    }

    private AssessmentResponse response(AssessmentStatus status, ProficiencyLevel proficiency, Integer improvement) {
        return AssessmentResponse.builder()
                .assessmentId(500L)
                .employeeId(1L)
                .employeeName("Alice Johnson")
                .assessorId(2L)
                .assessorName("Bob Smith")
                .assessmentType(AssessmentType.MANAGER)
                .status(status)
                .date(DATE)
                .submittedAt(status == AssessmentStatus.COMPLETED ? DATE : null)
                .results(proficiency == null ? List.of() : List.of(resultResponse(proficiency, improvement)))
                .build();
    }

    private AssessmentResultResponse resultResponse(ProficiencyLevel proficiency, Integer improvement) {
        return AssessmentResultResponse.builder()
                .resultId(900L)
                .assessmentId(500L)
                .skillId(10L)
                .skillName("Spring Boot")
                .proficiency(proficiency)
                .proficiencyScore(proficiency.getScore())
                .previousProficiency(ProficiencyLevel.BEGINNER)
                .improvement(improvement)
                .build();
    }

    private Authentication principal(Long userId) {
        CustomPrincipal customPrincipal = new CustomPrincipal(userId, "user@orgskills.com", "",
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));
        return new UsernamePasswordAuthenticationToken(customPrincipal, null, customPrincipal.getAuthorities());
    }
}
