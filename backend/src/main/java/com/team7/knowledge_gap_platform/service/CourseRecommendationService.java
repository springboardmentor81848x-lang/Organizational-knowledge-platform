package com.team7.knowledge_gap_platform.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.Employee;
import com.team7.knowledge_gap_platform.entity.ExternalCourse;
import com.team7.knowledge_gap_platform.entity.Skill;
import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;
import com.team7.knowledge_gap_platform.repository.ExternalCourseRepository;
import com.team7.knowledge_gap_platform.repository.SkillGapRepository;
import com.team7.knowledge_gap_platform.repository.SkillRepository;

@Service
public class CourseRecommendationService {

    private final SkillGapRepository skillGapRepository;
    private final ExternalCourseRepository externalCourseRepository;
    private final SkillRepository skillRepository;
    private final EmployeeRepository employeeRepository;

    public CourseRecommendationService(
            SkillGapRepository skillGapRepository,
            ExternalCourseRepository externalCourseRepository,
            SkillRepository skillRepository,
            EmployeeRepository employeeRepository) {

        this.skillGapRepository = skillGapRepository;
        this.externalCourseRepository = externalCourseRepository;
        this.skillRepository = skillRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<ExternalCourse> recommendCourses(Long employeeId) {

        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        List<SkillGap> gaps =
                skillGapRepository.findByEmployeeId(employeeId);

        List<ScoredCourse> scoredCourses = new ArrayList<>();

        for (SkillGap gap : gaps) {

            if (gap.getGapScore() == null
                    || gap.getGapScore() <= 0) {
                continue;
            }

            Skill skill = skillRepository
                    .findById(gap.getSkillId())
                    .orElse(null);

            if (skill == null) {
                continue;
            }

            List<ExternalCourse> courses =
                    externalCourseRepository.findAll();

            for (ExternalCourse course : courses) {

                int score = calculateScore(
                        course,
                        gap,
                        skill,
                        employee
                );

                if (score > 0) {
                    scoredCourses.add(
                            new ScoredCourse(course, score)
                    );
                }
            }
        }

        scoredCourses.sort(
                Comparator
                        .comparingInt(ScoredCourse::score)
                        .reversed()
                        .thenComparing(
                                item -> item.course().getDurationHours(),
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        )
        );

        List<ExternalCourse> result = new ArrayList<>();

        for (ScoredCourse item : scoredCourses) {

            if (!result.contains(item.course())) {
                result.add(item.course());
            }
        }

        return result;
    }

    private int calculateScore(
            ExternalCourse course,
            SkillGap gap,
            Skill skill,
            Employee employee) {

        int score = 0;

        // 1. Missing skill match
        if (course.getSkillName() != null
                && skill.getSkillName() != null
                && course.getSkillName()
                        .equalsIgnoreCase(skill.getSkillName())) {

            score += 50;
        } else {
            return 0;
        }

        // 2. Skill priority based on gap
        score += getPriorityScore(gap);

        // 3. Required proficiency match
        if (course.getLevel() != null
                && gap.getRequiredProficiency() != null
                && course.getLevel()
                        .equalsIgnoreCase(
                                gap.getRequiredProficiency())) {

            score += 25;
        }

        // 4. Current proficiency consideration
        if (isSuitableForCurrentLevel(
                course.getLevel(),
                gap.getCurrentProficiency(),
                gap.getRequiredProficiency())) {

            score += 15;
        }

        // 5. User role consideration
        if (employee.getRole() != null
                && skill.getCategory() != null) {

            score += getRoleScore(
                    employee.getRole(),
                    skill.getCategory()
            );
        }

        return score;
    }

    private int getPriorityScore(SkillGap gap) {

        if (gap.getGapLevel() == null) {
            return 0;
        }

        return switch (gap.getGapLevel().toUpperCase()) {
            case "HIGH" -> 40;
            case "MEDIUM" -> 30;
            case "LOW" -> 20;
            default -> 0;
        };
    }

    private boolean isSuitableForCurrentLevel(
            String courseLevel,
            String currentLevel,
            String requiredLevel) {

        if (courseLevel == null
                || currentLevel == null
                || requiredLevel == null) {
            return false;
        }

        int course = getLevelValue(courseLevel);
        int current = getLevelValue(currentLevel);
        int required = getLevelValue(requiredLevel);

        return course > current && course <= required;
    }

    private int getRoleScore(
            String employeeRole,
            String skillCategory) {

        String role = employeeRole.toLowerCase();
        String category = skillCategory.toLowerCase();

        if (role.contains("developer")
                || role.contains("engineer")) {

            if (category.contains("programming")
                    || category.contains("technical")
                    || category.contains("development")) {
                return 10;
            }
        }

        if (role.contains("manager")) {

            if (category.contains("management")
                    || category.contains("leadership")
                    || category.contains("communication")) {
                return 10;
            }
        }

        if (role.contains("analyst")) {

            if (category.contains("data")
                    || category.contains("analytics")) {
                return 10;
            }
        }

        return 5;
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

    private record ScoredCourse(
            ExternalCourse course,
            int score) {
    }
}