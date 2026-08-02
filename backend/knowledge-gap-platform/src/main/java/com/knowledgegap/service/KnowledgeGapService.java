package com.knowledgegap.service;

import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.repository.KnowledgeGapRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KnowledgeGapService {

    private final KnowledgeGapRepository knowledgeGapRepository;

    public KnowledgeGapService(KnowledgeGapRepository knowledgeGapRepository) {
        this.knowledgeGapRepository = knowledgeGapRepository;
    }

    // Save a KnowledgeGap
    public KnowledgeGap saveKnowledgeGap(KnowledgeGap knowledgeGap) {
        return knowledgeGapRepository.save(knowledgeGap);
    }

    // Get all KnowledgeGaps
    public List<KnowledgeGap> getAllKnowledgeGaps() {
        return knowledgeGapRepository.findAll();
    }

    // Get KnowledgeGap by ID
    public Optional<KnowledgeGap> getKnowledgeGapById(Long id) {
        return knowledgeGapRepository.findById(id);
    }

    // Delete KnowledgeGap by ID
    public void deleteKnowledgeGap(Long id) {
        knowledgeGapRepository.deleteById(id);
    }
}