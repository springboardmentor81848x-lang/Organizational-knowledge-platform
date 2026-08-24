package com.okip.service.ai.employee.impl;

import org.springframework.stereotype.Service;

import com.okip.dto.ai.AiRecommendationResponseDTO;
import com.okip.service.ai.AiRecommendationService;
import com.okip.service.ai.employee.EmployeeAiService;

@Service
public class EmployeeAiServiceImpl implements EmployeeAiService {

    private final AiRecommendationService aiRecommendationService;

    public EmployeeAiServiceImpl(
            AiRecommendationService aiRecommendationService) {

        this.aiRecommendationService = aiRecommendationService;
    }

    @Override
    public AiRecommendationResponseDTO getEmployeeRecommendations(
            Long employeeId) {

        return aiRecommendationService
                .generateRecommendation(employeeId);
    }
}
