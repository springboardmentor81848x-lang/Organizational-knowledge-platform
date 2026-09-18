package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.expert.ExpertResponse;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.ExpertDirectoryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ExpertDirectoryController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class ExpertDirectoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExpertDirectoryService expertDirectoryService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser
    @DisplayName("GET /api/experts?skill= returns experts ordered by proficiency")
    void findExperts() throws Exception {
        when(expertDirectoryService.findExperts("Java", null)).thenReturn(List.of(
                expert(1L, "Bob Smith", ProficiencyLevel.EXPERT, 4.6),
                expert(4L, "Dan Reed", ProficiencyLevel.ADVANCED, null)));

        mockMvc.perform(get("/api/experts").param("skill", "Java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").value("Bob Smith"))
                .andExpect(jsonPath("$[0].skillName").value("Java"))
                .andExpect(jsonPath("$[0].proficiencyLevel").value("EXPERT"))
                .andExpect(jsonPath("$[0].department").value("Engineering"))
                .andExpect(jsonPath("$[0].mentorRating").value(4.6))
                .andExpect(jsonPath("$[1].proficiencyLevel").value("ADVANCED"))
                .andExpect(jsonPath("$[1].mentorRating").doesNotExist());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/experts passes an explicit minProficiency through")
    void findExpertsWithThreshold() throws Exception {
        when(expertDirectoryService.findExperts("Java", ProficiencyLevel.INTERMEDIATE)).thenReturn(List.of());

        mockMvc.perform(get("/api/experts").param("skill", "Java").param("minProficiency", "INTERMEDIATE"))
                .andExpect(status().isOk());

        verify(expertDirectoryService).findExperts("Java", ProficiencyLevel.INTERMEDIATE);
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/experts requires the skill parameter")
    void skillParameterIsRequired() throws Exception {
        mockMvc.perform(get("/api/experts"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/experts rejects an unknown minProficiency value")
    void invalidProficiencyIsRejected() throws Exception {
        mockMvc.perform(get("/api/experts").param("skill", "Java").param("minProficiency", "WIZARD"))
                .andExpect(status().isBadRequest());
    }

    private ExpertResponse expert(Long id, String name, ProficiencyLevel level, Double mentorRating) {
        return ExpertResponse.builder()
                .employeeId(id)
                .fullName(name)
                .email(name.split(" ")[0].toLowerCase() + "@corp.com")
                .department("Engineering")
                .jobTitle("Software Engineer")
                .skillId(1L)
                .skillName("Java")
                .proficiencyLevel(level)
                .ratingScore(5.0)
                .mentorRating(mentorRating)
                .mentorRatingCount(mentorRating != null ? 3L : 0L)
                .completedMentorships(1L)
                .build();
    }
}
