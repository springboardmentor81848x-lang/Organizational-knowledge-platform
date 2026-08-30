package com.okip.service.resource;

import java.util.List;
import com.okip.dto.resource.KnowledgeResourceDTO;

public interface KnowledgeResourceService {
    KnowledgeResourceDTO createResource(KnowledgeResourceDTO request);
    List<KnowledgeResourceDTO> getAllResources(Long skillId, String resourceType, String search);
    KnowledgeResourceDTO getResourceById(Long resourceId);
    void deleteResource(Long resourceId);
}
