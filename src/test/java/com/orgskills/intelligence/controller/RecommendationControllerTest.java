package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.recommendation.RankedRecommendationResponse;
import com.orgskills.intelligence.dto.recommendation.RecommendationResponse;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.RecommendationScoringService;
import com.orgskills.intelligence.service.RecommendationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = RecommendationController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class RecommendationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RecommendationService recommendationService;

    @MockBean
    private RecommendationScoringService recommendationScoringService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("GET /api/recommendations/{employeeId}/ranked returns ranked CourseRecommendationScores")
    void testGetRankedRecommendations() throws Exception {
        Skill skill = new Skill(10L, "Java", "Backend", "Java Programming", null, null, null, null);
        Course course = new Course(101L, "Java 101", "Intro course", "Internal L&D", skill, "BEGINNER", 10.0, true, null, null);

        RankedRecommendationResponse score = RankedRecommendationResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .courseProvider(course.getProvider())
                .skillId(skill.getId())
                .skillName(skill.getName())
                .score(88.5)
                .scoreBreakdown("Gap Severity: 70.0 (wt 35%), Role Relevance: 100.0 (wt 25%), Proficiency Fit: 100.0 (wt 20%), Course Quality: 100.0 (wt 10%), Recency: 85.0 (wt 10%) | Total: 88.5/100")
                .build();

        when(recommendationScoringService.rankedRecommendationsFor(1L)).thenReturn(List.of(score));

        // Flat fields, not nested entities: the response must not carry a Course or a Skill,
        // because those arrive here as Hibernate proxies that cannot be serialised.
        mockMvc.perform(get("/api/recommendations/1/ranked"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].score").value(88.5))
                .andExpect(jsonPath("$[0].courseTitle").value("Java 101"))
                .andExpect(jsonPath("$[0].skillName").value("Java"))
                .andExpect(jsonPath("$[0].scoreBreakdown").value(score.getScoreBreakdown()));
    }

    @Test
    @DisplayName("GET /api/recommendations/{employeeId} returns recommendations list")
    void testGetByEmployee() throws Exception {
        RecommendationResponse rec = RecommendationResponse.builder()
                .id(1L)
                .employeeId(1L)
                .skillId(10L)
                .skillName("Java")
                .recommendationText("Improve Java skills")
                .suggestedResourceType("Course")
                .priorityRank(1)
                .sourceGapSeverity("CRITICAL")
                .relevanceScore(88.5)
                .scoreBreakdown("Gap Severity: 70.0 ...")
                .build();

        when(recommendationService.getByEmployee(1L)).thenReturn(List.of(rec));

        mockMvc.perform(get("/api/recommendations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].skillName").value("Java"))
                .andExpect(jsonPath("$[0].relevanceScore").value(88.5))
                .andExpect(jsonPath("$[0].scoreBreakdown").value("Gap Severity: 70.0 ..."));
    }

    @Test
    @DisplayName("POST /api/recommendations/{employeeId} triggers recommendation generation")
    void testGenerate() throws Exception {
        RecommendationResponse rec = RecommendationResponse.builder()
                .id(1L)
                .employeeId(1L)
                .skillId(10L)
                .skillName("Java")
                .recommendationText("Improve Java skills")
                .suggestedResourceType("Course")
                .priorityRank(1)
                .sourceGapSeverity("CRITICAL")
                .relevanceScore(88.5)
                .scoreBreakdown("Gap Severity: 70.0 ...")
                .build();

        when(recommendationService.generateRecommendations(1L)).thenReturn(List.of(rec));

        mockMvc.perform(post("/api/recommendations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].skillName").value("Java"));
    }
}
