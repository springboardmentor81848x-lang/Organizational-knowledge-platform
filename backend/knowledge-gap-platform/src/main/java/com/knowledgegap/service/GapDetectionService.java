package com.knowledgegap.service;

import com.knowledgegap.dto.KnowledgeGapResponse;
import com.knowledgegap.entity.KnowledgeGap;
import java.util.List;

public interface GapDetectionService {
    List<KnowledgeGapResponse> detectKnowledgeGap(Long employeeId);
    List<KnowledgeGap> getStoredGapsForEmployee(Long employeeId);
}
