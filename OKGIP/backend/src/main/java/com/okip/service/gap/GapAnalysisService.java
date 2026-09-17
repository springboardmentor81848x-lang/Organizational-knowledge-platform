package com.okip.service.gap;

import com.okip.dto.gap.GapAnalysisResponseDTO;

public interface GapAnalysisService {

    GapAnalysisResponseDTO runGapAnalysis(Long employeeId);

    GapAnalysisResponseDTO getEmployeeGapAnalysis(Long employeeId);

    GapAnalysisResponseDTO getMyGapAnalysis();

    GapAnalysisResponseDTO runMyGapAnalysis();
}