package com.knowledgegap.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.LearningMilestone;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.entity.TrainingStatus;
import com.knowledgegap.repository.LearningMilestoneRepository;
import com.knowledgegap.repository.TrainingEnrollmentRepository;

@Service
public class LearningMilestoneService {

    private final LearningMilestoneRepository milestoneRepository;

    private final CourseService courseService;

    private final TrainingEnrollmentRepository enrollmentRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LearningMilestoneService(
            LearningMilestoneRepository milestoneRepository,
            CourseService courseService,
            TrainingEnrollmentRepository enrollmentRepository) {

        this.milestoneRepository =
                milestoneRepository;

        this.courseService =
                courseService;

        this.enrollmentRepository =
                enrollmentRepository;
    }


    // =========================================================
    // CREATE MILESTONE
    // =========================================================

    @Transactional
    public LearningMilestone createMilestone(
            Long courseId,
            LearningMilestone milestone) {

        if (milestone == null) {

            throw new IllegalArgumentException(
                    "Milestone data cannot be null."
            );
        }

        if (
            milestone.getTitle() == null ||
            milestone.getTitle().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Milestone title is required."
            );
        }

        if (
            milestone.getMilestoneOrder() == null ||
            milestone.getMilestoneOrder() <= 0
        ) {

            throw new IllegalArgumentException(
                    "Milestone order must be greater than 0."
            );
        }


        // -----------------------------------------------------
        // GET COURSE
        // -----------------------------------------------------

        Course course =
                courseService.getCourseById(
                        courseId
                );


        // -----------------------------------------------------
        // ASSIGN COURSE
        // -----------------------------------------------------

        milestone.setCourse(course);


        // -----------------------------------------------------
        // DEFAULT PROGRESS
        // -----------------------------------------------------

        milestone.setProgressPercentage(0);

        milestone.setStatus(
                TrainingStatus.NOT_STARTED
        );


        return milestoneRepository.save(
                milestone
        );
    }


    // =========================================================
    // GET MILESTONES BY COURSE
    // =========================================================

    @Transactional(readOnly = true)
    public List<LearningMilestone>
    getMilestonesByCourse(
            Long courseId) {

        Course course =
                courseService.getCourseById(
                        courseId
                );

        return milestoneRepository
                .findByCourseOrderByMilestoneOrderAsc(
                        course
                );
    }


    // =========================================================
    // GET MILESTONE BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public LearningMilestone getMilestoneById(
            Long milestoneId) {

        return milestoneRepository
                .findById(milestoneId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Learning milestone not found with id: "
                                        + milestoneId
                        )
                );
    }


    // =========================================================
    // UPDATE MILESTONE
    // =========================================================

    @Transactional
    public LearningMilestone updateMilestone(
            Long milestoneId,
            LearningMilestone updatedMilestone) {

        if (updatedMilestone == null) {

            throw new IllegalArgumentException(
                    "Milestone data cannot be null."
            );
        }


        LearningMilestone existing =
                getMilestoneById(
                        milestoneId
                );


        if (
            updatedMilestone.getTitle() != null &&
            !updatedMilestone.getTitle().isBlank()
        ) {

            existing.setTitle(
                    updatedMilestone.getTitle()
            );
        }


        if (
            updatedMilestone.getDescription() != null
        ) {

            existing.setDescription(
                    updatedMilestone.getDescription()
            );
        }


        if (
            updatedMilestone.getMilestoneOrder() != null &&
            updatedMilestone.getMilestoneOrder() > 0
        ) {

            existing.setMilestoneOrder(
                    updatedMilestone
                            .getMilestoneOrder()
            );
        }


        return milestoneRepository.save(
                existing
        );
    }


    // =========================================================
    // UPDATE MILESTONE PROGRESS
    // =========================================================

    @Transactional
    public LearningMilestone updateProgress(
            Long milestoneId,
            Integer progressPercentage) {


        // -----------------------------------------------------
        // VALIDATE PROGRESS
        // -----------------------------------------------------

        if (progressPercentage == null) {

            throw new IllegalArgumentException(
                    "Progress percentage is required."
            );
        }

        if (
            progressPercentage < 0 ||
            progressPercentage > 100
        ) {

            throw new IllegalArgumentException(
                    "Progress must be between 0 and 100."
            );
        }


        // -----------------------------------------------------
        // GET MILESTONE
        // -----------------------------------------------------

        LearningMilestone milestone =
                getMilestoneById(
                        milestoneId
                );


        // -----------------------------------------------------
        // SET PROGRESS
        // -----------------------------------------------------

        milestone.setProgressPercentage(
                progressPercentage
        );


        // -----------------------------------------------------
        // AUTOMATIC STATUS
        // -----------------------------------------------------

        if (progressPercentage == 100) {

            milestone.setStatus(
                    TrainingStatus.COMPLETED
            );

        } else if (progressPercentage > 0) {

            milestone.setStatus(
                    TrainingStatus.IN_PROGRESS
            );

        } else {

            milestone.setStatus(
                    TrainingStatus.NOT_STARTED
            );
        }


        LearningMilestone savedMilestone =
                milestoneRepository.save(
                        milestone
                );


        // -----------------------------------------------------
        // RECALCULATE COURSE PROGRESS
        // -----------------------------------------------------

        recalculateCourseProgress(
                milestone.getCourse()
        );


        return savedMilestone;
    }


    // =========================================================
    // COMPLETE MILESTONE
    // =========================================================

    @Transactional
    public LearningMilestone completeMilestone(
            Long milestoneId) {

        LearningMilestone milestone =
                getMilestoneById(
                        milestoneId
                );


        milestone.setProgressPercentage(
                100
        );

        milestone.setStatus(
                TrainingStatus.COMPLETED
        );


        LearningMilestone savedMilestone =
                milestoneRepository.save(
                        milestone
                );


        // -----------------------------------------------------
        // UPDATE COURSE PROGRESS
        // -----------------------------------------------------

        recalculateCourseProgress(
                milestone.getCourse()
        );


        return savedMilestone;
    }


    // =========================================================
    // RECALCULATE COURSE PROGRESS
    // =========================================================

    private void recalculateCourseProgress(
            Course course) {

        List<LearningMilestone> milestones =
                milestoneRepository
                        .findByCourseOrderByMilestoneOrderAsc(
                                course
                        );


        // -----------------------------------------------------
        // NO MILESTONES
        // -----------------------------------------------------

        if (milestones.isEmpty()) {
            return;
        }


        // -----------------------------------------------------
        // CALCULATE AVERAGE PROGRESS
        // -----------------------------------------------------

        int totalProgress = 0;

        for (
                LearningMilestone milestone :
                milestones
        ) {

            totalProgress +=
                    milestone
                            .getProgressPercentage() != null
                            ? milestone
                                .getProgressPercentage()
                            : 0;
        }


        int overallProgress =
                Math.round(
                        (float) totalProgress /
                        milestones.size()
                );


        // -----------------------------------------------------
        // FIND ENROLLMENTS FOR COURSE
        // -----------------------------------------------------

        List<TrainingEnrollment> enrollments =
                enrollmentRepository
                        .findByCourse(course);


        // -----------------------------------------------------
        // UPDATE EACH ENROLLMENT
        // -----------------------------------------------------

        for (
                TrainingEnrollment enrollment :
                enrollments
        ) {

            enrollment.setProgressPercentage(
                    overallProgress
            );


            // -------------------------------------------------
            // AUTOMATIC STATUS
            // -------------------------------------------------

            if (overallProgress == 100) {

                enrollment.setStatus(
                        TrainingStatus.COMPLETED
                );

                if (
                    enrollment
                        .getActualCompletionDate() == null
                ) {

                    enrollment.setActualCompletionDate(
                            java.time.LocalDate.now()
                    );
                }

            } else if (overallProgress > 0) {

                enrollment.setStatus(
                        TrainingStatus.IN_PROGRESS
                );

                if (
                    enrollment.getStartDate() == null
                ) {

                    enrollment.setStartDate(
                            java.time.LocalDate.now()
                    );
                }

            } else {

                enrollment.setStatus(
                        TrainingStatus.NOT_STARTED
                );
            }
        }


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        enrollmentRepository.saveAll(
                enrollments
        );
    }


    // =========================================================
    // DELETE MILESTONE
    // =========================================================

    @Transactional
    public void deleteMilestone(
            Long milestoneId) {

        if (
            !milestoneRepository
                    .existsById(milestoneId)
        ) {

            throw new RuntimeException(
                    "Learning milestone not found with id: "
                            + milestoneId
            );
        }


        LearningMilestone milestone =
                getMilestoneById(
                        milestoneId
                );


        Course course =
                milestone.getCourse();


        milestoneRepository.deleteById(
                milestoneId
        );


        // -----------------------------------------------------
        // RECALCULATE AFTER DELETE
        // -----------------------------------------------------

        recalculateCourseProgress(
                course
        );
    }
}
