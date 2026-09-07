package com.okip.service.session.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.session.KnowledgeSessionRequestDTO;
import com.okip.dto.session.KnowledgeSessionResponseDTO;
import com.okip.dto.session.SessionFeedbackDTO;
import com.okip.dto.session.SessionRegistrationDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.KnowledgeSession;
import com.okip.entity.transaction.SessionRegistration;
import com.okip.enums.AttendanceStatus;
import com.okip.enums.NotificationType;
import com.okip.enums.SessionStatus;
import com.okip.exception.BadRequestException;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.KnowledgeSessionRepository;
import com.okip.repository.SessionRegistrationRepository;
import com.okip.repository.SkillRepository;
import com.okip.service.notification.NotificationService;
import com.okip.service.session.KnowledgeSessionService;

@Service
public class KnowledgeSessionServiceImpl implements KnowledgeSessionService {

    private final KnowledgeSessionRepository sessionRepository;
    private final SessionRegistrationRepository registrationRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final NotificationService notificationService;

    public KnowledgeSessionServiceImpl(
            KnowledgeSessionRepository sessionRepository,
            SessionRegistrationRepository registrationRepository,
            EmployeeRepository employeeRepository,
            SkillRepository skillRepository,
            NotificationService notificationService) {
        this.sessionRepository = sessionRepository;
        this.registrationRepository = registrationRepository;
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public KnowledgeSessionResponseDTO createSession(KnowledgeSessionRequestDTO request) {
        Employee speaker = getLoggedInEmployee();
        Skill skill = null;
        if (request.getSkillId() != null) {
            skill = skillRepository.findById(request.getSkillId()).orElse(null);
        }

        KnowledgeSession session = new KnowledgeSession();
        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setSkill(skill);
        session.setSpeaker(speaker);
        session.setSessionDate(request.getSessionDate());
        session.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 60);
        session.setMeetingLink(request.getMeetingLink() != null ? request.getMeetingLink() : "https://meet.google.com/okip-session");
        session.setLocation(request.getLocation() != null ? request.getLocation() : "Virtual Meeting");
        session.setMaxParticipants(request.getMaxParticipants() != null ? request.getMaxParticipants() : 50);
        session.setStatus(SessionStatus.UPCOMING);

        KnowledgeSession saved = sessionRepository.save(session);
        return convertToDTO(saved, speaker);
    }

    @Override
    public List<KnowledgeSessionResponseDTO> getAllUpcomingSessions() {
        Employee employee = getLoggedInEmployee();
        return sessionRepository.findAllByOrderBySessionDateDesc()
                .stream()
                .filter(s -> s.getStatus() == SessionStatus.UPCOMING)
                .map(s -> convertToDTO(s, employee))
                .collect(Collectors.toList());
    }

    @Override
    public List<KnowledgeSessionResponseDTO> getAllSessions() {
        Employee employee = getLoggedInEmployee();
        return sessionRepository.findAllByOrderBySessionDateDesc()
                .stream()
                .map(s -> convertToDTO(s, employee))
                .collect(Collectors.toList());
    }

    @Override
    public KnowledgeSessionResponseDTO getSessionById(Long sessionId) {
        Employee employee = getLoggedInEmployee();
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge session not found."));
        return convertToDTO(session, employee);
    }

    @Override
    @Transactional
    public SessionRegistrationDTO registerForSession(Long sessionId) {
        Employee employee = getLoggedInEmployee();
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge session not found."));

        if (registrationRepository.existsBySessionAndEmployee(session, employee)) {
            throw new ResourceAlreadyExistsException("You are already registered for this session.");
        }

        long count = registrationRepository.countBySession(session);
        if (count >= session.getMaxParticipants()) {
            throw new BadRequestException("Session is fully booked.");
        }

        SessionRegistration registration = new SessionRegistration();
        registration.setSession(session);
        registration.setEmployee(employee);
        registration.setAttendanceStatus(AttendanceStatus.REGISTERED);
        registration.setRegisteredAt(LocalDateTime.now());

        SessionRegistration saved = registrationRepository.save(registration);

        notificationService.createNotification(
                employee,
                "Registered for Session",
                "You have successfully registered for \"" + session.getTitle() + "\" scheduled for " + session.getSessionDate().toString().replace('T', ' '),
                NotificationType.SESSION,
                session.getSessionId()
        );

        return convertRegistrationDTO(saved);
    }

    @Override
    @Transactional
    public void cancelRegistration(Long sessionId) {
        Employee employee = getLoggedInEmployee();
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge session not found."));

        SessionRegistration registration = registrationRepository.findBySessionAndEmployee(session, employee)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found for this session."));

        registrationRepository.delete(registration);
    }

    @Override
    public List<SessionRegistrationDTO> getMyRegisteredSessions() {
        Employee employee = getLoggedInEmployee();
        return registrationRepository.findByEmployeeOrderByRegisteredAtDesc(employee)
                .stream()
                .map(this::convertRegistrationDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SessionRegistrationDTO submitFeedback(Long sessionId, SessionFeedbackDTO feedback) {
        Employee employee = getLoggedInEmployee();
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge session not found."));

        SessionRegistration registration = registrationRepository.findBySessionAndEmployee(session, employee)
                .orElseThrow(() -> new ResourceNotFoundException("You must be registered for the session to provide feedback."));

        registration.setRating(feedback.getRating());
        registration.setFeedback(feedback.getFeedback());
        registration.setAttendanceStatus(AttendanceStatus.ATTENDED);

        SessionRegistration saved = registrationRepository.save(registration);
        return convertRegistrationDTO(saved);
    }

    @Override
    public List<SessionRegistrationDTO> getSessionRegistrations(Long sessionId) {
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge session not found."));
        return registrationRepository.findBySession(session)
                .stream()
                .map(this::convertRegistrationDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SessionRegistrationDTO updateAttendance(Long sessionId, Long registrationId, String status) {
        Employee loggedIn = getLoggedInEmployee();
        KnowledgeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge session not found."));

        SessionRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Session registration not found."));

        AttendanceStatus targetStatus;
        try {
            targetStatus = AttendanceStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            targetStatus = AttendanceStatus.ATTENDED;
        }

        registration.setAttendanceStatus(targetStatus);
        SessionRegistration updated = registrationRepository.save(registration);
        return convertRegistrationDTO(updated);
    }

    private Employee getLoggedInEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return employeeRepository.findByOfficialEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found."));
    }

    private KnowledgeSessionResponseDTO convertToDTO(KnowledgeSession s, Employee currentEmployee) {
        KnowledgeSessionResponseDTO dto = new KnowledgeSessionResponseDTO();
        dto.setSessionId(s.getSessionId());
        dto.setTitle(s.getTitle());
        dto.setDescription(s.getDescription());

        if (s.getSkill() != null) {
            dto.setSkillId(s.getSkill().getSkillId());
            dto.setSkillName(s.getSkill().getSkillName());
        }

        dto.setSpeakerId(s.getSpeaker().getEmployeeId());
        dto.setSpeakerName(s.getSpeaker().getFirstName() + " " + s.getSpeaker().getLastName());
        dto.setSpeakerDepartment(s.getSpeaker().getDepartment() != null ? s.getSpeaker().getDepartment().getDepartmentName() : "N/A");
        dto.setSessionDate(s.getSessionDate());
        dto.setDurationMinutes(s.getDurationMinutes());
        dto.setMeetingLink(s.getMeetingLink());
        dto.setLocation(s.getLocation());
        dto.setMaxParticipants(s.getMaxParticipants());
        dto.setStatus(s.getStatus().name());
        dto.setCreatedAt(s.getCreatedAt());

        List<SessionRegistration> regs = registrationRepository.findBySession(s);
        dto.setRegisteredCount(regs.size());
        dto.setUserRegistered(regs.stream().anyMatch(r -> r.getEmployee().getEmployeeId().equals(currentEmployee.getEmployeeId())));

        double avg = regs.stream()
                .filter(r -> r.getRating() != null && r.getRating() > 0)
                .mapToInt(SessionRegistration::getRating)
                .average()
                .orElse(0.0);
        dto.setAverageRating(Math.round(avg * 10.0) / 10.0);

        return dto;
    }

    private SessionRegistrationDTO convertRegistrationDTO(SessionRegistration r) {
        SessionRegistrationDTO dto = new SessionRegistrationDTO();
        dto.setRegistrationId(r.getRegistrationId());
        dto.setSessionId(r.getSession().getSessionId());
        dto.setSessionTitle(r.getSession().getTitle());
        dto.setSessionDate(r.getSession().getSessionDate());
        dto.setEmployeeId(r.getEmployee().getEmployeeId());
        dto.setEmployeeName(r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName());
        dto.setAttendanceStatus(r.getAttendanceStatus().name());
        dto.setRating(r.getRating());
        dto.setFeedback(r.getFeedback());
        dto.setRegisteredAt(r.getRegisteredAt());
        return dto;
    }
}
