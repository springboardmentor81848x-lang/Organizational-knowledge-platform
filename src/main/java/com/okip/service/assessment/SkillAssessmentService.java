package com.okip.service.assessment;

import java.util.List;
import com.okip.dto.assessment.AssessmentReviewRequestDTO;
import com.okip.dto.assessment.SkillAssessmentRequestDTO;
import com.okip.dto.assessment.SkillAssessmentResponseDTO;

public interface SkillAssessmentService {
    SkillAssessmentResponseDTO submitAssessment(SkillAssessmentRequestDTO request);
    List<SkillAssessmentResponseDTO> getMyAssessments();
    List<SkillAssessmentResponseDTO> getPendingReviews();
    List<SkillAssessmentResponseDTO> getEmployeeAssessments(Long employeeId);
    SkillAssessmentResponseDTO reviewAssessment(Long assessmentId, AssessmentReviewRequestDTO reviewRequest);
    SkillAssessmentResponseDTO getAssessmentById(Long assessmentId);
}
