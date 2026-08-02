package com.knowledgegap.controller;

import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.service.KnowledgeGapService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/knowledge-gaps")
@CrossOrigin(origins = "*")
public class KnowledgeGapController {

    private final KnowledgeGapService knowledgeGapService;

    public KnowledgeGapController(KnowledgeGapService knowledgeGapService) {
        this.knowledgeGapService = knowledgeGapService;
    }

    // Create Knowledge Gap
    @PostMapping
    public KnowledgeGap saveKnowledgeGap(@RequestBody KnowledgeGap knowledgeGap) {
        return knowledgeGapService.saveKnowledgeGap(knowledgeGap);
    }

    // Get All Knowledge Gaps
    @GetMapping
    public List<KnowledgeGap> getAllKnowledgeGaps() {
        return knowledgeGapService.getAllKnowledgeGaps();
    }

    // Get Knowledge Gap by ID
    @GetMapping("/{id}")
    public Optional<KnowledgeGap> getKnowledgeGapById(@PathVariable Long id) {
        return knowledgeGapService.getKnowledgeGapById(id);
    }

    // Delete Knowledge Gap
    @DeleteMapping("/{id}")
    public String deleteKnowledgeGap(@PathVariable Long id) {
        knowledgeGapService.deleteKnowledgeGap(id);
        return "Knowledge Gap deleted successfully!";
    }
}