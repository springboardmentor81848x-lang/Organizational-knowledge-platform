package com.okip.service.assessment;
import com.okip.dto.assessment.*; import java.util.*;
public interface SelfAssessmentService { List<SelfAssessmentDTO> getMyAssessments(); SelfAssessmentDTO getAssessment(Long assessmentId); AssessmentResultDTO start(Long assessmentId); AssessmentResultDTO submit(Long attemptId, AssessmentSubmitRequestDTO request); }
