package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.MentorshipSession;
import com.team7.knowledge_gap_platform.repository.MentorshipSessionRepository;

@Service
public class MentorshipSessionService {

    private final MentorshipSessionRepository repository;

    public MentorshipSessionService(
            MentorshipSessionRepository repository) {
        this.repository = repository;
    }

    public MentorshipSession scheduleSession(
            MentorshipSession session) {

        session.setStatus("SCHEDULED");
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());

        return repository.save(session);
    }

    public MentorshipSession rescheduleSession(
            Long sessionId,
            LocalDateTime newDateTime) {

        MentorshipSession session = getSession(sessionId);

        session.setScheduledAt(newDateTime);
        session.setStatus("SCHEDULED");
        session.setUpdatedAt(LocalDateTime.now());

        return repository.save(session);
    }

    public MentorshipSession cancelSession(Long sessionId) {

        MentorshipSession session = getSession(sessionId);

        session.setStatus("CANCELLED");
        session.setUpdatedAt(LocalDateTime.now());

        return repository.save(session);
    }

    public MentorshipSession completeSession(Long sessionId) {

        MentorshipSession session = getSession(sessionId);

        session.setStatus("COMPLETED");
        session.setUpdatedAt(LocalDateTime.now());

        return repository.save(session);
    }

    public MentorshipSession getSession(Long sessionId) {

        return repository.findById(sessionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Mentorship session not found"));
    }

    public List<MentorshipSession> getByMentor(
            Long mentorId) {

        return repository.findByMentorId(mentorId);
    }

    public List<MentorshipSession> getByMentee(
            Long menteeId) {

        return repository.findByMenteeId(menteeId);
    }

    public List<MentorshipSession> getByRequest(
            Long mentorshipRequestId) {

        return repository.findByMentorshipRequestId(
                mentorshipRequestId);
    }
}