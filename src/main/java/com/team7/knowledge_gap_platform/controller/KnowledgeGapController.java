package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.service.KnowledgeGapService;

@RestController
@RequestMapping("/knowledge-gaps")
public class KnowledgeGapController {

    private final KnowledgeGapService knowledgeGapService;

    public KnowledgeGapController(KnowledgeGapService knowledgeGapService) {
        this.knowledgeGapService = knowledgeGapService;
    }

    @GetMapping
    public List<String> analyzeKnowledgeGaps() {
        return knowledgeGapService.analyzeKnowledgeGap();
    }
}
