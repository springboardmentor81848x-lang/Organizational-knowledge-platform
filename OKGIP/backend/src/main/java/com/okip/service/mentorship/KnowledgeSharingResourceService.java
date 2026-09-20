package com.okip.service.mentorship;

import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.okip.dto.mentorship.KnowledgeResourceDTO;

public interface KnowledgeSharingResourceService {
    List<KnowledgeResourceDTO> getResources(Long sessionId);
    KnowledgeResourceDTO upload(Long sessionId, MultipartFile file, String title, String description);
    ResponseEntity<ByteArrayResource> download(Long resourceId);
    void delete(Long resourceId);
}
