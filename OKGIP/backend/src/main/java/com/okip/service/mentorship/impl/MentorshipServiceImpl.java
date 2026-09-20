package com.okip.service.mentorship.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.mentorship.CreateFeedbackDTO;
import com.okip.dto.mentorship.CreateKnowledgeSessionDTO;
import com.okip.dto.mentorship.CreateMentorshipRequestDTO;
import com.okip.dto.mentorship.KnowledgeSessionDTO;
import com.okip.dto.mentorship.MentorRecommendationDTO;
import com.okip.dto.mentorship.MentorshipRequestDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.entity.transaction.KnowledgeSession;
import com.okip.entity.transaction.KnowledgeSessionFeedback;
import com.okip.entity.transaction.MentorshipRequest;
import com.okip.enums.GapStatus;
import com.okip.enums.ProficiencyLevel;
import com.okip.enums.RoleType;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.repository.KnowledgeSessionFeedbackRepository;
import com.okip.repository.KnowledgeSessionRepository;
import com.okip.repository.MentorProfileRepository;
import com.okip.repository.MentorshipRequestRepository;
import com.okip.repository.SkillRepository;
import com.okip.service.mentorship.MentorshipService;
import com.okip.service.notification.NotificationService;

@Service
@Transactional
public class MentorshipServiceImpl implements MentorshipService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final MentorshipRequestRepository requestRepository;
    private final KnowledgeSessionRepository sessionRepository;
    private final KnowledgeSessionFeedbackRepository feedbackRepository;
    private final SkillRepository skillRepository;
    private final NotificationService notificationService;

    public MentorshipServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            MentorProfileRepository mentorProfileRepository,
            MentorshipRequestRepository requestRepository,
            KnowledgeSessionRepository sessionRepository,
            KnowledgeSessionFeedbackRepository feedbackRepository,
            SkillRepository skillRepository,
            NotificationService notificationService) {
        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.mentorProfileRepository = mentorProfileRepository;
        this.requestRepository = requestRepository;
        this.sessionRepository = sessionRepository;
        this.feedbackRepository = feedbackRepository;
        this.skillRepository = skillRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorRecommendationDTO> getRecommendations() {
        Employee mentee = getLoggedInEmployee();

        List<KnowledgeGap> openGaps = knowledgeGapRepository
                .findByEmployeeJobRole_Employee_EmployeeId(mentee.getEmployeeId())
                .stream()
                .filter(g -> g.getStatus() == GapStatus.OPEN)
                .sorted(Comparator.comparing(
                        (KnowledgeGap g) -> Optional.ofNullable(g.getGapPercentage()).orElse(0.0))
                        .reversed())
                .collect(Collectors.toList());

        List<EmployeeSkill> menteeSkills = employeeSkillRepository.findByEmployee(mentee);
        List<MentorRecommendationDTO> result = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        // First use persisted OPEN gaps because these represent explicit mentoring needs.
        for (KnowledgeGap gap : openGaps) {
            Skill skill = gap.getSkill();
            if (skill == null) continue;
            EmployeeSkill menteeSkill = findEmployeeSkill(menteeSkills, skill.getSkillId());
            addMentorsForSkill(result, seen, mentee, skill,
                    gap.getGapPercentage(),
                    gap.getCurrentProficiency(),
                    gap.getCurrentExperience());
        }

        // If there are no open gaps, still provide useful recommendations for skills
        // where a mentor has objectively stronger proficiency or more experience.
        if (result.isEmpty()) {
            for (EmployeeSkill menteeSkill : menteeSkills) {
                if (menteeSkill.getSkill() == null) continue;
                addMentorsForSkill(result, seen, mentee, menteeSkill.getSkill(),
                        null,
                        menteeSkill.getProficiencyLevel(),
                        menteeSkill.getYearsOfExperience());
            }
        }

        return result.stream()
                .sorted(Comparator.comparing(
                        MentorRecommendationDTO::getGapPercentage,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(20)
                .collect(Collectors.toList());
    }

    private void addMentorsForSkill(
            List<MentorRecommendationDTO> result,
            Set<String> seen,
            Employee mentee,
            Skill skill,
            Double gapPercentage,
            ProficiencyLevel menteeProficiency,
            Double menteeExperience) {

        List<EmployeeSkill> mentors = employeeSkillRepository.findAll().stream()
                .filter(es -> es.getEmployee() != null)
                .filter(es -> !es.getEmployee().getEmployeeId().equals(mentee.getEmployeeId()))
                .filter(es -> es.getSkill() != null && es.getSkill().getSkillId().equals(skill.getSkillId()))
                .filter(es -> isActiveMentor(es.getEmployee()))
                .filter(es -> isStrongerMentor(es, menteeProficiency, menteeExperience))
                .sorted(Comparator
                        .comparingInt((EmployeeSkill es) -> proficiencyRank(es.getProficiencyLevel()))
                        .reversed()
                        .thenComparing(es -> Optional.ofNullable(es.getYearsOfExperience()).orElse(0.0), Comparator.reverseOrder()))
                .collect(Collectors.toList());

        for (EmployeeSkill mentorSkill : mentors) {
            String key = mentorSkill.getEmployee().getEmployeeId() + ":" + skill.getSkillId();
            if (!seen.add(key)) continue;

            // Do not recommend an already active/pending relationship for the same skill.
            boolean alreadyConnected = requestRepository
                    .findByMenteeAndMentorAndSkillAndStatusIn(
                            mentee,
                            mentorSkill.getEmployee(),
                            skill,
                            List.of(MentorshipRequest.Status.PENDING, MentorshipRequest.Status.ACCEPTED))
                    .isPresent();
            if (alreadyConnected) continue;

            Employee mentor = mentorSkill.getEmployee();
            MentorRecommendationDTO dto = new MentorRecommendationDTO();
            dto.setEmployeeId(mentor.getEmployeeId());
            dto.setEmployeeCode(mentor.getEmployeeCode());
            dto.setName(fullName(mentor));
            dto.setDepartment(mentor.getDepartment() == null ? null : mentor.getDepartment().getDepartmentName());
            dto.setRole(mentor.getRole() == null ? null : mentor.getRole().getRoleName().name());
            dto.setSkillId(skill.getSkillId());
            dto.setSkillName(skill.getSkillName());
            dto.setProficiency(mentorSkill.getProficiencyLevel() == null ? null : mentorSkill.getProficiencyLevel().name());
            dto.setYearsOfExperience(Optional.ofNullable(mentorSkill.getYearsOfExperience()).orElse(0.0));
            dto.setGapPercentage(gapPercentage);
            result.add(dto);
        }
    }

    private boolean isActiveMentor(Employee employee) {
        return employee.getRole() != null
                && employee.getRole().getRoleName() == RoleType.ROLE_MENTOR
                && mentorProfileRepository.existsByEmployeeEmployeeIdAndActiveTrue(employee.getEmployeeId());
    }

    private boolean isStrongerMentor(EmployeeSkill mentor, ProficiencyLevel menteeProficiency, Double menteeExperience) {
        int mentorRank = proficiencyRank(mentor.getProficiencyLevel());
        int menteeRank = proficiencyRank(menteeProficiency);
        double mentorExperience = Optional.ofNullable(mentor.getYearsOfExperience()).orElse(0.0);
        double currentExperience = Optional.ofNullable(menteeExperience).orElse(0.0);
        return mentorRank > menteeRank || (mentorRank >= menteeRank && mentorExperience > currentExperience);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorshipRequestDTO> getMyRequests() {
        Employee employee = getLoggedInEmployee();
        return requestRepository
                .findByMenteeOrMentorOrderByCreatedAtDesc(employee, employee)
                .stream()
                .map(this::toRequestDto)
                .collect(Collectors.toList());
    }

    @Override
@Transactional(readOnly = true)
public List<MentorshipRequestDTO> getMyMentees() {
    Employee mentor = getLoggedInEmployee();
    requireActiveMentor(mentor);

    return requestRepository
            .findByMenteeOrMentorOrderByCreatedAtDesc(mentor, mentor)
            .stream()
            .filter(request ->
                    request.getMentor() != null
                    && request.getMentor().getEmployeeId().equals(mentor.getEmployeeId()))
            .filter(request ->
                    request.getStatus() == MentorshipRequest.Status.ACCEPTED)
            .map(this::toRequestDto)
            .collect(Collectors.toList());
}

@Override
@Transactional(readOnly = true)
public List<MentorshipRequestDTO> getMentorRequests() {
    Employee mentor = getLoggedInEmployee();
    requireActiveMentor(mentor);

    return requestRepository
            .findByMenteeOrMentorOrderByCreatedAtDesc(mentor, mentor)
            .stream()
            .filter(request ->
                    request.getMentor() != null
                    && request.getMentor().getEmployeeId()
                            .equals(mentor.getEmployeeId()))
            .map(this::toRequestDto)
            .collect(Collectors.toList());
}

    @Override
    public MentorshipRequestDTO createRequest(CreateMentorshipRequestDTO request) {
        Employee mentee = getLoggedInEmployee();
        if (request == null || request.getMentorId() == null || request.getSkillId() == null) {
            throw new IllegalArgumentException("mentorId and skillId are required.");
        }

        Employee mentor = employeeRepository.findById(request.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found."));

        if (mentor.getEmployeeId().equals(mentee.getEmployeeId())) {
            throw new IllegalArgumentException("You cannot request yourself as a mentor.");
        }

        if (!isActiveMentor(mentor)) {
            throw new IllegalArgumentException("Selected employee is not an active mentor.");
        }

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found."));

        EmployeeSkill mentorSkill = employeeSkillRepository.findByEmployeeAndSkill(mentor, skill)
                .orElseThrow(() -> new IllegalArgumentException("Selected mentor does not have the requested skill."));

        EmployeeSkill menteeSkill = employeeSkillRepository.findByEmployeeAndSkill(mentee, skill).orElse(null);
        ProficiencyLevel menteeLevel = menteeSkill == null ? ProficiencyLevel.BEGINNER : menteeSkill.getProficiencyLevel();
        Double menteeExperience = menteeSkill == null ? 0.0 : menteeSkill.getYearsOfExperience();

        if (!isStrongerMentor(mentorSkill, menteeLevel, menteeExperience)) {
            throw new IllegalArgumentException("The selected mentor must have stronger proficiency or more experience in this skill.");
        }

        requestRepository.findByMenteeAndMentorAndSkillAndStatusIn(
                mentee, mentor, skill,
                List.of(MentorshipRequest.Status.PENDING, MentorshipRequest.Status.ACCEPTED))
                .ifPresent(existing -> {
                    throw new ResourceAlreadyExistsException("An active mentorship request already exists for this mentor and skill.");
                });

        MentorshipRequest entity = new MentorshipRequest();
        entity.setMentee(mentee);
        entity.setMentor(mentor);
        entity.setSkill(skill);
        entity.setMessage(request.getMessage() == null ? null : request.getMessage().trim());
        entity.setStatus(MentorshipRequest.Status.PENDING);

        MentorshipRequestDTO dto = toRequestDto(requestRepository.save(entity));
        notificationService.notifyEmployee(
                mentor.getEmployeeId(),
                "MENTORSHIP_REQUEST",
                "New mentorship request",
                fullName(mentee) + " requested your guidance in " + skill.getSkillName() + ".",
                "/mentor/requests");
        return dto;
    }

    @Override
    public MentorshipRequestDTO acceptRequest(Long requestId) {
        MentorshipRequest request = getRequest(requestId);
        Employee employee = getLoggedInEmployee();
        requireActiveMentor(employee);
        requireMentor(request, employee);
        if (request.getStatus() != MentorshipRequest.Status.PENDING) {
            throw new IllegalArgumentException("Only pending mentorship requests can be accepted.");
        }
        request.setStatus(MentorshipRequest.Status.ACCEPTED);
        MentorshipRequest saved = requestRepository.save(request);
        notificationService.notifyEmployee(
                request.getMentee().getEmployeeId(),
                "MENTORSHIP_ACCEPTED",
                "Mentorship request accepted",
                fullName(employee) + " accepted your " + request.getSkill().getSkillName() + " mentorship request.",
                "/employee/mentorship");
        return toRequestDto(saved);
    }

    @Override
    public MentorshipRequestDTO rejectRequest(Long requestId) {
        MentorshipRequest request = getRequest(requestId);
        Employee employee = getLoggedInEmployee();
        requireActiveMentor(employee);
        requireMentor(request, employee);
        if (request.getStatus() != MentorshipRequest.Status.PENDING) {
            throw new IllegalArgumentException("Only pending mentorship requests can be rejected.");
        }
        request.setStatus(MentorshipRequest.Status.REJECTED);
        MentorshipRequest saved = requestRepository.save(request);
        notificationService.notifyEmployee(
                request.getMentee().getEmployeeId(),
                "MENTORSHIP_REJECTED",
                "Mentorship request declined",
                fullName(employee) + " declined your " + request.getSkill().getSkillName() + " mentorship request.",
                "/employee/mentorship");
        return toRequestDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<KnowledgeSessionDTO> getMySessions() {
        Employee employee = getLoggedInEmployee();
        return sessionRepository
                .findByMentorshipRequestMenteeOrMentorshipRequestMentorOrderByScheduledAtAsc(employee, employee)
                .stream()
                .map(this::toSessionDto)
                .collect(Collectors.toList());
    }

    @Override
    public KnowledgeSessionDTO createSession(Long requestId, CreateKnowledgeSessionDTO request) {
        MentorshipRequest mentorship = getRequest(requestId);
        Employee employee = getLoggedInEmployee();
        requireParticipant(mentorship, employee);
        if (mentorship.getStatus() != MentorshipRequest.Status.ACCEPTED) {
            throw new IllegalArgumentException("A knowledge session can only be scheduled for an accepted mentorship request.");
        }
        if (request == null || request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Session title is required.");
        }
        if (request.getScheduledAt() == null || !request.getScheduledAt().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Session time must be in the future.");
        }
        if (request.getDurationMinutes() == null || request.getDurationMinutes() < 15 || request.getDurationMinutes() > 240) {
            throw new IllegalArgumentException("Session duration must be between 15 and 240 minutes.");
        }

        KnowledgeSession session = new KnowledgeSession();
        session.setMentorshipRequest(mentorship);
        session.setTitle(request.getTitle().trim());
        session.setScheduledAt(request.getScheduledAt());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setNotes(request.getNotes() == null ? null : request.getNotes().trim());
        session.setStatus(KnowledgeSession.Status.SCHEDULED);

        KnowledgeSession saved = sessionRepository.save(session);
        String message = "Knowledge session '" + saved.getTitle() + "' was scheduled for "
                + saved.getScheduledAt() + ".";
        notificationService.notifyEmployee(
                mentorship.getMentor().getEmployeeId(),
                "MENTORSHIP_SESSION",
                "Knowledge session scheduled",
                message,
                "/mentor/sessions");
        notificationService.notifyEmployee(
                mentorship.getMentee().getEmployeeId(),
                "MENTORSHIP_SESSION",
                "Knowledge session scheduled",
                message,
                "/employee/mentorship");

        return toSessionDto(saved);
    }

    @Override
    public KnowledgeSessionDTO completeSession(Long sessionId) {
        KnowledgeSession session = getSession(sessionId);
        Employee employee = getLoggedInEmployee();
        requireParticipant(session.getMentorshipRequest(), employee);
        if (session.getStatus() != KnowledgeSession.Status.SCHEDULED) {
            throw new IllegalArgumentException("Only scheduled sessions can be completed.");
        }
        session.setStatus(KnowledgeSession.Status.COMPLETED);
        KnowledgeSession saved = sessionRepository.save(session);
        MentorshipRequest request = session.getMentorshipRequest();
        notificationService.notifyEmployee(
                request.getMentor().getEmployeeId(),
                "MENTORSHIP_SESSION_COMPLETED",
                "Knowledge session completed",
                "Session '" + session.getTitle() + "' has been marked completed.",
                "/mentor/sessions");
        notificationService.notifyEmployee(
                request.getMentee().getEmployeeId(),
                "MENTORSHIP_SESSION_COMPLETED",
                "Knowledge session completed",
                "Session '" + session.getTitle() + "' has been marked completed.",
                "/employee/mentorship");
        return toSessionDto(saved);
    }

    @Override
    public KnowledgeSessionDTO cancelSession(Long sessionId) {
        KnowledgeSession session = getSession(sessionId);
        Employee employee = getLoggedInEmployee();
        requireParticipant(session.getMentorshipRequest(), employee);
        if (session.getStatus() != KnowledgeSession.Status.SCHEDULED) {
            throw new IllegalArgumentException("Only scheduled sessions can be cancelled.");
        }
        session.setStatus(KnowledgeSession.Status.CANCELLED);
        KnowledgeSession saved = sessionRepository.save(session);
        MentorshipRequest request = session.getMentorshipRequest();
        String message = "Session '" + session.getTitle() + "' has been cancelled.";
        notificationService.notifyEmployee(request.getMentor().getEmployeeId(), "MENTORSHIP_SESSION_CANCELLED", "Knowledge session cancelled", message, "/mentor/sessions");
        notificationService.notifyEmployee(request.getMentee().getEmployeeId(), "MENTORSHIP_SESSION_CANCELLED", "Knowledge session cancelled", message, "/employee/mentorship");
        return toSessionDto(saved);
    }

    @Override
    public void submitFeedback(Long sessionId, CreateFeedbackDTO request) {
        KnowledgeSession session = getSession(sessionId);
        Employee employee = getLoggedInEmployee();
        requireParticipant(session.getMentorshipRequest(), employee);
        if (session.getStatus() != KnowledgeSession.Status.COMPLETED) {
            throw new IllegalArgumentException("Feedback can only be submitted after the session is completed.");
        }
        if (request == null || request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }
        if (feedbackRepository.findBySessionAndReviewer(session, employee).isPresent()) {
            throw new ResourceAlreadyExistsException("You have already submitted feedback for this session.");
        }

        KnowledgeSessionFeedback feedback = new KnowledgeSessionFeedback();
        feedback.setSession(session);
        feedback.setReviewer(employee);
        feedback.setRating(request.getRating());
        feedback.setComments(request.getComments() == null ? null : request.getComments().trim());
        feedbackRepository.save(feedback);

        Employee other = session.getMentorshipRequest().getMentor().getEmployeeId().equals(employee.getEmployeeId())
                ? session.getMentorshipRequest().getMentee()
                : session.getMentorshipRequest().getMentor();
        notificationService.notifyEmployee(
                other.getEmployeeId(),
                "MENTORSHIP_FEEDBACK",
                "New mentorship feedback",
                fullName(employee) + " submitted feedback for '" + session.getTitle() + "'.",
                other.getEmployeeId().equals(session.getMentorshipRequest().getMentor().getEmployeeId())
                        ? "/mentor/sessions"
                        : "/employee/mentorship");
    }

    private Employee getLoggedInEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResourceNotFoundException("Authenticated employee not found.");
        }
        return employeeRepository.findByOfficialEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
    }

    private void requireActiveMentor(Employee employee) {
        if (!isActiveMentor(employee)) {
            throw new AccessDeniedException("Only an active mentor can perform this action.");
        }
    }

    private MentorshipRequest getRequest(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found."));
    }

    private KnowledgeSession getSession(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge session not found."));
    }

    private void requireMentor(MentorshipRequest request, Employee employee) {
        if (request.getMentor() == null || !request.getMentor().getEmployeeId().equals(employee.getEmployeeId())) {
            throw new AccessDeniedException("Only the mentor can perform this action.");
        }
    }

    private void requireParticipant(MentorshipRequest request, Employee employee) {
        if (request == null || request.getMentor() == null || request.getMentee() == null) {
            throw new ResourceNotFoundException("Invalid mentorship relationship.");
        }
        boolean participant = request.getMentor().getEmployeeId().equals(employee.getEmployeeId())
                || request.getMentee().getEmployeeId().equals(employee.getEmployeeId());
        if (!participant) {
            throw new AccessDeniedException("You are not a participant in this mentorship.");
        }
    }

    private EmployeeSkill findEmployeeSkill(List<EmployeeSkill> skills, Long skillId) {
        return skills.stream()
                .filter(es -> es.getSkill() != null && es.getSkill().getSkillId().equals(skillId))
                .findFirst()
                .orElse(null);
    }

    private int proficiencyRank(ProficiencyLevel level) {
        if (level == null) return 0;
        return switch (level) {
            case BEGINNER -> 1;
            case INTERMEDIATE -> 2;
            case ADVANCED -> 3;
            case EXPERT -> 4;
        };
    }

    private String fullName(Employee employee) {
        return (Optional.ofNullable(employee.getFirstName()).orElse("") + " "
                + Optional.ofNullable(employee.getLastName()).orElse("")).trim();
    }

    private MentorshipRequestDTO toRequestDto(MentorshipRequest value) {
        MentorshipRequestDTO dto = new MentorshipRequestDTO();
        dto.setRequestId(value.getMentorshipRequestId());
        dto.setMenteeId(value.getMentee().getEmployeeId());
        dto.setMenteeName(fullName(value.getMentee()));
        dto.setMentorId(value.getMentor().getEmployeeId());
        dto.setMentorName(fullName(value.getMentor()));
        dto.setSkillId(value.getSkill().getSkillId());
        dto.setSkillName(value.getSkill().getSkillName());
        dto.setMessage(value.getMessage());
        dto.setStatus(value.getStatus().name());
        dto.setCreatedAt(value.getCreatedAt());
        return dto;
    }

    private KnowledgeSessionDTO toSessionDto(KnowledgeSession value) {
        MentorshipRequest request = value.getMentorshipRequest();
        KnowledgeSessionDTO dto = new KnowledgeSessionDTO();
        dto.setSessionId(value.getKnowledgeSessionId());
        dto.setRequestId(request.getMentorshipRequestId());
        dto.setTitle(value.getTitle());
        dto.setScheduledAt(value.getScheduledAt());
        dto.setDurationMinutes(value.getDurationMinutes());
        dto.setStatus(value.getStatus().name());
        dto.setNotes(value.getNotes());
        dto.setMentorId(request.getMentor().getEmployeeId());
        dto.setMentorName(fullName(request.getMentor()));
        dto.setMenteeId(request.getMentee().getEmployeeId());
        dto.setMenteeName(fullName(request.getMentee()));
        dto.setSkillId(request.getSkill().getSkillId());
        dto.setSkillName(request.getSkill().getSkillName());

        Employee current = getLoggedInEmployee();
        List<KnowledgeSessionFeedback> feedback = feedbackRepository.findBySession(value);
        dto.setMyFeedbackSubmitted(
                feedback.stream().anyMatch(f -> f.getReviewer().getEmployeeId().equals(current.getEmployeeId())));
        dto.setFeedbackCount(feedback.size());
        dto.setAverageRating(feedback.isEmpty() ? null :
                Math.round(feedback.stream().mapToInt(KnowledgeSessionFeedback::getRating).average().orElse(0.0) * 100.0) / 100.0);
        return dto;
    }
}
