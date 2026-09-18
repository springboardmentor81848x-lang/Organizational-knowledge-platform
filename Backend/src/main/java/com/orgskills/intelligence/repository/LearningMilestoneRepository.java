package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.LearningMilestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningMilestoneRepository extends JpaRepository<LearningMilestone, Long> {

    /** A learner's own milestones for one enrolment, in teaching order. */
    List<LearningMilestone> findByEnrollmentIdOrderBySequenceAsc(Long enrollmentId);

    List<LearningMilestone> findByEnrollmentIdInOrderBySequenceAsc(List<Long> enrollmentIds);

    /** The course-level template rows, which enrolling copies for the learner. */
    List<LearningMilestone> findByTrainingIdAndEnrollmentIsNullOrderBySequenceAsc(Long trainingId);

    Optional<LearningMilestone> findByMilestoneIdAndEnrollmentId(Long milestoneId, Long enrollmentId);
}
