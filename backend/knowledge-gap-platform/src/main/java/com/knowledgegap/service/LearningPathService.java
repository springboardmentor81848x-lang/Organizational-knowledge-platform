package com.knowledgegap.service;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.LearningPath;
import com.knowledgegap.entity.LearningPathCourse;
import com.knowledgegap.repository.CourseRepository;
import com.knowledgegap.repository.LearningPathCourseRepository;
import com.knowledgegap.repository.LearningPathRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class LearningPathService {

    private final LearningPathRepository learningPathRepository;
    private final LearningPathCourseRepository learningPathCourseRepository;
    private final CourseRepository courseRepository;
    private final KnowledgeGapService knowledgeGapService;

    public LearningPathService(
            LearningPathRepository learningPathRepository,
            LearningPathCourseRepository learningPathCourseRepository,
            CourseRepository courseRepository,
            KnowledgeGapService knowledgeGapService) {

        this.learningPathRepository = learningPathRepository;
        this.learningPathCourseRepository = learningPathCourseRepository;
        this.courseRepository = courseRepository;
        this.knowledgeGapService = knowledgeGapService;
    }

    public LearningPath generateLearningPath(Employee employee) {

        if (employee == null) {
            throw new IllegalArgumentException("Employee cannot be null");
        }

        // Get the employee's existing knowledge gaps
        List<KnowledgeGap> knowledgeGaps =
                knowledgeGapService.getKnowledgeGapsByEmployee(employee);

        if (knowledgeGaps.isEmpty()) {
            throw new IllegalStateException(
                    "No knowledge gaps found for this employee"
            );
        }

        // Create the learning path
        LearningPath learningPath = new LearningPath();

        learningPath.setEmployee(employee);

        learningPath.setTitle(
                "Personalized Learning Path - "
                        + employee.getDesignation()
        );

        learningPath.setDescription(
                "Learning path generated based on identified knowledge gaps."
        );

        learningPath.setStatus("ACTIVE");

        learningPath.setCreatedAt(LocalDateTime.now());

        learningPath =
                learningPathRepository.save(learningPath);

        /*
         * Sort knowledge gaps from highest gap to lowest gap.
         *
         * Example:
         * Spring Boot → Gap 3
         * Java        → Gap 2
         * SQL         → Gap 1
         */
        knowledgeGaps.sort(
                Comparator.comparing(
                        KnowledgeGap::getGap,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        int sequence = 1;

        for (KnowledgeGap gap : knowledgeGaps) {

            if (gap.getSkill() == null) {
                continue;
            }

            /*
             * Find courses related to the skill
             * that has the knowledge gap.
             */
            List<Course> courses =
                    courseRepository.findBySkill(gap.getSkill());

            /*
             * Arrange courses:
             * Beginner → Intermediate → Advanced
             */
            courses.sort(
                    Comparator.comparingInt(
                            this::getLevelOrder
                    )
            );

            for (Course course : courses) {

                LearningPathCourse learningPathCourse =
                        new LearningPathCourse();

                learningPathCourse.setLearningPath(learningPath);

                learningPathCourse.setCourse(course);

                learningPathCourse.setSequenceOrder(sequence);

                /*
                 * Determine priority from the knowledge gap.
                 */
                learningPathCourse.setPriority(
                        getPriority(gap.getGap())
                );

                learningPathCourse.setStatus("NOT_STARTED");

                learningPathCourseRepository.save(
                        learningPathCourse
                );

                sequence++;
            }
        }

        return learningPath;
    }

    /*
     * Course level ordering:
     *
     * Beginner     → 1
     * Intermediate → 2
     * Advanced     → 3
     */
    private int getLevelOrder(Course course) {

        if (course.getLevel() == null) {
            return 99;
        }

        String level =
                course.getLevel().trim().toLowerCase();

        switch (level) {

            case "beginner":
                return 1;

            case "intermediate":
                return 2;

            case "advanced":
                return 3;

            default:
                return 99;
        }
    }

    /*
     * Determine priority from knowledge gap.
     */
    private String getPriority(Integer gap) {

        if (gap == null || gap <= 0) {
            return "LOW";
        }

        if (gap == 1) {
            return "LOW";
        }

        if (gap == 2) {
            return "MEDIUM";
        }

        if (gap == 3) {
            return "HIGH";
        }

        return "CRITICAL";
    }

    /*
     * Get an employee's existing learning paths.
     */
    public List<LearningPath> getLearningPathsByEmployee(
            Employee employee) {

        return learningPathRepository.findByEmployee(employee);
    }
    public LearningPath getLearningPathById(Long learningPathId) {

    return learningPathRepository.findById(learningPathId)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Learning path not found with id: "
                                    + learningPathId
                    )
            );
}

    /*
     * Get courses in a learning path
     * in their sequence order.
     */
    public List<LearningPathCourse> getCoursesByLearningPath(
            LearningPath learningPath) {

        return learningPathCourseRepository
                .findByLearningPathOrderBySequenceOrderAsc(
                        learningPath
                );
    }
}