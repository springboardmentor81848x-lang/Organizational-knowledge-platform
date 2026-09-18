package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.recommendation.CourseRecommendationScore;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationScoringServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GapAnalysisRepository gapAnalysisRepository;

    @Mock
    private RoleCompetencyRepository roleCompetencyRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserSkillRepository userSkillRepository;

    @InjectMocks
    private RecommendationScoringService scoringService;

    private User devEmployee;
    private User devOpsEmployee;

    private Skill javaSkill;
    private Skill k8sSkill;
    private Skill accountingSkill;

    private Course javaBeginnerCourse;
    private Course javaAdvancedCourse;
    private Course k8sCourse;
    private Course accountingCourse;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(scoringService, "weightGapSeverity", 0.35);
        ReflectionTestUtils.setField(scoringService, "weightRoleRelevance", 0.25);
        ReflectionTestUtils.setField(scoringService, "weightProficiencyFit", 0.20);
        ReflectionTestUtils.setField(scoringService, "weightCourseQuality", 0.10);
        ReflectionTestUtils.setField(scoringService, "weightRecency", 0.10);

        devEmployee = new User();
        devEmployee.setId(1L);
        devEmployee.setFullName("Alice Dev");
        devEmployee.setJobTitle("Backend Engineer");
        devEmployee.setDepartment("Engineering");
        devEmployee.setRole(Role.EMPLOYEE);

        devOpsEmployee = new User();
        devOpsEmployee.setId(2L);
        devOpsEmployee.setFullName("Bob Ops");
        devOpsEmployee.setJobTitle("DevOps Engineer");
        devOpsEmployee.setDepartment("Infrastructure");
        devOpsEmployee.setRole(Role.EMPLOYEE);

        javaSkill = new Skill(10L, "Java", "Backend", "Java programming", null, null, null, null);
        k8sSkill = new Skill(20L, "Kubernetes", "DevOps", "K8s orchestration", null, null, null, null);
        accountingSkill = new Skill(30L, "Accounting", "Finance", "Corporate accounting", null, null, null, null);

        Instant fresh = Instant.now().minus(5, ChronoUnit.DAYS);

        javaBeginnerCourse = new Course(101L, "Java 101", "Intro to Java", "Internal L&D", javaSkill, "BEGINNER", 10.0, true, null, fresh);
        javaAdvancedCourse = new Course(102L, "Advanced Java", "Deep dive Java", "Internal L&D", javaSkill, "ADVANCED", 20.0, true, null, fresh);
        k8sCourse = new Course(201L, "Kubernetes Mastery", "K8s admin", "Udemy", k8sSkill, "ADVANCED", 15.0, false, "http://k8s.com", fresh);
        accountingCourse = new Course(301L, "Financial Accounting", "Balance sheets", "Coursera", accountingSkill, "BEGINNER", 8.0, false, "http://acc.com", fresh);
    }

    @Test
    @DisplayName("Returns courses sorted by descending score with detailed scoreBreakdown")
    void testScoreCoursesReturnsSortedWithBreakdown() {
        RoleCompetency rcJava = new RoleCompetency(1L, "Backend Engineer", "Engineering", javaSkill, ProficiencyLevel.ADVANCED);
        GapAnalysis gapJava = new GapAnalysis(1L, devEmployee, javaSkill, 4.0, 1.0, 3.0, RiskSeverity.CRITICAL, false, Instant.now());

        when(userRepository.findById(1L)).thenReturn(Optional.of(devEmployee));
        when(roleCompetencyRepository.findByJobTitleIgnoreCaseAndDepartmentIgnoreCase("Backend Engineer", "Engineering"))
                .thenReturn(List.of(rcJava));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(gapJava));
        when(userSkillRepository.findByUserId(1L)).thenReturn(List.of());
        when(courseRepository.findAll()).thenReturn(List.of(javaBeginnerCourse, javaAdvancedCourse));

        List<CourseRecommendationScore> result = scoringService.scoreCoursesForEmployee(1L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getScore()).isGreaterThanOrEqualTo(result.get(1).getScore());

        // For beginner at level 1.0, Java 101 (BEGINNER) gets higher proficiency fit than Advanced Java
        assertThat(result.get(0).getCourse().getId()).isEqualTo(101L);
        assertThat(result.get(0).getScoreBreakdown()).contains("Gap Severity");
        assertThat(result.get(0).getScoreBreakdown()).contains("Role Relevance");
        assertThat(result.get(0).getScoreBreakdown()).contains("Proficiency Fit");
        assertThat(result.get(0).getScoreBreakdown()).contains("Course Quality");
        assertThat(result.get(0).getScoreBreakdown()).contains("Recency");
    }

    @Test
    @DisplayName("Role-Based Filtering: completely excludes courses unrelated to employee's role requirements/gaps")
    void testRoleBasedFilteringExcludesUnrelatedCourses() {
        RoleCompetency rcJava = new RoleCompetency(1L, "Backend Engineer", "Engineering", javaSkill, ProficiencyLevel.ADVANCED);
        GapAnalysis gapJava = new GapAnalysis(1L, devEmployee, javaSkill, 4.0, 1.0, 3.0, RiskSeverity.CRITICAL, false, Instant.now());

        when(userRepository.findById(1L)).thenReturn(Optional.of(devEmployee));
        when(roleCompetencyRepository.findByJobTitleIgnoreCaseAndDepartmentIgnoreCase("Backend Engineer", "Engineering"))
                .thenReturn(List.of(rcJava));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(gapJava));
        when(userSkillRepository.findByUserId(1L)).thenReturn(List.of());
        when(courseRepository.findAll()).thenReturn(List.of(javaBeginnerCourse, accountingCourse, k8sCourse));

        List<CourseRecommendationScore> result = scoringService.scoreCoursesForEmployee(1L);

        // Only Java course should be present; Accounting and K8s courses must be completely excluded
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCourse().getTitle()).isEqualTo("Java 101");
    }

    @Test
    @DisplayName("Different roles receive differently ranked/filtered recommendations for same skills")
    void testDifferentRolesReceiveDifferentRankings() {
        RoleCompetency rcDev = new RoleCompetency(1L, "Backend Engineer", "Engineering", javaSkill, ProficiencyLevel.ADVANCED);
        RoleCompetency rcOps = new RoleCompetency(2L, "DevOps Engineer", "Infrastructure", k8sSkill, ProficiencyLevel.ADVANCED);

        GapAnalysis gapJava = new GapAnalysis(1L, devEmployee, javaSkill, 4.0, 1.0, 3.0, RiskSeverity.CRITICAL, false, Instant.now());
        GapAnalysis gapOpsK8s = new GapAnalysis(2L, devOpsEmployee, k8sSkill, 4.0, 1.0, 3.0, RiskSeverity.CRITICAL, false, Instant.now());

        when(userRepository.findById(1L)).thenReturn(Optional.of(devEmployee));
        when(roleCompetencyRepository.findByJobTitleIgnoreCaseAndDepartmentIgnoreCase("Backend Engineer", "Engineering"))
                .thenReturn(List.of(rcDev));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(gapJava));
        when(userSkillRepository.findByUserId(1L)).thenReturn(List.of());

        when(userRepository.findById(2L)).thenReturn(Optional.of(devOpsEmployee));
        when(roleCompetencyRepository.findByJobTitleIgnoreCaseAndDepartmentIgnoreCase("DevOps Engineer", "Infrastructure"))
                .thenReturn(List.of(rcOps));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(2L)).thenReturn(List.of(gapOpsK8s));
        when(userSkillRepository.findByUserId(2L)).thenReturn(List.of());

        when(courseRepository.findAll()).thenReturn(List.of(javaBeginnerCourse, k8sCourse));

        List<CourseRecommendationScore> devRankings = scoringService.scoreCoursesForEmployee(1L);
        List<CourseRecommendationScore> opsRankings = scoringService.scoreCoursesForEmployee(2L);

        // Dev receives only Java 101
        assertThat(devRankings).hasSize(1);
        assertThat(devRankings.get(0).getCourse().getTitle()).isEqualTo("Java 101");

        // Ops receives only Kubernetes Mastery
        assertThat(opsRankings).hasSize(1);
        assertThat(opsRankings.get(0).getCourse().getTitle()).isEqualTo("Kubernetes Mastery");
    }

    @Test
    @DisplayName("Adaptive Re-ranking: employee recommendations change ranking after proficiency level increases")
    void testAdaptiveRerankingAfterProficiencyLevelChange() {
        RoleCompetency rcJava = new RoleCompetency(1L, "Backend Engineer", "Engineering", javaSkill, ProficiencyLevel.ADVANCED);
        GapAnalysis initialGap = new GapAnalysis(1L, devEmployee, javaSkill, 4.0, 1.0, 3.0, RiskSeverity.CRITICAL, false, Instant.now());
        UserSkill lowUserSkill = new UserSkill(1L, devEmployee, javaSkill, ProficiencyLevel.BEGINNER, 1.0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(devEmployee));
        when(roleCompetencyRepository.findByJobTitleIgnoreCaseAndDepartmentIgnoreCase("Backend Engineer", "Engineering"))
                .thenReturn(List.of(rcJava));
        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(initialGap));
        when(userSkillRepository.findByUserId(1L)).thenReturn(List.of(lowUserSkill));
        when(courseRepository.findAll()).thenReturn(List.of(javaBeginnerCourse, javaAdvancedCourse));

        // Initial scoring (level 1.0) -> Java 101 (BEGINNER) ranked top
        List<CourseRecommendationScore> initialRankings = scoringService.scoreCoursesForEmployee(1L);
        assertThat(initialRankings.get(0).getCourse().getTitle()).isEqualTo("Java 101");

        // Employee levels up to level 4.0 -> Gap drops to 0.0 or 1.0
        GapAnalysis updatedGap = new GapAnalysis(1L, devEmployee, javaSkill, 4.0, 4.0, 0.0, RiskSeverity.LOW, false, Instant.now());
        UserSkill highUserSkill = new UserSkill(1L, devEmployee, javaSkill, ProficiencyLevel.ADVANCED, 4.0);

        when(gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(1L)).thenReturn(List.of(updatedGap));
        when(userSkillRepository.findByUserId(1L)).thenReturn(List.of(highUserSkill));

        // Re-run scoring (level 4.0) -> Advanced Java is now preferred over Beginner Java
        List<CourseRecommendationScore> updatedRankings = scoringService.scoreCoursesForEmployee(1L);
        assertThat(updatedRankings.get(0).getCourse().getTitle()).isEqualTo("Advanced Java");
    }
}
