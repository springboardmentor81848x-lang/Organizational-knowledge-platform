package com.knowledgegap.repository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.MentorAllocation;
import com.knowledgegap.entity.Skill;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MentorAllocationRepository
        extends JpaRepository<MentorAllocation, Long> {

    List<MentorAllocation> findByEmployee(
            Employee employee
    );

    List<MentorAllocation> findByEmployeeAndStatus(
            Employee employee,
            String status
    );

    List<MentorAllocation> findByMentor(
            Employee mentor
    );

    Optional<MentorAllocation>
    findByEmployeeAndMentorAndSkillAndStatus(
            Employee employee,
            Employee mentor,
            Skill skill,
            String status
    );
}