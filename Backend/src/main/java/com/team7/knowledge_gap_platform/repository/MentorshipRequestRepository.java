package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.MentorshipRequest;

public interface MentorshipRequestRepository
        extends JpaRepository<MentorshipRequest, Long> {

    List<MentorshipRequest> findByMenteeId(Long menteeId);

    List<MentorshipRequest> findByMentorId(Long mentorId);

    List<MentorshipRequest> findByMentorIdAndStatus(
            Long mentorId,
            String status);
}