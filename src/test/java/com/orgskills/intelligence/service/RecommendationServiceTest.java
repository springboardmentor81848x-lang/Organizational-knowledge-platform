package com.orgskills.intelligence.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.recommendation.RecommendationResponse;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.TrainingRecommendation;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.TrainingRecommendationRepository;
import com.orgskills.intelligence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GapAnalysisRepository gapAnalysisRepository;

    @Mock
    private TrainingRecommendationRepository recommendationRepository;

    @Mock
    private RecommendationScoringService recommendationScoringService;

    @Mock
    private NotificationService notificationService;

    private RecommendationService recommendationService;

    private User sampleEmployee;
    private Skill javaSkill;
    private Skill dockerSkill;
    private Skill kubernetesSkill;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        recommendationService = new RecommendationService(
                userRepository,
                gapAnalysisRepository,
                recommendationRepository,
                recommendationScoringService,
                notificationService,
                objectMapper
        );

        // Default to mock mode enabled
        ReflectionTestUtils.setField(recommendationService, "mockEnabled", true);
        ReflectionTestUtils.setField(recommendationService, "openAiApiKey", "");
        ReflectionTestUtils.setField(recommendationService, "openAiModel", "gpt-4o-mini");
        ReflectionTestUtils.setField(recommendationService, "openAiBaseUrl", "https://api.openai.com/v1/chat/completions");

        sampleEmployee = new User();
        sampleEmployee.setId(1L);
        sampleEmployee.setFullName("Jane Doe");
        sampleEmployee.setEmail("jane@example.com");
        sampleEmployee.setJobTitle("Software Engineer");
        sampleEmployee.setDepartment("Engineering");
        sampleEmployee.setRole(Role.EMPLOYEE);

        javaSkill = new Skill();
        javaSkill.setId(10L);
        javaSkill.setName("Java");
        javaSkill.setCategory("Backend");

        dockerSkill = new Skill();
        dockerSkill.setId(20L);
        dockerSkill.setName("Docker");
        dockerSkill.setCategory("DevOps");

        kubernetesSkill = new Skill();
        kubernetesSkill.setId(30L);
        kubernetesSkill.setName("Kubernetes");
        kubernetesSkill.setCategory("DevOps");
    }

    // ── Mock mode tests ─────────────────────────────────────────────────────

    @Test
    @DisplayName("Mock mode: generates one recommendation per gap with correct structure")
    void testMockModeGeneratesRecommendationsPerGap() {
        GapAnalysis gap1 = buildGap(1L, sampleEmployee, javaSkill, 5.0, 2.0, 3.0, RiskSeverity.CRITICAL);
        GapAnalysis gap2 = buildGap(2L, sampleEmployee, dockerSkill, 3.0, 1.0, 2.0, RiskSeverity.HIGH);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(gap1, gap2));
        doNothing().when(recommendationRepository).deleteByEmployeeId(1L);
        when(recommendationRepository.save(any(TrainingRecommendation.class)))
                .thenAnswer(invocation -> {
                    TrainingRecommendation rec = invocation.getArgument(0);
                    rec.setId((long) (Math.random() * 1000));
                    return rec;
                });

        List<RecommendationResponse> results = recommendationService.generateRecommendations(1L);

        assertThat(results).hasSize(2);

        // Verify first recommendation (Java — highest gap)
        RecommendationResponse javaRec = results.stream()
                .filter(r -> r.getSkillName().equals("Java"))
                .findFirst().orElseThrow();
        assertThat(javaRec.getEmployeeId()).isEqualTo(1L);
        assertThat(javaRec.getSkillId()).isEqualTo(10L);
        assertThat(javaRec.getRecommendationText()).isNotBlank();
        assertThat(javaRec.getRecommendationText()).contains("Java");
        assertThat(javaRec.getSuggestedResourceType()).isIn("Course", "Article", "Practice Project");
        assertThat(javaRec.getPriorityRank()).isEqualTo(1);
        assertThat(javaRec.getSourceGapSeverity()).isEqualTo("CRITICAL");

        // Verify second recommendation (Docker)
        RecommendationResponse dockerRec = results.stream()
                .filter(r -> r.getSkillName().equals("Docker"))
                .findFirst().orElseThrow();
        assertThat(dockerRec.getPriorityRank()).isEqualTo(2);
        assertThat(dockerRec.getSourceGapSeverity()).isEqualTo("HIGH");
    }

    @Test
    @DisplayName("Mock mode: recommendationText references the employee's actual job role")
    void testMockRecommendationReferencesJobRole() {
        GapAnalysis gap = buildGap(1L, sampleEmployee, javaSkill, 5.0, 2.0, 3.0, RiskSeverity.CRITICAL);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(gap));
        doNothing().when(recommendationRepository).deleteByEmployeeId(1L);
        when(recommendationRepository.save(any(TrainingRecommendation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<RecommendationResponse> results = recommendationService.generateRecommendations(1L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getRecommendationText()).contains("Software Engineer");
    }

    @Test
    @DisplayName("Mock mode: suggestedResourceType is 'Course' for large gaps (≥ 3.0)")
    void testMockResourceTypeCourseForLargeGap() {
        GapAnalysis gap = buildGap(1L, sampleEmployee, javaSkill, 5.0, 1.0, 4.0, RiskSeverity.CRITICAL);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(gap));
        doNothing().when(recommendationRepository).deleteByEmployeeId(1L);
        when(recommendationRepository.save(any(TrainingRecommendation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<RecommendationResponse> results = recommendationService.generateRecommendations(1L);

        assertThat(results.get(0).getSuggestedResourceType()).isEqualTo("Course");
    }

    @Test
    @DisplayName("Mock mode: suggestedResourceType is 'Practice Project' for small gaps (< 1.5)")
    void testMockResourceTypePracticeProjectForSmallGap() {
        GapAnalysis gap = buildGap(1L, sampleEmployee, javaSkill, 3.0, 2.0, 1.0, RiskSeverity.MEDIUM);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(gap));
        doNothing().when(recommendationRepository).deleteByEmployeeId(1L);
        when(recommendationRepository.save(any(TrainingRecommendation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<RecommendationResponse> results = recommendationService.generateRecommendations(1L);

        assertThat(results.get(0).getSuggestedResourceType()).isEqualTo("Practice Project");
    }

    // ── Fallback mode tests ─────────────────────────────────────────────────

    @Test
    @DisplayName("Fallback: when LLM is disabled (no API key, mock off), returns rule-based recommendations")
    void testFallbackWhenNoApiKeyAndMockDisabled() {
        ReflectionTestUtils.setField(recommendationService, "mockEnabled", false);
        ReflectionTestUtils.setField(recommendationService, "openAiApiKey", "");

        GapAnalysis gap = buildGap(1L, sampleEmployee, javaSkill, 5.0, 2.0, 3.0, RiskSeverity.CRITICAL);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(gap));
        doNothing().when(recommendationRepository).deleteByEmployeeId(1L);
        when(recommendationRepository.save(any(TrainingRecommendation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<RecommendationResponse> results = recommendationService.generateRecommendations(1L);

        assertThat(results).hasSize(1);
        RecommendationResponse rec = results.get(0);
        assertThat(rec.getRecommendationText()).contains("Focus on Java");
        assertThat(rec.getRecommendationText()).contains("3.0 levels below");
        assertThat(rec.getRecommendationText()).contains("Software Engineer");
        assertThat(rec.getSourceGapSeverity()).isEqualTo("CRITICAL");
    }

    // ── Delete-before-save tests ────────────────────────────────────────────

    @Test
    @DisplayName("Old recommendations are deleted before saving new ones")
    void testDeleteBeforeSave() {
        GapAnalysis gap = buildGap(1L, sampleEmployee, javaSkill, 5.0, 2.0, 3.0, RiskSeverity.CRITICAL);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(gap));
        doNothing().when(recommendationRepository).deleteByEmployeeId(1L);
        when(recommendationRepository.save(any(TrainingRecommendation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        recommendationService.generateRecommendations(1L);

        verify(recommendationRepository).deleteByEmployeeId(1L);
    }

    @Test
    @DisplayName("Entity fields are populated correctly before save")
    void testEntityFieldsPopulatedCorrectly() {
        GapAnalysis gap = buildGap(1L, sampleEmployee, dockerSkill, 4.0, 2.0, 2.0, RiskSeverity.HIGH);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(gap));
        doNothing().when(recommendationRepository).deleteByEmployeeId(1L);

        ArgumentCaptor<TrainingRecommendation> captor = ArgumentCaptor.forClass(TrainingRecommendation.class);
        when(recommendationRepository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        recommendationService.generateRecommendations(1L);

        TrainingRecommendation saved = captor.getValue();
        assertThat(saved.getEmployee()).isEqualTo(sampleEmployee);
        assertThat(saved.getSkill()).isEqualTo(dockerSkill);
        assertThat(saved.getRecommendationText()).isNotBlank();
        assertThat(saved.getSuggestedResourceType()).isIn("Course", "Article", "Practice Project");
        assertThat(saved.getPriorityRank()).isEqualTo(1);
        assertThat(saved.getSourceGapSeverity()).isEqualTo("HIGH");
    }

    // ── Edge case tests ─────────────────────────────────────────────────────

    @Test
    @DisplayName("Empty gaps: returns empty list without deleting or saving")
    void testEmptyGapsReturnsEmptyList() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(Collections.emptyList());

        List<RecommendationResponse> results = recommendationService.generateRecommendations(1L);

        assertThat(results).isEmpty();
        verify(recommendationRepository, never()).deleteByEmployeeId(any());
        verify(recommendationRepository, never()).save(any());
    }

    @Test
    @DisplayName("User not found: throws ResourceNotFoundException on generate")
    void testUserNotFoundOnGenerate() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recommendationService.generateRecommendations(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("User not found: throws ResourceNotFoundException on get")
    void testUserNotFoundOnGet() {
        when(userRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> recommendationService.getByEmployee(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("getByEmployee returns stored recommendations ordered by priority")
    void testGetByEmployeeReturnsStoredRecommendations() {
        TrainingRecommendation rec1 = new TrainingRecommendation();
        rec1.setId(100L);
        rec1.setEmployee(sampleEmployee);
        rec1.setSkill(javaSkill);
        rec1.setRecommendationText("Improve Java skills");
        rec1.setSuggestedResourceType("Course");
        rec1.setPriorityRank(1);
        rec1.setSourceGapSeverity("CRITICAL");

        TrainingRecommendation rec2 = new TrainingRecommendation();
        rec2.setId(101L);
        rec2.setEmployee(sampleEmployee);
        rec2.setSkill(dockerSkill);
        rec2.setRecommendationText("Learn Docker fundamentals");
        rec2.setSuggestedResourceType("Article");
        rec2.setPriorityRank(2);
        rec2.setSourceGapSeverity("HIGH");

        when(userRepository.existsById(1L)).thenReturn(true);
        when(recommendationRepository.findByEmployeeIdOrderByPriorityRankAsc(1L))
                .thenReturn(List.of(rec1, rec2));

        List<RecommendationResponse> results = recommendationService.getByEmployee(1L);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getSkillName()).isEqualTo("Java");
        assertThat(results.get(0).getPriorityRank()).isEqualTo(1);
        assertThat(results.get(1).getSkillName()).isEqualTo("Docker");
        assertThat(results.get(1).getPriorityRank()).isEqualTo(2);
    }

    @Test
    @DisplayName("Multiple gaps: generates recommendations ordered by gap severity (highest first)")
    void testMultipleGapsOrderedBySeverity() {
        GapAnalysis gap1 = buildGap(1L, sampleEmployee, kubernetesSkill, 3.0, 2.0, 1.0, RiskSeverity.MEDIUM);
        GapAnalysis gap2 = buildGap(2L, sampleEmployee, javaSkill, 5.0, 1.0, 4.0, RiskSeverity.CRITICAL);
        GapAnalysis gap3 = buildGap(3L, sampleEmployee, dockerSkill, 4.0, 2.0, 2.0, RiskSeverity.HIGH);

        // Returned already sorted by gapScore desc from repository
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleEmployee));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L))
                .thenReturn(List.of(gap2, gap3, gap1));
        doNothing().when(recommendationRepository).deleteByEmployeeId(1L);
        when(recommendationRepository.save(any(TrainingRecommendation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<RecommendationResponse> results = recommendationService.generateRecommendations(1L);

        assertThat(results).hasSize(3);
        // Priority 1 should be Java (highest gap score of 4.0)
        assertThat(results.get(0).getSkillName()).isEqualTo("Java");
        assertThat(results.get(0).getPriorityRank()).isEqualTo(1);
        // Priority 2 should be Docker (gap score of 2.0)
        assertThat(results.get(1).getSkillName()).isEqualTo("Docker");
        assertThat(results.get(1).getPriorityRank()).isEqualTo(2);
        // Priority 3 should be Kubernetes (gap score of 1.0)
        assertThat(results.get(2).getSkillName()).isEqualTo("Kubernetes");
        assertThat(results.get(2).getPriorityRank()).isEqualTo(3);
    }

    // ── Helper ──────────────────────────────────────────────────────────────

    private GapAnalysis buildGap(Long id, User user, Skill skill,
                                  double target, double current, double gapScore,
                                  RiskSeverity severity) {
        GapAnalysis gap = new GapAnalysis();
        gap.setId(id);
        gap.setUser(user);
        gap.setSkill(skill);
        gap.setTargetScore(target);
        gap.setCurrentScore(current);
        gap.setGapScore(gapScore);
        gap.setRiskSeverity(severity);
        return gap;
    }
}
