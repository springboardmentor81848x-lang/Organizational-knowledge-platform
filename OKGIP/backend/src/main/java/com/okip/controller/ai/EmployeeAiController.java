package com.okip.controller.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.okip.dto.ai.AiRecommendationResponseDTO;
import com.okip.service.ai.employee.EmployeeAiService;

@RestController
@RequestMapping("/api/ai/employee")
public class EmployeeAiController {

    private final EmployeeAiService employeeAiService;

    public EmployeeAiController(
            EmployeeAiService employeeAiService) {

        this.employeeAiService = employeeAiService;
    }

    @GetMapping("/recommendations/{employeeId}")
    public ResponseEntity<AiRecommendationResponseDTO>
            getEmployeeRecommendations(
                    @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                employeeAiService
                        .getEmployeeRecommendations(employeeId)
        );
    }
}
