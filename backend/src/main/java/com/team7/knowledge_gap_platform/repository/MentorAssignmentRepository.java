package com.team7.knowledge_gap_platform.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.MentorAssignment;

@Repository
public interface MentorAssignmentRepository extends JpaRepository<MentorAssignment, Long> {
    Optional<MentorAssignment> findFirstByEmployeeIdOrderByAssignedAtDesc(Long employeeId);
    List<MentorAssignment> findByMentorId(Long mentorId);
}
