package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.MentorshipRequest;

@Repository
public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Long> {
    List<MentorshipRequest> findByMentorId(Long mentorId);
    List<MentorshipRequest> findByMenteeId(Long menteeId);
}
