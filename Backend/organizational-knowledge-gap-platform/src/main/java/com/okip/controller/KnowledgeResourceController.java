package com.okip.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.resource.KnowledgeResourceDTO;
import com.okip.service.resource.KnowledgeResourceService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/knowledge-resources")
@Validated
@PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR','ADMIN')")
public class KnowledgeResourceController {

    private final KnowledgeResourceService resourceService;

    public KnowledgeResourceController(KnowledgeResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    public ResponseEntity<KnowledgeResourceDTO> createResource(@Valid @RequestBody KnowledgeResourceDTO request) {
        return new ResponseEntity<>(resourceService.createResource(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<KnowledgeResourceDTO>> getAllResources(
            @RequestParam(required = false) Long skillId,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(resourceService.getAllResources(skillId, resourceType, search));
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<KnowledgeResourceDTO> getResourceById(@PathVariable Long resourceId) {
        return ResponseEntity.ok(resourceService.getResourceById(resourceId));
    }

    @DeleteMapping("/{resourceId}")
    @PreAuthorize("hasAnyRole('MANAGER','HR','ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long resourceId) {
        resourceService.deleteResource(resourceId);
        return ResponseEntity.noContent().build();
    }
}
