package com.okip.service.ai.employee;

import com.okip.dto.ai.AiRecommendationResponseDTO;

public interface EmployeeAiService {

    AiRecommendationResponseDTO getEmployeeRecommendations(Long employeeId);

}
