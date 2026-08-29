package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.recommendation.CourseRecommendationScore;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationScoringService {

    private final UserRepository userRepository;
    private final GapAnalysisRepository gapAnalysisRepository;
    private final RoleCompetencyRepository roleCompetencyRepository;
    private final CourseRepository courseRepository;
    private final UserSkillRepository userSkillRepository;

    @Value("${recommendation.scoring.weight.gap-severity:0.35}")
    private double weightGapSeverity = 0.35;

    @Value("${recommendation.scoring.weight.role-relevance:0.25}")
    private double weightRoleRelevance = 0.25;

    @Value("${recommendation.scoring.weight.proficiency-fit:0.20}")
    private double weightProficiencyFit = 0.20;

    @Value("${recommendation.scoring.weight.course-quality:0.10}")
    private double weightCourseQuality = 0.10;

    @Value("${recommendation.scoring.weight.recency:0.10}")
    private double weightRecency = 0.10;

    /**
     * Calculates weighted scores for candidate courses for a given employee.
     * Enforces Role-Based Filtering to ensure only courses relevant to the employee's
     * role requirements or active knowledge gaps are evaluated.
     */
    @Transactional(readOnly = true)
    public List<CourseRecommendationScore> scoreCoursesForEmployee(Long employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + employeeId));

        // 1. Fetch employee's KnowledgeGaps
        List<GapAnalysis> gaps = gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(employeeId);
        Map<Long, GapAnalysis> gapBySkillId = gaps.stream()
                .collect(Collectors.toMap(g -> g.getSkill().getId(), Function.identity(), (a, b) -> a));

        // 2. Fetch employee's RoleCompetencies
        List<RoleCompetency> roleCompetencies = roleCompetencyRepository
                .findByJobTitleIgnoreCaseAndDepartmentIgnoreCase(employee.getJobTitle(), employee.getDepartment());
        Set<Long> roleSkillIds = roleCompetencies.stream()
                .map(rc -> rc.getSkill().getId())
                .collect(Collectors.toSet());

        // 3. Identify allowed skills (Role-Based Filtering)
        Set<Long> allowedSkillIds = new HashSet<>(roleSkillIds);
        gaps.forEach(g -> allowedSkillIds.add(g.getSkill().getId()));

        if (allowedSkillIds.isEmpty()) {
            log.info("No role competencies or active gaps found for employeeId: {}", employeeId);
            return List.of();
        }

        // Fetch user skills to know current proficiency levels
        Map<Long, UserSkill> userSkillBySkillId = userSkillRepository.findByUserId(employeeId).stream()
                .collect(Collectors.toMap(us -> us.getSkill().getId(), Function.identity(), (a, b) -> a));

        // 4. Fetch candidate courses for allowed skills only
        List<Course> allCourses = courseRepository.findAll();
        List<Course> candidateCourses = allCourses.stream()
                .filter(c -> c.getSkillCovered() != null && allowedSkillIds.contains(c.getSkillCovered().getId()))
                .toList();

        // 5. Compute weighted scores
        List<CourseRecommendationScore> scoredList = new ArrayList<>();
        Instant now = Instant.now();

        for (Course course : candidateCourses) {
            Skill skill = course.getSkillCovered();
            Long skillId = skill.getId();

            GapAnalysis gap = gapBySkillId.get(skillId);
            UserSkill userSkill = userSkillBySkillId.get(skillId);

            double currentLevel = determineCurrentLevel(gap, userSkill);

            // Factor 1: Gap Severity (0-100)
            double gapSeverityScore = 0.0;
            if (gap != null && gap.getGapScore() != null) {
                gapSeverityScore = Math.min(100.0, (gap.getGapScore() / 5.0) * 100.0);
            }

            // Factor 2: Role Relevance (0-100)
            double roleRelevanceScore;
            if (roleSkillIds.contains(skillId)) {
                roleRelevanceScore = 100.0; // Required for exact role
            } else if (gap != null) {
                roleRelevanceScore = 60.0;  // Cross-functional / stretch gap
            } else {
                roleRelevanceScore = 0.0;
            }

            // Factor 3: Proficiency Fit (0-100)
            double proficiencyFitScore = calculateProficiencyFit(course.getDifficulty(), currentLevel);

            // Factor 4: Course Quality (0-100)
            double courseQualityScore = (course.getIsInternal() != null && course.getIsInternal()) ? 100.0 : 80.0;

            // Factor 5: Recency (0-100)
            double recencyScore = calculateRecencyScore(course.getCreatedAt(), now);

            // Total Weighted Score
            double totalScore = (gapSeverityScore * weightGapSeverity)
                    + (roleRelevanceScore * weightRoleRelevance)
                    + (proficiencyFitScore * weightProficiencyFit)
                    + (courseQualityScore * weightCourseQuality)
                    + (recencyScore * weightRecency);

            double roundedScore = Math.round(totalScore * 10.0) / 10.0;

            String breakdown = String.format(
                    "Gap Severity: %.1f (wt %.0f%%), Role Relevance: %.1f (wt %.0f%%), Proficiency Fit: %.1f (wt %.0f%%), Course Quality: %.1f (wt %.0f%%), Recency: %.1f (wt %.0f%%) | Total: %.1f/100",
                    gapSeverityScore, weightGapSeverity * 100,
                    roleRelevanceScore, weightRoleRelevance * 100,
                    proficiencyFitScore, weightProficiencyFit * 100,
                    courseQualityScore, weightCourseQuality * 100,
                    recencyScore, weightRecency * 100,
                    roundedScore
            );

            scoredList.add(CourseRecommendationScore.builder()
                    .course(course)
                    .skill(skill)
                    .score(roundedScore)
                    .scoreBreakdown(breakdown)
                    .build());
        }

        // 6. Return sorted descending by score
        return scoredList.stream()
                .sorted(Comparator.comparingDouble(CourseRecommendationScore::getScore).reversed()
                        .thenComparing(cs -> cs.getCourse().getId()))
                .toList();
    }

    private double determineCurrentLevel(GapAnalysis gap, UserSkill userSkill) {
        if (gap != null && gap.getCurrentScore() != null) {
            return gap.getCurrentScore();
        }
        if (userSkill != null && userSkill.getProficiencyLevel() != null) {
            return userSkill.getProficiencyLevel().getScore();
        }
        return 0.0;
    }

    private double calculateProficiencyFit(String difficulty, double currentLevel) {
        if (difficulty == null || difficulty.isBlank()) {
            return 50.0;
        }

        ProficiencyLevel courseLevel = switch (difficulty.toUpperCase().trim()) {
            case "BEGINNER", "BASIC", "ENTRY" -> ProficiencyLevel.BEGINNER;
            case "INTERMEDIATE", "MEDIUM" -> ProficiencyLevel.INTERMEDIATE;
            case "ADVANCED", "EXPERT", "HARD" -> ProficiencyLevel.ADVANCED;
            default -> null;
        };
        if (courseLevel == null) {
            return 50.0;
        }

        // A course fits best when it sits at or just above where the employee currently is:
        // far above is unteachable, far below is a waste of their time.
        double stretch = courseLevel.getScore() - currentLevel;
        if (stretch >= 0.0 && stretch <= 1.0) return 100.0;
        if (stretch > 1.0 && stretch <= 2.0) return 60.0;
        if (stretch < 0.0 && stretch >= -1.0) return 60.0;
        return 20.0;
    }

    private double calculateRecencyScore(Instant createdAt, Instant now) {
        if (createdAt == null) {
            return 30.0;
        }
        long days = Duration.between(createdAt, now).toDays();
        if (days <= 30) return 100.0;
        if (days <= 90) return 85.0;
        if (days <= 180) return 70.0;
        if (days <= 365) return 50.0;
        return 30.0;
    }
}
