package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.AIRecommendation;
import com.team7.knowledge_gap_platform.repository.AIRecommendationRepository;

@Service
public class AIRecommendationService {

    private final AIRecommendationRepository aiRecommendationRepository;

    public AIRecommendationService(
            AIRecommendationRepository aiRecommendationRepository) {

        this.aiRecommendationRepository = aiRecommendationRepository;
    }

    public AIRecommendation saveRecommendation(
            Long employeeId,
            Long skillId,
            String gapLevel,
            String recommendation,
            String modelName) {

        AIRecommendation aiRecommendation = new AIRecommendation();

        aiRecommendation.setEmployeeId(employeeId);
        aiRecommendation.setSkillId(skillId);
        aiRecommendation.setGapLevel(gapLevel);
        aiRecommendation.setRecommendation(recommendation);
        aiRecommendation.setModelName(modelName);
        aiRecommendation.setGeneratedAt(LocalDateTime.now());

        return aiRecommendationRepository.save(aiRecommendation);
    }

    public List<AIRecommendation> getAllRecommendations() {
        return aiRecommendationRepository.findAll();
    }

    public List<AIRecommendation> getRecommendationsByEmployee(
            Long employeeId) {

        return aiRecommendationRepository.findByEmployeeId(employeeId);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteByEmployeeId(Long employeeId) {
        aiRecommendationRepository.deleteByEmployeeId(employeeId);
    }
}