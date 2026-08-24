package com.knowledgeiq.service;

import com.knowledgeiq.dto.*;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class KnowledgeSessionService {

    @Autowired
    private KnowledgeSessionRepository sessionRepository;

    @Autowired
    private KnowledgeSessionRegistrationRepository registrationRepository;

    @Autowired
    private KnowledgeSessionFeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private NotificationService notificationService;

    public List<SkillDto> getEligibleHostSkills(UUID mentorId) {
        List<EmployeeSkill> skills = employeeSkillRepository.findByUserId(mentorId);
        return skills.stream()
                .filter(es -> es.getProficiencyLevel() >= 4)
                .map(es -> new SkillDto(
                        es.getSkill().getId(),
                        es.getSkill().getName(),
                        es.getSkill().getCategory() != null ? es.getSkill().getCategory().getName() : "General",
                        es.getProficiencyLevel()
                ))
                .collect(Collectors.toList());
    }

    public List<KnowledgeSessionDto> getAllSessions(UUID currentUserId) {
        List<KnowledgeSession> sessions = sessionRepository.findAllByOrderByScheduledAtDesc();
        return sessions.stream()
                .map(s -> mapToDto(s, currentUserId))
                .collect(Collectors.toList());
    }

    public KnowledgeSessionDto getSessionById(UUID sessionId, UUID currentUserId) {
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Knowledge Session not found: " + sessionId));
        return mapToDto(session, currentUserId);
    }

    @Transactional
    public KnowledgeSessionDto createSession(UUID mentorId, String title, String description, UUID skillId, ZonedDateTime scheduledAt, Integer durationMinutes, Integer capacity, String meetingLink) {
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Host / Mentor not found: " + mentorId));

        Skill skill = skillId != null ? skillRepository.findById(skillId).orElse(null) : null;

        // Host Eligibility Engine Validation: Must hold >= 90% proficiency (Level 4+ or Level 5)
        if (skill != null) {
            Optional<EmployeeSkill> empSkill = employeeSkillRepository.findByUserIdAndSkillId(mentorId, skill.getId());
            if (empSkill.isEmpty() || empSkill.get().getProficiencyLevel() < 4) {
                int currentLvl = empSkill.isPresent() ? empSkill.get().getProficiencyLevel() : 0;
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Ineligible Host: Hosting knowledge sessions requires >= 90% proficiency (Level 4+ or Level 5 Expert Mastery) in " + skill.getName() + ". Your evaluated level is Level " + currentLvl + "/5."
                );
            }
        }

        if (scheduledAt == null) {
            scheduledAt = ZonedDateTime.now().plusDays(1);
        }

        KnowledgeSession session = new KnowledgeSession(title, description, mentor, skill, scheduledAt, durationMinutes, capacity, meetingLink);
        session = sessionRepository.save(session);

        // Auto-register mentor as attendee/host
        KnowledgeSessionRegistration reg = new KnowledgeSessionRegistration(session, mentor);
        reg.setAttendanceStatus("ATTENDED");
        registrationRepository.save(reg);

        return mapToDto(session, mentorId);
    }

    @Transactional
    public KnowledgeSessionDto registerForSession(UUID sessionId, UUID userId) {
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Knowledge Session not found: " + sessionId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Optional<KnowledgeSessionRegistration> existing = registrationRepository.findBySessionIdAndUserId(sessionId, userId);
        if (existing.isPresent()) {
            throw new IllegalStateException("You are already registered for this session.");
        }

        long registeredCount = registrationRepository.countBySessionIdAndAttendanceStatusNot(sessionId, "CANCELLED");
        if (registeredCount >= session.getCapacity()) {
            throw new IllegalStateException("Session is full. Maximum capacity of " + session.getCapacity() + " reached.");
        }

        KnowledgeSessionRegistration reg = new KnowledgeSessionRegistration(session, user);
        registrationRepository.save(reg);

        // Notify user
        notificationService.notifySessionRegistered(user, session.getTitle(), sessionId);

        return mapToDto(session, userId);
    }

    @Transactional
    public KnowledgeSessionDto submitFeedback(UUID sessionId, UUID userId, KnowledgeSessionFeedbackDto req) {
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Knowledge Session not found: " + sessionId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Optional<KnowledgeSessionRegistration> reg = registrationRepository.findBySessionIdAndUserId(sessionId, userId);
        if (reg.isEmpty()) {
            throw new SecurityException("Only registered attendees can submit session feedback.");
        }

        Optional<KnowledgeSessionFeedback> existingFb = feedbackRepository.findBySessionIdAndUserId(sessionId, userId);
        KnowledgeSessionFeedback fb;
        if (existingFb.isPresent()) {
            fb = existingFb.get();
            fb.setRating(req.getRating());
            fb.setComment(req.getComment());
        } else {
            fb = new KnowledgeSessionFeedback(session, user, req.getRating(), req.getComment());
        }
        feedbackRepository.save(fb);

        return mapToDto(session, userId);
    }

    @Transactional
    public KnowledgeSessionDto updateAttendance(UUID sessionId, UUID userId, String status) {
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Knowledge Session not found: " + sessionId));

        KnowledgeSessionRegistration reg = registrationRepository.findBySessionIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new RuntimeException("Registration not found for user: " + userId));

        reg.setAttendanceStatus(status);
        registrationRepository.save(reg);

        return mapToDto(session, userId);
    }

    @Transactional
    public KnowledgeSessionDto cancelRegistration(UUID sessionId, UUID userId) {
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Knowledge Session not found: " + sessionId));

        Optional<KnowledgeSessionRegistration> reg = registrationRepository.findBySessionIdAndUserId(sessionId, userId);
        reg.ifPresent(registrationRepository::delete);

        return mapToDto(session, userId);
    }

    @Transactional
    public void cancelSession(UUID sessionId, UUID mentorId) {
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Knowledge Session not found: " + sessionId));

        if (!session.getMentor().getId().equals(mentorId)) {
            throw new SecurityException("Only the host mentor can cancel this session.");
        }

        session.setStatus("CANCELLED");
        sessionRepository.save(session);
    }

    @Transactional
    public KnowledgeSessionDto editSession(UUID sessionId, UUID mentorId, Map<String, Object> body) {
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Knowledge Session not found: " + sessionId));

        if (!session.getMentor().getId().equals(mentorId)) {
            throw new SecurityException("Only the host mentor can edit this session.");
        }

        if (body.containsKey("title")) session.setTitle((String) body.get("title"));
        if (body.containsKey("description")) session.setDescription((String) body.get("description"));
        if (body.containsKey("capacity")) session.setCapacity(Integer.parseInt(body.get("capacity").toString()));
        if (body.containsKey("durationMinutes")) session.setDurationMinutes(Integer.parseInt(body.get("durationMinutes").toString()));
        if (body.containsKey("meetingLink")) session.setMeetingLink((String) body.get("meetingLink"));

        return mapToDto(sessionRepository.save(session), mentorId);
    }

    private KnowledgeSessionDto mapToDto(KnowledgeSession session, UUID currentUserId) {
        KnowledgeSessionDto dto = new KnowledgeSessionDto();
        dto.setId(session.getId());
        dto.setTitle(session.getTitle());
        dto.setDescription(session.getDescription());

        dto.setMentorId(session.getMentor().getId());
        dto.setMentorName(session.getMentor().getFullName());
        dto.setMentorAvatar(session.getMentor().getAvatarUrl());
        dto.setMentorRole(session.getMentor().getRoleTitle());

        if (session.getSkill() != null) {
            dto.setSkillId(session.getSkill().getId());
            dto.setSkillName(session.getSkill().getName());
        }

        dto.setScheduledAt(session.getScheduledAt());
        dto.setDurationMinutes(session.getDurationMinutes());
        dto.setCapacity(session.getCapacity());

        long regCount = registrationRepository.countBySessionIdAndAttendanceStatusNot(session.getId(), "CANCELLED");
        dto.setRegisteredCount(regCount);

        dto.setMeetingLink(session.getMeetingLink());
        dto.setStatus(session.getStatus());

        if (currentUserId != null) {
            Optional<KnowledgeSessionRegistration> myReg = registrationRepository.findBySessionIdAndUserId(session.getId(), currentUserId);
            if (myReg.isPresent()) {
                dto.setIsRegistered(true);
                dto.setUserAttendanceStatus(myReg.get().getAttendanceStatus());
            } else {
                dto.setIsRegistered(false);
                dto.setUserAttendanceStatus("NONE");
            }
        }

        List<KnowledgeSessionFeedback> feedbacks = feedbackRepository.findBySessionId(session.getId());
        dto.setFeedbackCount(feedbacks.size());
        if (!feedbacks.isEmpty()) {
            double avg = feedbacks.stream().mapToInt(KnowledgeSessionFeedback::getRating).average().orElse(0.0);
            dto.setAverageRating(Math.round(avg * 10.0) / 10.0);
        } else {
            dto.setAverageRating(4.9); // Default baseline for new sessions
        }

        return dto;
    }
}
