package com.knowledgegap.service;

import com.knowledgegap.dto.AssessmentSubmitRequest;
import com.knowledgegap.dto.AssessmentSubmitResponse;
import com.knowledgegap.dto.EmployeeAssessmentResponse;

public interface AssessmentEvaluationService {

    EmployeeAssessmentResponse getAssessmentForEmployee(
            Long employeeId
    );

    AssessmentSubmitResponse submitAssessment(
            AssessmentSubmitRequest request
    );
}