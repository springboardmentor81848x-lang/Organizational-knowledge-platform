package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.SkillGap;

@Repository
public interface SkillGapRepository extends JpaRepository<SkillGap, Long> {

    List<SkillGap> findByEmployeeId(Long employeeId);

    List<SkillGap> findByGapLevel(String gapLevel);

    void deleteByEmployeeId(Long employeeId);
}