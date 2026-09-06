package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.LearningPath;
import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.repository.LearningPathRepository;
import com.team7.knowledge_gap_platform.repository.SkillGapRepository;

@Service
public class LearningPathService {

    private final LearningPathRepository learningPathRepository;
    private final SkillGapRepository skillGapRepository;

    public LearningPathService(
            LearningPathRepository learningPathRepository,
            SkillGapRepository skillGapRepository) {

        this.learningPathRepository = learningPathRepository;
        this.skillGapRepository = skillGapRepository;
    }

    public List<LearningPath> generateLearningPath(Long employeeId) {

        List<SkillGap> gaps =
                skillGapRepository.findByEmployeeId(employeeId);

        List<LearningPath> paths = new ArrayList<>();

        for (SkillGap gap : gaps) {

            if (gap.getGapScore() == null || gap.getGapScore() <= 0) {
                continue;
            }

            int currentLevel =
                    getLevelValue(gap.getCurrentProficiency());

            int requiredLevel =
                    getLevelValue(gap.getRequiredProficiency());

            int sequence = 1;

            for (int level = currentLevel + 1;
                    level <= requiredLevel;
                    level++) {

                LearningPath path = new LearningPath();

                path.setEmployeeId(employeeId);
                path.setSkillId(gap.getSkillId());

                path.setCurrentLevel(
                        gap.getCurrentProficiency());

                path.setTargetLevel(
                        gap.getRequiredProficiency());

                path.setCourseLevel(
                        getLevelName(level));

                path.setCourseTitle(
                        getCourseTitle(
                                gap.getSkillId(),
                                getLevelName(level)));

                path.setSequenceOrder(sequence);

                path.setEstimatedHours(
                        getEstimatedHours(level));

                path.setCourseLink(null);

                path.setCreatedAt(LocalDateTime.now());

                paths.add(
                        learningPathRepository.save(path));

                sequence++;
            }
        }

        return paths;
    }

    public List<LearningPath> getLearningPathByEmployee(
            Long employeeId) {

        return learningPathRepository
                .findByEmployeeIdOrderBySequenceOrderAsc(employeeId);
    }

    public List<LearningPath> getLearningPathByEmployeeAndSkill(
            Long employeeId,
            Long skillId) {

        return learningPathRepository
                .findByEmployeeIdAndSkillIdOrderBySequenceOrderAsc(
                        employeeId,
                        skillId);
    }

    private int getLevelValue(String level) {

        if (level == null) {
            return 0;
        }

        return switch (level.toLowerCase()) {
            case "unaware" -> 0;
            case "beginner" -> 1;
            case "intermediate" -> 2;
            case "advanced" -> 3;
            case "expert" -> 4;
            default -> 0;
        };
    }

    private String getLevelName(int level) {

        return switch (level) {
            case 1 -> "Beginner";
            case 2 -> "Intermediate";
            case 3 -> "Advanced";
            case 4 -> "Expert";
            default -> "Unknown";
        };
    }

    private Integer getEstimatedHours(int level) {

        return switch (level) {
            case 1 -> 5;
            case 2 -> 8;
            case 3 -> 10;
            case 4 -> 12;
            default -> 5;
        };
    }

    private String getCourseTitle(
            Long skillId,
            String level) {

        return level
                + " Learning Path for Skill "
                + skillId;
    }
}