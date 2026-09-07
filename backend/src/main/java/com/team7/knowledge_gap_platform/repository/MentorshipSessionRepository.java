package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.MentorshipSession;

@Repository
public interface MentorshipSessionRepository extends JpaRepository<MentorshipSession, Long> {
    List<MentorshipSession> findByMenteeId(Long menteeId);
    List<MentorshipSession> findByMentorId(Long mentorId);
}
