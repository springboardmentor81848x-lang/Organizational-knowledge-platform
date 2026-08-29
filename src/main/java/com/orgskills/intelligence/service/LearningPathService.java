package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.recommendation.CourseRecommendationScore;
import com.orgskills.intelligence.dto.ld.CourseResponse;
import com.orgskills.intelligence.dto.ld.LearningPathResponse;
import com.orgskills.intelligence.dto.ld.LearningPathStepResponse;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.LearningPath;
import com.orgskills.intelligence.entity.LearningPathStep;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.LearningPathRepository;
import com.orgskills.intelligence.repository.LearningPathStepRepository;
import com.orgskills.intelligence.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class LearningPathService {

    private final UserRepository userRepository;
    private final GapAnalysisRepository gapAnalysisRepository;
    private final CourseRepository courseRepository;
    private final LearningPathRepository learningPathRepository;
    private final LearningPathStepRepository learningPathStepRepository;
    private final GapAnalysisService gapAnalysisService;
    private final RecommendationScoringService recommendationScoringService;

    public LearningPathService(
            UserRepository userRepository,
            GapAnalysisRepository gapAnalysisRepository,
            CourseRepository courseRepository,
            LearningPathRepository learningPathRepository,
            LearningPathStepRepository learningPathStepRepository,
            @Lazy GapAnalysisService gapAnalysisService,
            RecommendationScoringService recommendationScoringService
    ) {
        this.userRepository = userRepository;
        this.gapAnalysisRepository = gapAnalysisRepository;
        this.courseRepository = courseRepository;
        this.learningPathRepository = learningPathRepository;
        this.learningPathStepRepository = learningPathStepRepository;
        this.gapAnalysisService = gapAnalysisService;
        this.recommendationScoringService = recommendationScoringService;
    }

    @Value("${app.learning-path.weekly-hours-pace:4}")
    private int weeklyHoursPace = 4;

    @Transactional
    public List<LearningPathResponse> generateLearningPathsForEmployee(Long employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + employeeId));

        List<GapAnalysis> gaps = gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(employeeId);
        if (gaps.isEmpty()) {
            gapAnalysisService.calculateAndFetchUserGaps(employeeId);
            gaps = gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(employeeId);
        }

        List<GapAnalysis> activeGaps = gaps.stream()
                .filter(g -> g.getGapScore() > 0.0)
                .sorted(Comparator.comparing(GapAnalysis::getGapScore).reversed())
                .toList();

        if (activeGaps.isEmpty()) {
            log.info("No active skill gaps found for employeeId: {}", employeeId);
            return learningPathRepository.findByEmployeeIdOrderByGeneratedAtDesc(employeeId).stream()
                    .map(this::toResponse)
                    .toList();
        }

        List<CourseRecommendationScore> rankedScores = recommendationScoringService.scoreCoursesForEmployee(employeeId);
        Map<Long, Double> courseScoreMap = rankedScores.stream()
                .collect(Collectors.toMap(cs -> cs.getCourse().getId(), CourseRecommendationScore::getScore, (a, b) -> a));

        List<LearningPath> generatedPaths = new ArrayList<>();
        for (GapAnalysis gap : activeGaps) {
            Skill skill = gap.getSkill();
            LearningPath path = generatePathForGap(employee, gap, skill, courseScoreMap);
            generatedPaths.add(learningPathRepository.save(path));
        }

        return generatedPaths.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<LearningPathResponse> getLearningPathsForEmployee(Long employeeId) {
        if (!userRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("User not found for id: " + employeeId);
        }
        return learningPathRepository.findByEmployeeIdOrderByGeneratedAtDesc(employeeId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LearningPathResponse getLearningPathDetail(Long employeeId, Long pathId) {
        LearningPath path = learningPathRepository.findByIdAndEmployeeId(pathId, employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning path not found for pathId: " + pathId + " and employeeId: " + employeeId));
        return toResponse(path);
    }

    @Transactional
    public LearningPathResponse completeStepManually(Long stepId) {
        LearningPathStep step = learningPathStepRepository.findById(stepId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning path step not found for id: " + stepId));

        if (!"COMPLETED".equalsIgnoreCase(step.getStatus())) {
            step.setStatus("COMPLETED");
            step.setCompletedAt(LocalDateTime.now());
            learningPathStepRepository.save(step);
            updatePathProgress(step.getLearningPath());
        }

        return toResponse(step.getLearningPath());
    }

    @Transactional
    public void onEnrollmentCompleted(Long employeeId, Long courseId) {
        List<LearningPathStep> stepsToComplete = learningPathStepRepository
                .findByLearningPathEmployeeIdAndCourseIdAndStatusNot(employeeId, courseId, "COMPLETED");

        for (LearningPathStep step : stepsToComplete) {
            step.setStatus("COMPLETED");
            step.setCompletedAt(LocalDateTime.now());
            learningPathStepRepository.save(step);
            updatePathProgress(step.getLearningPath());
        }
    }

    @Transactional
    public void onGapsUpdated(Long employeeId, List<GapAnalysis> newGaps) {
        if (newGaps == null || newGaps.isEmpty()) {
            return;
        }

        Set<Long> skillsWithGaps = newGaps.stream()
                .filter(g -> g.getGapScore() > 0.0)
                .map(g -> g.getSkill().getId())
                .collect(Collectors.toSet());

        List<LearningPath> existingPaths = learningPathRepository.findByEmployeeId(employeeId);
        for (LearningPath path : existingPaths) {
            if (path.getTargetSkill() != null && !skillsWithGaps.contains(path.getTargetSkill().getId())
                    && !"COMPLETED".equalsIgnoreCase(path.getStatus())) {
                path.setStatus("OBSOLETE");
                learningPathRepository.save(path);
            }
        }
    }

    // ── Generation Helper ───────────────────────────────────────────────────────

    private LearningPath generatePathForGap(User employee, GapAnalysis gap, Skill targetSkill, Map<Long, Double> courseScoreMap) {
        Optional<LearningPath> existingOpt = learningPathRepository.findByEmployeeIdAndTargetSkillId(employee.getId(), targetSkill.getId());
        LearningPath path;

        if (existingOpt.isPresent() && !"COMPLETED".equalsIgnoreCase(existingOpt.get().getStatus())) {
            path = existingOpt.get();
            path.getSteps().clear();
        } else {
            path = new LearningPath();
            path.setEmployee(employee);
            path.setTargetSkill(targetSkill);
        }

        path.setTitle(targetSkill.getName() + ": Beginner to Advanced");
        path.setGeneratedAt(LocalDateTime.now());

        List<Course> candidates = courseRepository.findBySkillCoveredId(targetSkill.getId());
        double currentScore = gap.getCurrentScore();

        Set<String> allowedStages = getAllowedDifficultyStages(currentScore);

        List<Course> filteredCourses = candidates.stream()
                .filter(c -> c.getDifficulty() != null && allowedStages.contains(c.getDifficulty().toUpperCase()))
                .sorted(Comparator.comparingInt((Course c) -> difficultyRank(c.getDifficulty()))
                        .thenComparing((Course c) -> courseScoreMap.getOrDefault(c.getId(), 0.0), Comparator.reverseOrder())
                        .thenComparing((Course c) -> c.getIsInternal() != null && c.getIsInternal() ? 0 : 1))
                .toList();

        Map<String, List<Course>> coursesByStage = filteredCourses.stream()
                .collect(Collectors.groupingBy(c -> c.getDifficulty().toUpperCase()));

        List<LearningPathStep> steps = new ArrayList<>();
        int stepOrder = 1;

        List<String> orderedStages = List.of("BEGINNER", "INTERMEDIATE", "ADVANCED");
        for (String stage : orderedStages) {
            if (allowedStages.contains(stage) && coursesByStage.containsKey(stage)) {
                List<Course> stageCourses = coursesByStage.get(stage);
                int limit = Math.min(stageCourses.size(), 2);
                for (int i = 0; i < limit; i++) {
                    Course course = stageCourses.get(i);
                    int hours = course.getDurationHours() != null ? (int) Math.round(course.getDurationHours()) : 10;

                    LearningPathStep step = LearningPathStep.builder()
                            .learningPath(path)
                            .course(course)
                            .stepOrder(stepOrder++)
                            .difficultyStage(stage)
                            .estimatedHours(hours)
                            .status("NOT_STARTED")
                            .build();

                    steps.add(step);
                }
            }
        }

        if (steps.isEmpty()) {
            path.setNoCoursesAvailable(true);
            path.setTotalEstimatedHours(0);
            path.setOverallProgressPercent(0);
            path.setStatus("NOT_STARTED");
            path.setSteps(new ArrayList<>());
        } else {
            path.setNoCoursesAvailable(false);
            int totalHours = steps.stream().mapToInt(LearningPathStep::getEstimatedHours).sum();
            path.setTotalEstimatedHours(totalHours);
            path.setOverallProgressPercent(0);
            path.setStatus("NOT_STARTED");
            path.setSteps(steps);
        }

        return path;
    }

    private Set<String> getAllowedDifficultyStages(double currentScore) {
        if (currentScore < 2.0) {
            return Set.of("BEGINNER", "INTERMEDIATE", "ADVANCED");
        } else if (currentScore < 4.0) {
            return Set.of("INTERMEDIATE", "ADVANCED");
        } else {
            return Set.of("ADVANCED");
        }
    }

    private int difficultyRank(String difficulty) {
        if (difficulty == null) return 4;
        return switch (difficulty.toUpperCase()) {
            case "BEGINNER" -> 1;
            case "INTERMEDIATE" -> 2;
            case "ADVANCED" -> 3;
            default -> 4;
        };
    }

    // ── Progress Update Logic ────────────────────────────────────────────────---

    private void updatePathProgress(LearningPath path) {
        List<LearningPathStep> steps = path.getSteps();
        if (steps == null || steps.isEmpty()) {
            path.setOverallProgressPercent(100);
            path.setStatus("COMPLETED");
            learningPathRepository.save(path);
            return;
        }

        long completedCount = steps.stream()
                .filter(s -> "COMPLETED".equalsIgnoreCase(s.getStatus()))
                .count();

        int percent = (int) Math.round(((double) completedCount / steps.size()) * 100.0);
        path.setOverallProgressPercent(percent);

        if (completedCount == steps.size()) {
            path.setStatus("COMPLETED");
            learningPathRepository.save(path);

            // Finishing a learning path deliberately does not raise the employee's proficiency and
            // does not recalculate gaps. A level is a claim about ability and only an assessment is
            // evidence for it, so the employee reassesses to have the new level recognised.
        } else if (completedCount > 0) {
            path.setStatus("IN_PROGRESS");
            learningPathRepository.save(path);
        } else {
            path.setStatus("NOT_STARTED");
            learningPathRepository.save(path);
        }
    }


    // ── Response Mapping ────────────────────────────────────────────────────────

    public LearningPathResponse toResponse(LearningPath path) {
        List<LearningPathStepResponse> stepResponses = path.getSteps() != null
                ? path.getSteps().stream().map(this::toStepResponse).toList()
                : List.of();

        List<CourseResponse> legacyCourses = path.getSteps() != null
                ? path.getSteps().stream()
                .filter(s -> s.getCourse() != null)
                .map(s -> toLegacyCourseResponse(s.getCourse()))
                .toList()
                : List.of();

        int totalHours = path.getTotalEstimatedHours() != null ? path.getTotalEstimatedHours() : 0;
        String calendarTime = calculateCalendarTime(totalHours, path.getNoCoursesAvailable());

        return LearningPathResponse.builder()
                .id(path.getId())
                .employeeId(path.getEmployee() != null ? path.getEmployee().getId() : null)
                .employeeName(path.getEmployee() != null ? path.getEmployee().getFullName() : null)
                .targetSkillId(path.getTargetSkill() != null ? path.getTargetSkill().getId() : null)
                .targetSkillName(path.getTargetSkill() != null ? path.getTargetSkill().getName() : null)
                .title(path.getTitle())
                .description(path.getDescription())
                .targetRole(path.getTargetRole())
                .targetDepartment(path.getTargetDepartment())
                .targetSeverity(path.getTargetSeverity())
                .totalEstimatedHours(totalHours)
                .estimatedCalendarTime(calendarTime)
                .status(path.getStatus())
                .overallProgressPercent(path.getOverallProgressPercent() != null ? path.getOverallProgressPercent() : 0)
                .generatedAt(path.getGeneratedAt())
                .noCoursesAvailable(path.getNoCoursesAvailable() != null ? path.getNoCoursesAvailable() : false)
                .steps(stepResponses)
                .courses(legacyCourses)
                .build();
    }

    private LearningPathStepResponse toStepResponse(LearningPathStep step) {
        Course course = step.getCourse();
        return LearningPathStepResponse.builder()
                .id(step.getId())
                .learningPathId(step.getLearningPath() != null ? step.getLearningPath().getId() : null)
                .courseId(course != null ? course.getId() : null)
                .courseTitle(course != null ? course.getTitle() : null)
                .courseDescription(course != null ? course.getDescription() : null)
                .provider(course != null ? course.getProvider() : null)
                .externalUrl(course != null ? course.getExternalUrl() : null)
                .isInternal(course != null ? course.getIsInternal() : null)
                .stepOrder(step.getStepOrder())
                .difficultyStage(step.getDifficultyStage())
                .estimatedHours(step.getEstimatedHours())
                .status(step.getStatus())
                .completedAt(step.getCompletedAt())
                .build();
    }

    private CourseResponse toLegacyCourseResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .provider(c.getProvider())
                .skillId(c.getSkillCovered() != null ? c.getSkillCovered().getId() : null)
                .skillName(c.getSkillCovered() != null ? c.getSkillCovered().getName() : null)
                .difficulty(c.getDifficulty())
                .durationHours(c.getDurationHours())
                .isInternal(c.getIsInternal())
                .externalUrl(c.getExternalUrl())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private String calculateCalendarTime(int totalHours, Boolean noCoursesAvailable) {
        if (Boolean.TRUE.equals(noCoursesAvailable) || totalHours <= 0) {
            return "N/A";
        }
        int pace = Math.max(1, weeklyHoursPace);
        int weeks = (int) Math.ceil((double) totalHours / pace);
        return weeks == 1 ? "Est. 1 week" : "Est. " + weeks + " weeks";
    }
}
