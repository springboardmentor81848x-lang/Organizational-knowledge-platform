package com.okip.service.ai;

import com.okip.dto.ai.AiRecommendationResponseDTO;

public interface AiRecommendationService {

    AiRecommendationResponseDTO generateRecommendation(
            Long employeeId);

    String generateRoleLearningPath(
            String desiredRole);
}