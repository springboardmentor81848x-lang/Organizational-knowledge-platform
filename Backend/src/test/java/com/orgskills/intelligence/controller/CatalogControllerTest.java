package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.ld.CatalogImportResult;
import com.orgskills.intelligence.dto.ld.ExternalCourseResponse;
import com.orgskills.intelligence.security.JwtAuthenticationFilter;
import com.orgskills.intelligence.security.JwtTokenProvider;
import com.orgskills.intelligence.service.ExternalCatalogService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CatalogController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class CatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExternalCatalogService externalCatalogService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("POST /api/catalog/import/provider/{providerName} should return 201 Created")
    void importFromProvider_success() throws Exception {
        ExternalCourseResponse response = ExternalCourseResponse.builder()
                .id(1L)
                .title("Spring Boot Essentials")
                .provider("Coursera")
                .durationHours(8.0)
                .durationLabel("8 Hours")
                .difficulty("BEGINNER")
                .externalUrl("https://coursera.org/learn/springboot")
                .isInternal(false)
                .createdAt(Instant.now())
                .build();

        when(externalCatalogService.importFromProvider("Coursera", "springboot"))
                .thenReturn(CatalogImportResult.builder()
                        .source("Coursera")
                        .fromProvider(true)
                        .rowsRead(1)
                        .created(1)
                        .updated(0)
                        .skipped(0)
                        .errors(List.of())
                        .courses(List.of(response))
                        .build());

        mockMvc.perform(post("/api/catalog/import/provider/Coursera")
                        .param("skill", "springboot"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rowsRead").value(1))
                .andExpect(jsonPath("$.created").value(1))
                .andExpect(jsonPath("$.skipped").value(0))
                .andExpect(jsonPath("$.fromProvider").value(true))
                .andExpect(jsonPath("$.courses[0].id").value(1))
                .andExpect(jsonPath("$.courses[0].title").value("Spring Boot Essentials"))
                .andExpect(jsonPath("$.courses[0].provider").value("Coursera"))
                .andExpect(jsonPath("$.courses[0].isInternal").value(false));
    }

    @Test
    @DisplayName("POST /api/catalog/import/file should import CSV and return 201 Created")
    void importFromFile_success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "courses.csv",
                "text/csv",
                "title,provider\nTest,Udemy".getBytes()
        );

        ExternalCourseResponse response = ExternalCourseResponse.builder()
                .id(2L)
                .title("Test")
                .provider("Udemy")
                .isInternal(false)
                .build();

        when(externalCatalogService.importFromFile(any())).thenReturn(CatalogImportResult.builder()
                .source("courses.csv")
                .fromProvider(false)
                .rowsRead(2)
                .created(1)
                .updated(0)
                .skipped(1)
                .errors(List.of(CatalogImportResult.ImportRowError.builder()
                        .line(3)
                        .reason("No title, so there is nothing to name the course")
                        .build()))
                .courses(List.of(response))
                .build());

        mockMvc.perform(multipart("/api/catalog/import/file").file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rowsRead").value(2))
                .andExpect(jsonPath("$.created").value(1))
                .andExpect(jsonPath("$.skipped").value(1))
                .andExpect(jsonPath("$.errors[0].line").value(3))
                .andExpect(jsonPath("$.courses[0].id").value(2))
                .andExpect(jsonPath("$.courses[0].provider").value("Udemy"));
    }

    @Test
    @DisplayName("GET /api/catalog/external should return list of external courses")
    void getExternalCourses_success() throws Exception {
        ExternalCourseResponse res = ExternalCourseResponse.builder()
                .id(3L)
                .title("Infosys Course")
                .provider("Infosys Springboard")
                .isInternal(false)
                .build();

        when(externalCatalogService.getExternalCourses(null, null)).thenReturn(List.of(res));

        mockMvc.perform(get("/api/catalog/external"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(3))
                .andExpect(jsonPath("$[0].provider").value("Infosys Springboard"));
    }

    @Test
    @DisplayName("GET /api/catalog/external/{id} should return single course detail")
    void getExternalCourseById_success() throws Exception {
        ExternalCourseResponse res = ExternalCourseResponse.builder()
                .id(10L)
                .title("Single External Course")
                .provider("Coursera")
                .isInternal(false)
                .build();

        when(externalCatalogService.getExternalCourseById(10L)).thenReturn(res);

        mockMvc.perform(get("/api/catalog/external/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("Single External Course"));
    }
}
