package com.team7.knowledge_gap_platform.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.EmployeeSkill;

@Repository
public interface EmployeeSkillRepository
        extends JpaRepository<EmployeeSkill, Long> {

    List<EmployeeSkill> findByEmployeeId(Long employeeId);

    Optional<EmployeeSkill> findByEmployeeIdAndSkillId(Long employeeId, Long skillId);
}