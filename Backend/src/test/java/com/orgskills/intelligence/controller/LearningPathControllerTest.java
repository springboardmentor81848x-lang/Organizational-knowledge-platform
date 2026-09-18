package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.ld.LearningPathResponse;
import com.orgskills.intelligence.dto.ld.LearningPathStepResponse;
import com.orgskills.intelligence.entity.LearningPath;
import com.orgskills.intelligence.entity.LearningPathStep;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.LearningPathService;
import com.orgskills.intelligence.repository.LearningPathStepRepository;
import com.orgskills.intelligence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = LearningPathController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class LearningPathControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LearningPathService learningPathService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private LearningPathStepRepository learningPathStepRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    private UsernamePasswordAuthenticationToken auth;

    @BeforeEach
    void setUpSecurityContext() {
        CustomPrincipal principal = new CustomPrincipal(
                100L,
                "dev@company.com",
                "password",
                true,
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))
        );
        auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );
    }

    @Test
    @DisplayName("POST /api/learning-paths/{employeeId}/generate generates and returns learning paths")
    void testGenerateLearningPaths() throws Exception {
        LearningPathStepResponse step = LearningPathStepResponse.builder()
                .id(1L)
                .stepOrder(1)
                .difficultyStage("BEGINNER")
                .courseTitle("Java Fundamentals")
                .estimatedHours(5)
                .status("NOT_STARTED")
                .build();

        LearningPathResponse pathResponse = LearningPathResponse.builder()
                .id(10L)
                .employeeId(100L)
                .targetSkillId(1L)
                .targetSkillName("Java")
                .title("Java: Beginner to Advanced")
                .totalEstimatedHours(5)
                .estimatedCalendarTime("Est. 2 weeks")
                .status("NOT_STARTED")
                .overallProgressPercent(0)
                .noCoursesAvailable(false)
                .steps(List.of(step))
                .build();

        when(learningPathService.generateLearningPathsForEmployee(100L)).thenReturn(List.of(pathResponse));

        mockMvc.perform(post("/api/learning-paths/100/generate").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].title").value("Java: Beginner to Advanced"))
                .andExpect(jsonPath("$[0].totalEstimatedHours").value(5))
                .andExpect(jsonPath("$[0].estimatedCalendarTime").value("Est. 2 weeks"))
                .andExpect(jsonPath("$[0].steps[0].courseTitle").value("Java Fundamentals"));
    }

    @Test
    @DisplayName("GET /api/learning-paths/{employeeId} returns list of employee learning paths")
    void testGetLearningPaths() throws Exception {
        LearningPathResponse pathResponse = LearningPathResponse.builder()
                .id(10L)
                .employeeId(100L)
                .title("Spring Boot Roadmap")
                .status("IN_PROGRESS")
                .overallProgressPercent(50)
                .build();

        when(learningPathService.getLearningPathsForEmployee(100L)).thenReturn(List.of(pathResponse));

        mockMvc.perform(get("/api/learning-paths/100").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].title").value("Spring Boot Roadmap"))
                .andExpect(jsonPath("$[0].overallProgressPercent").value(50));
    }

    @Test
    @DisplayName("GET /api/learning-paths/{employeeId}/{pathId} returns single path detail")
    void testGetLearningPathDetail() throws Exception {
        LearningPathResponse pathResponse = LearningPathResponse.builder()
                .id(10L)
                .employeeId(100L)
                .title("Spring Boot Roadmap")
                .status("IN_PROGRESS")
                .overallProgressPercent(50)
                .build();

        when(learningPathService.getLearningPathDetail(100L, 10L)).thenReturn(pathResponse);

        mockMvc.perform(get("/api/learning-paths/100/10").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("Spring Boot Roadmap"));
    }

    @Test
    @DisplayName("PUT /api/learning-paths/steps/{stepId}/complete marks step complete")
    void testCompleteStep() throws Exception {
        User user = new User();
        user.setId(100L);

        LearningPath path = new LearningPath();
        path.setId(10L);
        path.setEmployee(user);

        LearningPathStep step = new LearningPathStep();
        step.setId(1L);
        step.setLearningPath(path);

        LearningPathResponse updatedPath = LearningPathResponse.builder()
                .id(10L)
                .employeeId(100L)
                .status("COMPLETED")
                .overallProgressPercent(100)
                .build();

        when(learningPathStepRepository.findById(1L)).thenReturn(Optional.of(step));
        when(learningPathService.completeStepManually(1L)).thenReturn(updatedPath);

        mockMvc.perform(put("/api/learning-paths/steps/1/complete").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.overallProgressPercent").value(100));
    }
}
