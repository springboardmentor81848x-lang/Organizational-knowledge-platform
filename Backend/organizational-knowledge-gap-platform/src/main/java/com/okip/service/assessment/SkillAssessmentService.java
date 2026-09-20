package com.okip.service.assessment;

import java.util.List;
import com.okip.dto.assessment.AssessmentReviewRequestDTO;
import com.okip.dto.assessment.PeerTargetDTO;
import com.okip.dto.assessment.SkillAssessmentRequestDTO;
import com.okip.dto.assessment.SkillAssessmentResponseDTO;

public interface SkillAssessmentService {
    SkillAssessmentResponseDTO submitAssessment(SkillAssessmentRequestDTO request);
    List<SkillAssessmentResponseDTO> getMyAssessments();
    List<SkillAssessmentResponseDTO> getPendingReviews();
    List<SkillAssessmentResponseDTO> getEmployeeAssessments(Long employeeId);
    SkillAssessmentResponseDTO reviewAssessment(Long assessmentId, AssessmentReviewRequestDTO reviewRequest);
    SkillAssessmentResponseDTO getAssessmentById(Long assessmentId);

    /**
     * Returns approved employees eligible as peer/manager assessment targets,
     * excluding the currently logged-in assessor.
     */
    List<PeerTargetDTO> getPeerTargets();

    /**
     * Generates a randomized 25-question quiz for the specified skill.
     */
    com.okip.dto.assessment.QuizDTO getQuizQuestions(Long skillId);
}
