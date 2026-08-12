package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.AIRecommendation;

@Repository
public interface AIRecommendationRepository
        extends JpaRepository<AIRecommendation, Long> {

    List<AIRecommendation> findByEmployeeId(Long employeeId);

    List<AIRecommendation> findBySkillId(Long skillId);

    void deleteByEmployeeId(Long employeeId);
}