package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team7.knowledge_gap_platform.entity.ExternalCourse;
import com.team7.knowledge_gap_platform.entity.LearningPath;
import com.team7.knowledge_gap_platform.entity.Skill;
import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.repository.ExternalCourseRepository;
import com.team7.knowledge_gap_platform.repository.LearningPathRepository;
import com.team7.knowledge_gap_platform.repository.SkillGapRepository;
import com.team7.knowledge_gap_platform.repository.SkillRepository;

@Service
public class LearningPathService {

    private static final Logger logger = LoggerFactory.getLogger(LearningPathService.class);

    private final LearningPathRepository learningPathRepository;
    private final SkillGapRepository skillGapRepository;
    private final SkillRepository skillRepository;
    private final ExternalCourseRepository externalCourseRepository;
    private final SkillGapService skillGapService;

    public LearningPathService(
            LearningPathRepository learningPathRepository,
            SkillGapRepository skillGapRepository,
            SkillRepository skillRepository,
            ExternalCourseRepository externalCourseRepository,
            SkillGapService skillGapService) {

        this.learningPathRepository = learningPathRepository;
        this.skillGapRepository = skillGapRepository;
        this.skillRepository = skillRepository;
        this.externalCourseRepository = externalCourseRepository;
        this.skillGapService = skillGapService;
    }

    @Transactional
    public List<LearningPath> generateLearningPath(Long employeeId) {
        logger.info("Generating learning path for employeeId: {}", employeeId);

        // Map existing learning paths to preserve user progress
        List<LearningPath> existingPaths = learningPathRepository.findByEmployeeIdOrderBySequenceOrderAsc(employeeId);
        Map<Long, LearningPath> existingSkillMap = existingPaths.stream()
                .filter(p -> p.getSkillId() != null)
                .collect(Collectors.toMap(LearningPath::getSkillId, p -> p, (p1, p2) -> p1));

        // 1. Analyze and refresh gaps for the employee directly from PostgreSQL data
        List<SkillGap> gaps;
        try {
            gaps = skillGapService.analyzeAndSaveGapsByEmployee(employeeId);
        } catch (Exception e) {
            logger.warn("Could not analyze gaps dynamically, fetching existing gaps for employeeId: {}", employeeId, e);
            gaps = skillGapRepository.findByEmployeeId(employeeId);
        }

        // 2. Clear existing learning paths for fresh generation
        learningPathRepository.deleteByEmployeeId(employeeId);

        List<LearningPath> paths = new ArrayList<>();
        int sequence = 1;

        for (SkillGap gap : gaps) {
            if (gap.getGapScore() == null || gap.getGapScore() <= 0) {
                continue;
            }

            Skill skill = skillRepository.findById(gap.getSkillId()).orElse(null);
            String skillName = skill != null ? skill.getSkillName() : "Skill #" + gap.getSkillId();

            // 3. Search for existing external course for this skill
            List<ExternalCourse> externalCourses = externalCourseRepository.findBySkillNameIgnoreCase(skillName);
            ExternalCourse matchedCourse = null;

            if (externalCourses != null && !externalCourses.isEmpty()) {
                // Try to find matching level if available
                Optional<ExternalCourse> levelMatch = externalCourses.stream()
                        .filter(c -> c.getLevel() != null && gap.getRequiredProficiency() != null
                                && c.getLevel().equalsIgnoreCase(gap.getRequiredProficiency()))
                        .findFirst();
                matchedCourse = levelMatch.orElse(externalCourses.get(0));
            }

            LearningPath path = new LearningPath();
            path.setEmployeeId(employeeId);
            path.setSkillId(gap.getSkillId());
            path.setSkillName(skillName);
            path.setCurrentLevel(gap.getCurrentProficiency());
            path.setTargetLevel(gap.getRequiredProficiency());
            path.setSequenceOrder(sequence);
            path.setCreatedAt(LocalDateTime.now());

            // Preserve existing progress if available
            LearningPath existing = existingSkillMap.get(gap.getSkillId());
            if (existing != null) {
                path.setStatus(existing.getStatus() != null ? existing.getStatus() : "NOT_STARTED");
                path.setCompletionPercentage(existing.getCompletionPercentage() != null ? existing.getCompletionPercentage() : 0);
            } else {
                path.setStatus("NOT_STARTED");
                path.setCompletionPercentage(0);
            }

            if (matchedCourse != null) {
                path.setCourseTitle(matchedCourse.getTitle());
                path.setCourseLevel(matchedCourse.getLevel() != null ? matchedCourse.getLevel() : gap.getRequiredProficiency());
                path.setProvider(matchedCourse.getProvider() != null ? matchedCourse.getProvider() : "External Provider");
                path.setCourseLink(matchedCourse.getCourseLink());
                path.setEstimatedHours(matchedCourse.getDurationHours() != null ? matchedCourse.getDurationHours() : getEstimatedHoursByLevel(gap.getRequiredProficiency()));
            } else {
                path.setCourseTitle(skillName + " - " + formatTitleCase(gap.getRequiredProficiency()) + " Mastery");
                path.setCourseLevel(gap.getRequiredProficiency());
                path.setProvider("KGAP Platform");
                path.setCourseLink("https://learning.kgap.com/courses/" + gap.getSkillId());
                path.setEstimatedHours(getEstimatedHoursByLevel(gap.getRequiredProficiency()));
            }

            paths.add(learningPathRepository.save(path));
            sequence++;
        }

        return paths;
    }

    public List<LearningPath> getLearningPathByEmployee(Long employeeId) {
        List<LearningPath> existing = learningPathRepository.findByEmployeeIdOrderBySequenceOrderAsc(employeeId);
        if (existing == null || existing.isEmpty()) {
            return generateLearningPath(employeeId);
        }
        return existing;
    }

    public List<LearningPath> getLearningPathByEmployeeAndSkill(Long employeeId, Long skillId) {
        return learningPathRepository.findByEmployeeIdAndSkillIdOrderBySequenceOrderAsc(employeeId, skillId);
    }

    public LearningPath getLearningPathById(Long id) {
        return learningPathRepository.findById(id).orElse(null);
    }

    @Transactional
    public LearningPath updateLearningProgress(Long id, String status, Integer completionPercentage) {
        LearningPath path = learningPathRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learning path not found with id: " + id));

        if (completionPercentage != null) {
            int validPercentage = Math.min(100, Math.max(0, completionPercentage));
            path.setCompletionPercentage(validPercentage);
        }

        if (status != null && !status.trim().isEmpty()) {
            path.setStatus(status.trim().toUpperCase());
        } else {
            int currentPercentage = path.getCompletionPercentage() != null ? path.getCompletionPercentage() : 0;
            if (currentPercentage >= 100) {
                path.setStatus("COMPLETED");
            } else if (currentPercentage > 0) {
                path.setStatus("IN_PROGRESS");
            } else {
                path.setStatus("NOT_STARTED");
            }
        }

        logger.info("Updated learning progress for path id {}: status={}, completionPercentage={}%",
                id, path.getStatus(), path.getCompletionPercentage());

        return learningPathRepository.save(path);
    }

    private int getEstimatedHoursByLevel(String level) {
        if (level == null) return 10;
        return switch (level.toUpperCase()) {
            case "BEGINNER" -> 8;
            case "INTERMEDIATE" -> 15;
            case "ADVANCED" -> 25;
            case "EXPERT" -> 40;
            default -> 12;
        };
    }

    private String formatTitleCase(String text) {
        if (text == null || text.isEmpty()) return "";
        return text.substring(0, 1).toUpperCase() + text.substring(1).toLowerCase();
    }
}