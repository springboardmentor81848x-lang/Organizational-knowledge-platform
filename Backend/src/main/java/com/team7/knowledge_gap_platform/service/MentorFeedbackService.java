package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.MentorFeedback;
import com.team7.knowledge_gap_platform.repository.MentorFeedbackRepository;

@Service
public class MentorFeedbackService {

    private final MentorFeedbackRepository repository;

    public MentorFeedbackService(
            MentorFeedbackRepository repository) {
        this.repository = repository;
    }

    public MentorFeedback addFeedback(
            MentorFeedback feedback) {

        if (feedback.getRating() == null
                || feedback.getRating() < 1
                || feedback.getRating() > 5) {
            throw new RuntimeException(
                    "Rating must be between 1 and 5");
        }

        feedback.setCreatedAt(LocalDateTime.now());

        return repository.save(feedback);
    }

    public List<MentorFeedback> getByMentor(Long mentorId) {
        return repository.findByMentorId(mentorId);
    }

    public List<MentorFeedback> getByMentee(Long menteeId) {
        return repository.findByMenteeId(menteeId);
    }

    public List<MentorFeedback> getBySession(Long sessionId) {
        return repository.findByMentorshipSessionId(sessionId);
    }

    public double getAverageRating(Long mentorId) {

        List<MentorFeedback> feedbacks =
                repository.findByMentorId(mentorId);

        if (feedbacks.isEmpty()) {
            return 0.0;
        }

        return feedbacks.stream()
                .mapToInt(MentorFeedback::getRating)
                .average()
                .orElse(0.0);
    }
}