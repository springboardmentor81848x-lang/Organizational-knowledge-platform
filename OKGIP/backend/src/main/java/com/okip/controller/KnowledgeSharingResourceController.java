package com.okip.controller;

import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.okip.dto.mentorship.KnowledgeResourceDTO;
import com.okip.service.mentorship.KnowledgeSharingResourceService;

@RestController
@RequestMapping("/api/mentorship/sessions")
public class KnowledgeSharingResourceController {

    private final KnowledgeSharingResourceService resourceService;

    public KnowledgeSharingResourceController(KnowledgeSharingResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/{sessionId}/resources")
    public ResponseEntity<List<KnowledgeResourceDTO>> getResources(@PathVariable Long sessionId) {
        return ResponseEntity.ok(resourceService.getResources(sessionId));
    }

    @PostMapping(value = "/{sessionId}/resources", consumes = "multipart/form-data")
    public ResponseEntity<KnowledgeResourceDTO> upload(
            @PathVariable Long sessionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description) {
        return ResponseEntity.ok(resourceService.upload(sessionId, file, title, description));
    }

    @GetMapping("/resources/{resourceId}/download")
    public ResponseEntity<ByteArrayResource> download(@PathVariable Long resourceId) {
        return resourceService.download(resourceId);
    }

    @DeleteMapping("/resources/{resourceId}")
    public ResponseEntity<Void> delete(@PathVariable Long resourceId) {
        resourceService.delete(resourceId);
        return ResponseEntity.noContent().build();
    }
}
