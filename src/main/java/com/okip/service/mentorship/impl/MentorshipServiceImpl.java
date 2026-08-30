package com.okip.service.mentorship.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.mentorship.MentorProfileDTO;
import com.okip.dto.mentorship.MentorshipRequestDTO;
import com.okip.dto.mentorship.MentorshipResponseDTO;
import com.okip.dto.mentorship.MentorshipStatusUpdateDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.EmployeeProfile;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.entity.transaction.MentorshipRequest;
import com.okip.enums.MentorshipStatus;
import com.okip.enums.NotificationType;
import com.okip.enums.ProficiencyLevel;
import com.okip.exception.BadRequestException;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.*;
import com.okip.service.mentorship.MentorshipService;
import com.okip.service.notification.NotificationService;

@Service
public class MentorshipServiceImpl implements MentorshipService {

    private final MentorshipRequestRepository mentorshipRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final EmployeeJobRoleRepository employeeJobRoleRepository;
    private final SkillRepository skillRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final NotificationService notificationService;

    public MentorshipServiceImpl(
            MentorshipRequestRepository mentorshipRepository,
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            EmployeeProfileRepository employeeProfileRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            SkillRepository skillRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            NotificationService notificationService) {
        this.mentorshipRepository = mentorshipRepository;
        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
        this.skillRepository = skillRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.notificationService = notificationService;
    }

    @Override
    public List<MentorProfileDTO> getAllMentors(Long skillId, String department, String search) {
        Employee loggedIn = getLoggedInEmployee();
        List<Employee> allEmployees = employeeRepository.findAll();

        return allEmployees.stream()
                .filter(e -> !e.getEmployeeId().equals(loggedIn.getEmployeeId()))
                .filter(e -> {
                    if (department != null && !department.isBlank() && !department.equalsIgnoreCase("all")) {
                        return e.getDepartment() != null && e.getDepartment().getDepartmentName().equalsIgnoreCase(department);
                    }
                    return true;
                })
                .filter(e -> {
                    if (search != null && !search.isBlank()) {
                        String s = search.toLowerCase();
                        String fullName = (e.getFirstName() + " " + e.getLastName()).toLowerCase();
                        return fullName.contains(s) || e.getOfficialEmail().toLowerCase().contains(s) || (e.getEmployeeCode() != null && e.getEmployeeCode().toLowerCase().contains(s));
                    }
                    return true;
                })
                .map(this::buildMentorProfile)
                .filter(p -> {
                    if (skillId != null) {
                        return p.getExpertSkills().stream().anyMatch(s -> s.getSkillId().equals(skillId));
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<MentorProfileDTO> getRecommendedMentorsForMyGaps() {
        Employee loggedIn = getLoggedInEmployee();
        List<EmployeeJobRole> assignedRoles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(loggedIn);
        List<KnowledgeGap> gaps = knowledgeGapRepository.findByEmployeeJobRoleIn(assignedRoles);

        Set<Long> gapSkillIds = gaps.stream()
                .filter(g -> g.getGapPercentage() > 0)
                .map(g -> g.getSkill().getSkillId())
                .collect(Collectors.toSet());

        if (gapSkillIds.isEmpty()) {
            return getAllMentors(null, null, null).stream().limit(5).collect(Collectors.toList());
        }

        List<Employee> allEmployees = employeeRepository.findAll();
        return allEmployees.stream()
                .filter(e -> !e.getEmployeeId().equals(loggedIn.getEmployeeId()))
                .map(this::buildMentorProfile)
                .filter(profile -> profile.getExpertSkills().stream().anyMatch(s -> gapSkillIds.contains(s.getSkillId())))
                .collect(Collectors.toList());
    }

    @Override
    public MentorProfileDTO getMentorProfile(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor employee not found."));
        return buildMentorProfile(employee);
    }

    private MentorProfileDTO buildMentorProfile(Employee emp) {
        MentorProfileDTO profile = new MentorProfileDTO();
        profile.setEmployeeId(emp.getEmployeeId());
        profile.setEmployeeCode(emp.getEmployeeCode());
        profile.setFullName(emp.getFirstName() + " " + emp.getLastName());
        profile.setEmail(emp.getOfficialEmail());
        profile.setDepartment(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "N/A");

        List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(emp);
        if (!roles.isEmpty()) {
            profile.setJobRole(roles.get(0).getJobRole().getJobRoleName());
        } else {
            profile.setJobRole("Specialist");
        }

        EmployeeProfile empProfile = employeeProfileRepository.findByEmployee(emp).orElse(null);
        profile.setBio(empProfile != null && empProfile.getBio() != null ? empProfile.getBio() : "Experienced professional available for mentoring and knowledge sharing.");

        List<EmployeeSkill> empSkills = employeeSkillRepository.findByEmployee(emp);
        List<MentorProfileDTO.ExpertSkillDTO> expertSkills = empSkills.stream()
                .filter(es -> es.getProficiencyLevel() == ProficiencyLevel.ADVANCED || es.getProficiencyLevel() == ProficiencyLevel.EXPERT || (es.getYearsOfExperience() != null && es.getYearsOfExperience() >= 3.0))
                .map(es -> new MentorProfileDTO.ExpertSkillDTO(
                        es.getSkill().getSkillId(),
                        es.getSkill().getSkillName(),
                        es.getSkill().getSkillCategory() != null ? es.getSkill().getSkillCategory().name() : "GENERAL",
                        es.getProficiencyLevel() != null ? es.getProficiencyLevel().name() : "INTERMEDIATE",
                        es.getYearsOfExperience() != null ? es.getYearsOfExperience() : 1.0
                ))
                .collect(Collectors.toList());
        profile.setExpertSkills(expertSkills);

        List<MentorshipRequest> activeMentorships = mentorshipRepository.findActiveMentorshipsForEmployee(emp);
        long activeCount = activeMentorships.stream().filter(m -> m.getMentor().getEmployeeId().equals(emp.getEmployeeId())).count();
        profile.setActiveMenteesCount((int) activeCount);
        profile.setAvailableForMentorship(activeCount < 5);

        return profile;
    }

    @Override
    @Transactional
    public MentorshipResponseDTO sendRequest(MentorshipRequestDTO request) {
        Employee mentee = getLoggedInEmployee();
        if (mentee.getEmployeeId().equals(request.getMentorId())) {
            throw new BadRequestException("You cannot send a mentorship request to yourself.");
        }

        Employee mentor = employeeRepository.findById(request.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found."));

        if (mentorshipRepository.existsByMenteeAndMentorAndStatus(mentee, mentor, MentorshipStatus.PENDING)) {
            throw new ResourceAlreadyExistsException("You already have a pending mentorship request with this mentor.");
        }

        Skill skill = null;
        if (request.getSkillId() != null) {
            skill = skillRepository.findById(request.getSkillId()).orElse(null);
        }

        MentorshipRequest mr = new MentorshipRequest();
        mr.setMentee(mentee);
        mr.setMentor(mentor);
        mr.setSkill(skill);
        mr.setTopic(request.getTopic() != null ? request.getTopic() : (skill != null ? skill.getSkillName() : "General Mentorship"));
        mr.setMessage(request.getMessage());
        mr.setStatus(MentorshipStatus.PENDING);
        mr.setRequestedAt(LocalDateTime.now());

        MentorshipRequest saved = mentorshipRepository.save(mr);

        notificationService.createNotification(
                mentor,
                "New Mentorship Request",
                mentee.getFirstName() + " " + mentee.getLastName() + " has requested mentorship in " + mr.getTopic(),
                NotificationType.MENTORSHIP,
                saved.getRequestId()
        );

        return convertToResponse(saved);
    }

    @Override
    public List<MentorshipResponseDTO> getMySentRequests() {
        Employee mentee = getLoggedInEmployee();
        return mentorshipRepository.findByMenteeOrderByCreatedAtDesc(mentee)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<MentorshipResponseDTO> getMyReceivedRequests() {
        Employee mentor = getLoggedInEmployee();
        return mentorshipRepository.findByMentorOrderByCreatedAtDesc(mentor)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<MentorshipResponseDTO> getActiveMentorships() {
        Employee employee = getLoggedInEmployee();
        return mentorshipRepository.findActiveMentorshipsForEmployee(employee)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MentorshipResponseDTO updateRequestStatus(Long requestId, MentorshipStatusUpdateDTO statusUpdate) {
        Employee loggedIn = getLoggedInEmployee();
        MentorshipRequest request = mentorshipRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found."));

        MentorshipStatus targetStatus;
        try {
            targetStatus = MentorshipStatus.valueOf(statusUpdate.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + statusUpdate.getStatus());
        }

        boolean isMentor = request.getMentor().getEmployeeId().equals(loggedIn.getEmployeeId());
        boolean isMentee = request.getMentee().getEmployeeId().equals(loggedIn.getEmployeeId());

        if (!isMentor && !isMentee) {
            throw new BadRequestException("You are not authorized to update this mentorship request.");
        }

        request.setStatus(targetStatus);
        request.setNotes(statusUpdate.getNotes());
        request.setRespondedAt(LocalDateTime.now());

        if (targetStatus == MentorshipStatus.COMPLETED) {
            request.setCompletedAt(LocalDateTime.now());
        }

        MentorshipRequest updated = mentorshipRepository.save(request);

        if (targetStatus == MentorshipStatus.ACCEPTED) {
            notificationService.createNotification(
                    request.getMentee(),
                    "Mentorship Accepted!",
                    request.getMentor().getFirstName() + " " + request.getMentor().getLastName() + " accepted your mentorship request for " + request.getTopic(),
                    NotificationType.MENTORSHIP,
                    updated.getRequestId()
            );
        } else if (targetStatus == MentorshipStatus.REJECTED) {
            notificationService.createNotification(
                    request.getMentee(),
                    "Mentorship Request Update",
                    request.getMentor().getFirstName() + " " + request.getMentor().getLastName() + " was unable to accept your mentorship request at this time.",
                    NotificationType.MENTORSHIP,
                    updated.getRequestId()
            );
        }

        return convertToResponse(updated);
    }

    private Employee getLoggedInEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return employeeRepository.findByOfficialEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found."));
    }

    private MentorshipResponseDTO convertToResponse(MentorshipRequest r) {
        MentorshipResponseDTO dto = new MentorshipResponseDTO();
        dto.setRequestId(r.getRequestId());
        dto.setMenteeId(r.getMentee().getEmployeeId());
        dto.setMenteeName(r.getMentee().getFirstName() + " " + r.getMentee().getLastName());
        dto.setMenteeEmail(r.getMentee().getOfficialEmail());
        dto.setMenteeDepartment(r.getMentee().getDepartment() != null ? r.getMentee().getDepartment().getDepartmentName() : "N/A");

        dto.setMentorId(r.getMentor().getEmployeeId());
        dto.setMentorName(r.getMentor().getFirstName() + " " + r.getMentor().getLastName());
        dto.setMentorEmail(r.getMentor().getOfficialEmail());
        dto.setMentorDepartment(r.getMentor().getDepartment() != null ? r.getMentor().getDepartment().getDepartmentName() : "N/A");

        if (r.getSkill() != null) {
            dto.setSkillId(r.getSkill().getSkillId());
            dto.setSkillName(r.getSkill().getSkillName());
        }

        dto.setTopic(r.getTopic());
        dto.setMessage(r.getMessage());
        dto.setNotes(r.getNotes());
        dto.setStatus(r.getStatus().name());
        dto.setRequestedAt(r.getRequestedAt());
        dto.setRespondedAt(r.getRespondedAt());
        dto.setCompletedAt(r.getCompletedAt());
        return dto;
    }
}
