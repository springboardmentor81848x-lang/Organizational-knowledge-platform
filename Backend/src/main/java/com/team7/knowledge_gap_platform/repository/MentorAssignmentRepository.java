package com.team7.knowledge_gap_platform.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.MentorAssignment;

@Repository
public interface MentorAssignmentRepository
        extends JpaRepository<MentorAssignment, Long> {

    // Current active mentor of one employee
    Optional<MentorAssignment>
    findByEmployeeIdAndStatus(
            Long employeeId,
            String status);

    // All employees currently assigned to a mentor
    List<MentorAssignment>
    findByMentorIdAndStatus(
            Long mentorId,
            String status);

    // Useful for assignment history
    List<MentorAssignment>
    findByEmployeeId(
            Long employeeId);

    // Check whether an active assignment already exists
    boolean existsByEmployeeIdAndStatus(
            Long employeeId,
            String status);
}