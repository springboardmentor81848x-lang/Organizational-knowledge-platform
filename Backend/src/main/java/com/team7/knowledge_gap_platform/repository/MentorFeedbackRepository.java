package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.MentorFeedback;

public interface MentorFeedbackRepository
        extends JpaRepository<MentorFeedback, Long> {

    List<MentorFeedback> findByMentorId(Long mentorId);

    List<MentorFeedback> findByMenteeId(Long menteeId);

    List<MentorFeedback> findByMentorshipSessionId(Long mentorshipSessionId);
}