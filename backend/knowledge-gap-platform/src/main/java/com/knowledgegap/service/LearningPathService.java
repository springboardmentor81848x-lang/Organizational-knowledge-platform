package com.knowledgegap.service;

import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.AssessmentGapResult;
import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.LearningPath;
import com.knowledgegap.entity.LearningPathCourse;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.AssessmentGapResultRepository;
import com.knowledgegap.repository.CourseRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;
import com.knowledgegap.repository.LearningPathCourseRepository;
import com.knowledgegap.repository.LearningPathRepository;
import com.knowledgegap.repository.SkillRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class LearningPathService {

    private final LearningPathRepository learningPathRepository;
    private final LearningPathCourseRepository learningPathCourseRepository;
    private final CourseRepository courseRepository;
    private final SkillRepository skillRepository;
    private final KnowledgeGapService knowledgeGapService;

    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final AssessmentGapResultRepository assessmentGapResultRepository;

    public LearningPathService(
            LearningPathRepository learningPathRepository,
            LearningPathCourseRepository learningPathCourseRepository,
            CourseRepository courseRepository,
            SkillRepository skillRepository,
            KnowledgeGapService knowledgeGapService,
            AssessmentAttemptRepository assessmentAttemptRepository,
            AssessmentGapResultRepository assessmentGapResultRepository) {

        this.learningPathRepository = learningPathRepository;
        this.learningPathCourseRepository = learningPathCourseRepository;
        this.courseRepository = courseRepository;
        this.skillRepository = skillRepository;
        this.knowledgeGapService = knowledgeGapService;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.assessmentGapResultRepository = assessmentGapResultRepository;
    }

    // =========================================================
    // GENERATE LEARNING PATH
    // =========================================================

    public LearningPath generateLearningPath(Employee employee) {

        if (employee == null) {
            throw new IllegalArgumentException(
                    "Employee cannot be null"
            );
        }

        // -----------------------------------------------------
        // Existing knowledge gaps
        // -----------------------------------------------------

        List<KnowledgeGap> knowledgeGaps =
                knowledgeGapService
                        .getKnowledgeGapsByEmployee(employee);

        // -----------------------------------------------------
        // Latest assessment
        // -----------------------------------------------------

        AssessmentAttempt latestAttempt =
                assessmentAttemptRepository
                        .findFirstByEmployeeOrderByIdDesc(employee)
                        .orElse(null);

        List<AssessmentGapResult> assessmentGaps =
                new ArrayList<>();

        if (latestAttempt != null) {

            assessmentGaps =
                    assessmentGapResultRepository
                            .findByAttempt(latestAttempt);
        }

        // -----------------------------------------------------
        // Need at least one source of gap information
        // -----------------------------------------------------

        if (
                knowledgeGaps.isEmpty() &&
                assessmentGaps.isEmpty()
        ) {

            throw new IllegalStateException(
                    "No assessment or knowledge gap data found for this employee"
            );
        }

        // =====================================================
        // BUILD PRIORITY SKILLS
        // =====================================================

        /*
         * Priority:
         *
         * CRITICAL = 4
         * HIGH     = 3
         * MEDIUM   = 2
         * LOW      = 1
         */

        Map<String, Integer> skillPriority =
                new LinkedHashMap<>();

        // -----------------------------------------------------
        // Assessment results
        // -----------------------------------------------------

        for (AssessmentGapResult result :
                assessmentGaps) {

            if (
                    result.getSkillName() == null ||
                    result.getSkillName().isBlank()
            ) {
                continue;
            }

            String skillName =
                    result.getSkillName().trim();

            String severity =
                    result.getGapSeverity();

            int priority =
                    getPriorityValueFromSeverity(
                            severity
                    );

            skillPriority.merge(
                    skillName,
                    priority,
                    Math::max
            );
        }

        // -----------------------------------------------------
        // Knowledge gaps
        // -----------------------------------------------------

        for (KnowledgeGap gap :
                knowledgeGaps) {

            if (
                    gap.getSkill() == null ||
                    gap.getSkill().getSkillName() == null
            ) {
                continue;
            }

            String skillName =
                    gap.getSkill()
                            .getSkillName()
                            .trim();

            int priority =
                    getPriorityValueFromKnowledgeGap(
                            gap.getGap()
                    );

            skillPriority.merge(
                    skillName,
                    priority,
                    Math::max
            );
        }

        // -----------------------------------------------------
        // Remove skills with no priority
        // -----------------------------------------------------

        skillPriority.entrySet().removeIf(
                entry -> entry.getValue() <= 0
        );

        if (skillPriority.isEmpty()) {

            throw new IllegalStateException(
                    "No learning priorities were identified"
            );
        }

        // =====================================================
        // CREATE LEARNING PATH
        // =====================================================

        LearningPath learningPath =
                new LearningPath();

        learningPath.setEmployee(employee);

        learningPath.setTitle(
                "Personalized Learning Path - "
                        + (
                        employee.getDesignation() != null
                                ? employee.getDesignation()
                                : "Employee"
                )
        );

        learningPath.setDescription(
                "Personalized roadmap generated using "
                        + "skill assessment results and identified knowledge gaps."
        );

        learningPath.setStatus("ACTIVE");

        learningPath.setCreatedAt(
                LocalDateTime.now()
        );

        learningPath =
                learningPathRepository.save(
                        learningPath
                );

        // =====================================================
        // SORT SKILLS BY PRIORITY
        // =====================================================

        List<Map.Entry<String, Integer>> prioritizedSkills =
                new ArrayList<>(
                        skillPriority.entrySet()
                );

        prioritizedSkills.sort(
                Map.Entry.<String, Integer>
                        comparingByValue()
                        .reversed()
        );

        int sequence = 1;

        // =====================================================
        // CREATE COURSE ROADMAP
        // =====================================================

        for (
                Map.Entry<String, Integer> skillEntry :
                prioritizedSkills
        ) {

            String skillName =
                    skillEntry.getKey();

            int priorityValue =
                    skillEntry.getValue();

            // -------------------------------------------------
            // Find courses for skill
            // -------------------------------------------------

            List<Course> courses =
                    findCoursesForSkill(
                            skillName,
                            knowledgeGaps
                    );

            // -------------------------------------------------
            // Sort:
            // Beginner → Intermediate → Advanced → Expert
            // -------------------------------------------------

            courses.sort(
                    Comparator.comparingInt(
                            this::getLevelOrder
                    )
            );

            // -------------------------------------------------
            // Determine priority label
            // -------------------------------------------------

            String priority =
                    getPriorityLabel(
                            priorityValue
                    );

            // -------------------------------------------------
            // Add courses
            // -------------------------------------------------

            for (Course course :
                    courses) {

                LearningPathCourse learningPathCourse =
                        new LearningPathCourse();

                learningPathCourse.setLearningPath(
                        learningPath
                );

                learningPathCourse.setCourse(
                        course
                );

                learningPathCourse.setSequenceOrder(
                        sequence
                );

                learningPathCourse.setPriority(
                        priority
                );

                learningPathCourse.setStatus(
                        "NOT_STARTED"
                );

                learningPathCourseRepository.save(
                        learningPathCourse
                );

                sequence++;
            }
        }

        return learningPath;
    }

    // =========================================================
    // FIND COURSES FOR SKILL
    // =========================================================

    private List<Course> findCoursesForSkill(
            String skillName,
            List<KnowledgeGap> knowledgeGaps) {

        if (skillName == null || skillName.isBlank()) {
            return new ArrayList<>();
        }

        String normalizedSkillName =
                skillName.trim();

        // -----------------------------------------------------
        // STEP 1:
        // Try to find the Skill from KnowledgeGap
        // -----------------------------------------------------

        for (KnowledgeGap gap :
                knowledgeGaps) {

            if (
                    gap.getSkill() != null &&
                    gap.getSkill().getSkillName() != null &&
                    gap.getSkill()
                            .getSkillName()
                            .equalsIgnoreCase(
                                    normalizedSkillName
                            )
            ) {

                return courseRepository.findBySkill(
                        gap.getSkill()
                );
            }
        }

        // -----------------------------------------------------
        // STEP 2:
        // If not found in KnowledgeGap,
        // find Skill directly from SkillRepository
        // -----------------------------------------------------

        return skillRepository
                .findBySkillNameIgnoreCase(
                        normalizedSkillName
                )
                .map(courseRepository::findBySkill)
                .orElseGet(ArrayList::new);
    }

    // =========================================================
    // ASSESSMENT SEVERITY → PRIORITY
    // =========================================================

    private int getPriorityValueFromSeverity(
            String severity) {

        if (severity == null) {
            return 0;
        }

        switch (
                severity
                        .trim()
                        .toUpperCase()
        ) {

            case "CRITICAL":
                return 4;

            case "HIGH":
                return 3;

            case "MEDIUM":
                return 2;

            case "LOW":
                return 1;

            default:
                return 0;
        }
    }

    // =========================================================
    // KNOWLEDGE GAP → PRIORITY
    // =========================================================

    private int getPriorityValueFromKnowledgeGap(
            Integer gap) {

        if (gap == null || gap <= 0) {
            return 0;
        }

        if (gap == 1) {
            return 1;
        }

        if (gap == 2) {
            return 2;
        }

        if (gap == 3) {
            return 3;
        }

        return 4;
    }

    // =========================================================
    // PRIORITY LABEL
    // =========================================================

    private String getPriorityLabel(
            int priority) {

        switch (priority) {

            case 4:
                return "CRITICAL";

            case 3:
                return "HIGH";

            case 2:
                return "MEDIUM";

            case 1:
                return "LOW";

            default:
                return "LOW";
        }
    }

    // =========================================================
    // COURSE LEVEL ORDER
    // =========================================================

    private int getLevelOrder(
            Course course) {

        if (course.getLevel() == null) {
            return 99;
        }

        String level =
                course.getLevel()
                        .trim()
                        .toLowerCase();

        switch (level) {

            case "beginner":
                return 1;

            case "intermediate":
                return 2;

            case "advanced":
                return 3;

            case "expert":
                return 4;

            default:
                return 99;
        }
    }

    // =========================================================
    // GET EMPLOYEE LEARNING PATHS
    // =========================================================

    public List<LearningPath>
    getLearningPathsByEmployee(
            Employee employee) {

        return learningPathRepository
                .findByEmployee(employee);
    }

    // =========================================================
    // GET LEARNING PATH
    // =========================================================

    public LearningPath getLearningPathById(
            Long learningPathId) {

        return learningPathRepository
                .findById(learningPathId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Learning path not found with id: "
                                        + learningPathId
                        )
                );
    }

    // =========================================================
    // GET COURSES
    // =========================================================

    public List<LearningPathCourse>
    getCoursesByLearningPath(
            LearningPath learningPath) {

        return learningPathCourseRepository
                .findByLearningPathOrderBySequenceOrderAsc(
                        learningPath
                );
    }
}