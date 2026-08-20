package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.MentorshipSession;

public interface MentorshipSessionRepository
        extends JpaRepository<MentorshipSession, Long> {

    List<MentorshipSession> findByMentorId(Long mentorId);

    List<MentorshipSession> findByMenteeId(Long menteeId);

    List<MentorshipSession> findByMentorshipRequestId(Long mentorshipRequestId);
}