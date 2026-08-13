package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.CompetencyRequirement;

@Repository
public interface CompetencyRequirementRepository
        extends JpaRepository<CompetencyRequirement, Long> {
    List<CompetencyRequirement> findByJobRoleId(Long jobRoleId);
}
