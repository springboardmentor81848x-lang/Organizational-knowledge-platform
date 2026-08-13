package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.team7.knowledge_gap_platform.entity.LearningPath;

@Repository
public interface LearningPathRepository
        extends JpaRepository<LearningPath, Long> {

    List<LearningPath> findByEmployeeIdOrderBySequenceOrderAsc(
            Long employeeId);

    List<LearningPath> findByEmployeeIdAndSkillIdOrderBySequenceOrderAsc(
            Long employeeId,
            Long skillId);

    @Transactional
    void deleteByEmployeeId(Long employeeId);
}