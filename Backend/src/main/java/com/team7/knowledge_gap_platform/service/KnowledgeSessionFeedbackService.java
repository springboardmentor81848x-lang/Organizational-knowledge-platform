package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.KnowledgeSessionFeedback;
import com.team7.knowledge_gap_platform.repository.KnowledgeSessionFeedbackRepository;

@Service
public class KnowledgeSessionFeedbackService {

    private final KnowledgeSessionFeedbackRepository repository;

    public KnowledgeSessionFeedbackService(
            KnowledgeSessionFeedbackRepository repository) {
        this.repository = repository;
    }

    public KnowledgeSessionFeedback addFeedback(
            KnowledgeSessionFeedback feedback) {

        if (feedback.getRating() == null
                || feedback.getRating() < 1
                || feedback.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        feedback.setCreatedAt(LocalDateTime.now());

        return repository.save(feedback);
    }

    public List<KnowledgeSessionFeedback> getBySession(Long sessionId) {
        return repository.findBySessionId(sessionId);
    }

    public List<KnowledgeSessionFeedback> getByEmployee(Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }

    public double getAverageRating(Long sessionId) {

        List<KnowledgeSessionFeedback> feedbacks =
                repository.findBySessionId(sessionId);

        if (feedbacks.isEmpty()) {
            return 0.0;
        }

        return feedbacks.stream()
                .mapToInt(KnowledgeSessionFeedback::getRating)
                .average()
                .orElse(0.0);
    }
}