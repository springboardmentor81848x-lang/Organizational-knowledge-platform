package com.orgskills.intelligence.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.ld.CatalogImportResult;
import com.orgskills.intelligence.dto.ld.ExternalCourseDTO;
import com.orgskills.intelligence.dto.ld.ExternalCourseResponse;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.provider.CourseraProvider;
import com.orgskills.intelligence.provider.ExternalCourseProvider;
import com.orgskills.intelligence.provider.ManualCatalogProvider;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.util.DifficultyNormalizer;
import com.orgskills.intelligence.util.DurationNormalizer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExternalCatalogServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private CourseraProvider courseraProvider;

    private ManualCatalogProvider manualCatalogProvider;
    private DurationNormalizer durationNormalizer;
    private DifficultyNormalizer difficultyNormalizer;
    private ObjectMapper objectMapper;
    private ExternalCatalogService externalCatalogService;

    private Skill springBootSkill;

    @BeforeEach
    void setUp() {
        durationNormalizer = new DurationNormalizer();
        difficultyNormalizer = new DifficultyNormalizer();
        objectMapper = new ObjectMapper();
        manualCatalogProvider = new ManualCatalogProvider();

        springBootSkill = new Skill();
        springBootSkill.setId(100L);
        springBootSkill.setName("Spring Boot");
        springBootSkill.setCategory("Technical");

        when(courseraProvider.getProviderName()).thenReturn("Coursera");

        List<ExternalCourseProvider> providers = List.of(courseraProvider, manualCatalogProvider);

        externalCatalogService = new ExternalCatalogService(
                courseRepository,
                skillRepository,
                durationNormalizer,
                difficultyNormalizer,
                objectMapper,
                providers,
                manualCatalogProvider
        );
    }

    @Test
    @DisplayName("importFromProvider should fetch courses, normalize, deduplicate and save")
    void importFromProvider_success() {
        ExternalCourseDTO dto = ExternalCourseDTO.builder()
                .title("Spring Boot Microservices")
                .description("Build microservices with Spring Boot")
                .provider("Coursera")
                .durationLabel("8 Hours")
                .url("https://www.coursera.org/learn/springboot")
                .difficulty("Intermediate")
                .skill("Spring Boot")
                .build();

        when(courseraProvider.fetchCourses("Spring Boot")).thenReturn(List.of(dto));
        when(skillRepository.findByNameIgnoreCase("Spring Boot")).thenReturn(Optional.of(springBootSkill));

        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> {
            Course c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });

        CatalogImportResult result = externalCatalogService.importFromProvider("Coursera", "Spring Boot");

        assertThat(result.getRowsRead()).isEqualTo(1);
        assertThat(result.getCreated()).isEqualTo(1);
        assertThat(result.getSkipped()).isZero();
        assertThat(result.getProviderError()).isNull();
        assertThat(result.getCourses()).hasSize(1);
        ExternalCourseResponse res = result.getCourses().get(0);
        assertThat(res.getTitle()).isEqualTo("Spring Boot Microservices");
        assertThat(res.getProvider()).isEqualTo("Coursera");
        assertThat(res.getDifficulty()).isEqualTo("INTERMEDIATE");
        assertThat(res.getDurationHours()).isEqualTo(8.0);
        assertThat(res.getDurationLabel()).isEqualTo("8 Hours");
        assertThat(res.getIsInternal()).isFalse();
        assertThat(res.isDescriptionMissing()).isFalse();
        assertThat(res.isDurationMissing()).isFalse();
        assertThat(res.isUrlMissing()).isFalse();
    }

    @Test
    @DisplayName("importFromProvider should throw exception if provider unknown")
    void importFromProvider_unknownProvider() {
        assertThatThrownBy(() -> externalCatalogService.importFromProvider("UnknownProvider", "Java"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("External course provider not found");
    }

    @Test
    @DisplayName("importFromFile CSV should parse correctly and deduplicate existing rows")
    void importFromFile_csv() {
        String csvContent = """
                title,description,provider,skill,difficulty,durationLabel,url
                "Advanced Spring Boot","Deep dive into enterprise patterns","Infosys Springboard","Spring Boot","Advanced","8 Hours","https://infyspringboard.onwingspan.com/course1"
                """;

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "courses.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        when(skillRepository.findByNameIgnoreCase("Spring Boot")).thenReturn(Optional.of(springBootSkill));
        when(courseRepository.save(any(Course.class))).thenAnswer(inv -> {
            Course c = inv.getArgument(0);
            c.setId(2L);
            return c;
        });

        CatalogImportResult result = externalCatalogService.importFromFile(file);

        assertThat(result.getRowsRead()).isEqualTo(1);
        assertThat(result.getCreated()).isEqualTo(1);
        assertThat(result.getSkipped()).isZero();
        assertThat(result.getCourses()).hasSize(1);
        ExternalCourseResponse res = result.getCourses().get(0);
        assertThat(res.getTitle()).isEqualTo("Advanced Spring Boot");
        assertThat(res.getProvider()).isEqualTo("Infosys Springboard");
        assertThat(res.getDifficulty()).isEqualTo("ADVANCED");
        assertThat(res.getDurationHours()).isEqualTo(8.0);
        assertThat(res.getExternalUrl()).isEqualTo("https://infyspringboard.onwingspan.com/course1");
    }

    @Test
    @DisplayName("importFromFile JSON should parse array of courses")
    void importFromFile_json() {
        String jsonContent = """
                [
                  {
                    "title": "React Deep Dive",
                    "description": "Learn React in 4 weeks",
                    "provider": "Udemy",
                    "durationLabel": "4 Weeks",
                    "url": "https://udemy.com/react",
                    "difficulty": "Expert",
                    "skill": "React"
                  }
                ]
                """;

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "courses.json",
                "application/json",
                jsonContent.getBytes(StandardCharsets.UTF_8)
        );

        Skill reactSkill = new Skill();
        reactSkill.setId(200L);
        reactSkill.setName("React");
        reactSkill.setCategory("Frontend");
        when(skillRepository.findByNameIgnoreCase("React")).thenReturn(Optional.of(reactSkill));

        when(courseRepository.save(any(Course.class))).thenAnswer(inv -> {
            Course c = inv.getArgument(0);
            c.setId(3L);
            return c;
        });

        CatalogImportResult result = externalCatalogService.importFromFile(file);

        assertThat(result.getRowsRead()).isEqualTo(1);
        assertThat(result.getCreated()).isEqualTo(1);
        assertThat(result.getSkipped()).isZero();
        assertThat(result.getCourses()).hasSize(1);
        ExternalCourseResponse res = result.getCourses().get(0);
        assertThat(res.getTitle()).isEqualTo("React Deep Dive");
        assertThat(res.getProvider()).isEqualTo("Udemy");
        assertThat(res.getDifficulty()).isEqualTo("ADVANCED");
        assertThat(res.getDurationHours()).isEqualTo(40.0); // 4 weeks * 10 hrs/wk default
    }

    @Test
    @DisplayName("getExternalCourses should filter courses by skill and provider")
    void getExternalCourses_filter() {
        Course c1 = new Course(1L, "Course 1", "Desc", "Coursera", springBootSkill, "INTERMEDIATE", 10.0, "10 Hours", false, "https://url1", null);
        Course c2 = new Course(2L, "Course 2", "Desc", "Udemy", springBootSkill, "BEGINNER", 5.0, "5 Hours", false, "https://url2", null);

        when(courseRepository.findByIsInternalFalse()).thenReturn(List.of(c1, c2));

        List<ExternalCourseResponse> courseraOnly = externalCatalogService.getExternalCourses(null, "Coursera");
        assertThat(courseraOnly).hasSize(1);
        assertThat(courseraOnly.get(0).getProvider()).isEqualTo("Coursera");

        List<ExternalCourseResponse> springBootOnly = externalCatalogService.getExternalCourses("Spring", null);
        assertThat(springBootOnly).hasSize(2);
    }
}
