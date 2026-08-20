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
public class MentorshipService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private MentorshipRepository mentorshipRepository;

    @Autowired
    private MentorshipMessageRepository messageRepository;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Skill-Gap Based Mentor Recommendations
     * Algorithm:
     * 1. Consumes mentee's calculated skill gaps from GapAnalysisService.
     * 2. Finds candidate mentors whose proficiency in employee_skills is strictly GREATER than mentee's proficiency.
     * 3. Calculates recommendation match score (%) based on proficiency delta, gap severity, department match, and active mentor workload.
     * 4. Derives empirical recommendation explanation.
     */
    public List<MentorRecommendationDto> getRecommendationsForMentee(UUID menteeId) {
        User mentee = userRepository.findById(menteeId)
                .orElseThrow(() -> new RuntimeException("Mentee not found: " + menteeId));

        List<SkillGapDto> gaps = gapAnalysisService.calculateUserGaps(menteeId);
        if (gaps.isEmpty()) {
            return Collections.emptyList();
        }

        // Sort gaps by severity (highest gap score first)
        gaps.sort((g1, g2) -> Integer.compare(g2.getGapScore(), g1.getGapScore()));

        List<MentorRecommendationDto> recommendations = new ArrayList<>();
        Set<String> pairedMentorSkillKeys = new HashSet<>();

        // Fetch existing active or pending mentorships to exclude duplicates
        List<Mentorship> existingMentorships = mentorshipRepository.findByMenteeId(menteeId);
        for (Mentorship m : existingMentorships) {
            if ("REQUESTED".equalsIgnoreCase(m.getStatus()) || "ACCEPTED".equalsIgnoreCase(m.getStatus()) || "ACTIVE".equalsIgnoreCase(m.getStatus())) {
                pairedMentorSkillKeys.add(m.getMentor().getId() + "_" + m.getSkill().getId());
            }
        }

        List<EmployeeSkill> allEmployeeSkills = employeeSkillRepository.findAll();

        for (SkillGapDto gap : gaps) {
            if (gap.getGapScore() <= 0) continue;

            UUID skillId = gap.getSkillId();
            int menteeLevel = gap.getCurrentLevel();

            // Find all candidate users with proficiency strictly greater than menteeLevel
            List<EmployeeSkill> candidates = allEmployeeSkills.stream()
                    .filter(es -> es.getSkill().getId().equals(skillId))
                    .filter(es -> es.getProficiencyLevel() > menteeLevel)
                    .filter(es -> !es.getUser().getId().equals(menteeId))
                    .filter(es -> Boolean.TRUE.equals(es.getUser().getIsActive()))
                    .collect(Collectors.toList());

            for (EmployeeSkill candidateEs : candidates) {
                User mentor = candidateEs.getUser();
                String pairKey = mentor.getId() + "_" + skillId;
                if (pairedMentorSkillKeys.contains(pairKey)) {
                    continue; // Skip already requested or active mentorships
                }

                int mentorLevel = candidateEs.getProficiencyLevel();
                long activeMentees = mentorshipRepository.countByMentorIdAndStatus(mentor.getId(), "ACTIVE");

                // Calculate Match Score Formula
                // Base 70 + (MentorLevel - MenteeLevel) * 7 + (Dept Match ? 8 : 0) - (ActiveMentees * 3)
                boolean sameDept = mentee.getDepartment() != null && mentor.getDepartment() != null &&
                        mentee.getDepartment().getId().equals(mentor.getDepartment().getId());

                int score = 70 + ((mentorLevel - menteeLevel) * 7) + (sameDept ? 8 : 0) - (int)(activeMentees * 3);
                score = Math.min(98, Math.max(60, score));

                String proficiencyName = getProficiencyLabel(mentorLevel);
                String reason = String.format("%s has %s-level %s proficiency (Level %d vs your Level %d) and can help close your %d-level gap.",
                        mentor.getFullName(), proficiencyName, gap.getSkillName(), mentorLevel, menteeLevel, gap.getGapScore());

                MentorRecommendationDto dto = new MentorRecommendationDto(
                        mentor.getId(),
                        mentor.getFullName(),
                        mentor.getEmail(),
                        mentor.getRoleTitle(),
                        mentor.getDepartment() != null ? mentor.getDepartment().getName() : "Enterprise",
                        mentor.getAvatarUrl(),
                        skillId,
                        gap.getSkillName(),
                        menteeLevel,
                        mentorLevel,
                        gap.getRequiredLevel(),
                        gap.getGapScore(),
                        score,
                        reason,
                        activeMentees
                );

                recommendations.add(dto);
                pairedMentorSkillKeys.add(pairKey);
            }
        }

        // Sort recommendations by matchScore descending
        recommendations.sort((r1, r2) -> Integer.compare(r2.getMatchScore(), r1.getMatchScore()));
        return recommendations;
    }

    @Transactional
    public MentorshipDto requestMentorship(UUID menteeId, MentorshipRequestDto req) {
        if (req.getMentorId() == null || req.getSkillId() == null) {
            throw new IllegalArgumentException("Mentor ID and Skill ID are required.");
        }
        if (menteeId.equals(req.getMentorId())) {
            throw new IllegalArgumentException("You cannot request mentorship from yourself.");
        }

        User mentee = userRepository.findById(menteeId)
                .orElseThrow(() -> new RuntimeException("Mentee not found: " + menteeId));
        User mentor = userRepository.findById(req.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor not found: " + req.getMentorId()));
        Skill skill = skillRepository.findById(req.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found: " + req.getSkillId()));

        // Prevent duplicate active/requested mentorships
        List<Mentorship> activePending = mentorshipRepository.findByMentorIdAndMenteeIdAndSkillIdAndStatusIn(
                mentor.getId(), mentee.getId(), skill.getId(), Arrays.asList("REQUESTED", "ACCEPTED", "ACTIVE")
        );
        if (!activePending.isEmpty()) {
            throw new IllegalStateException("An active or pending mentorship request already exists for this skill.");
        }

        // Check proficiency constraint: Mentor level must be strictly higher than Mentee level
        int menteeLevel = employeeSkillRepository.findByUserIdAndSkillId(mentee.getId(), skill.getId())
                .map(EmployeeSkill::getProficiencyLevel).orElse(1);
        int mentorLevel = employeeSkillRepository.findByUserIdAndSkillId(mentor.getId(), skill.getId())
                .map(EmployeeSkill::getProficiencyLevel).orElse(1);

        if (mentorLevel <= menteeLevel) {
            throw new IllegalArgumentException("Selected mentor must have higher proficiency in " + skill.getName() + " than you.");
        }

        boolean sameDept = mentee.getDepartment() != null && mentor.getDepartment() != null &&
                mentee.getDepartment().getId().equals(mentor.getDepartment().getId());
        int score = 70 + ((mentorLevel - menteeLevel) * 7) + (sameDept ? 8 : 0);
        score = Math.min(98, Math.max(65, score));

        Mentorship mentorship = new Mentorship(mentor, mentee, skill, req.getGoal(), req.getMessage(), score);
        mentorship = mentorshipRepository.save(mentorship);

        // Notify Mentor
        notificationService.notifyMentorshipRequest(mentor, mentee.getFullName(), skill.getName(), mentorship.getId());

        return mapToDto(mentorship);
    }

    @Transactional
    public MentorshipDto acceptMentorship(UUID mentorshipId, UUID mentorId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new RuntimeException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getMentor().getId().equals(mentorId)) {
            throw new SecurityException("Only the designated mentor can accept this request.");
        }

        mentorship.setStatus("ACTIVE");
        mentorship.setStartDate(ZonedDateTime.now());
        mentorship = mentorshipRepository.save(mentorship);

        // Notify Mentee
        notificationService.notifyMentorshipAccepted(mentorship.getMentee(), mentorship.getMentor().getFullName(), mentorship.getSkill().getName(), mentorshipId);

        return mapToDto(mentorship);
    }

    @Transactional
    public MentorshipDto rejectMentorship(UUID mentorshipId, UUID mentorId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new RuntimeException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getMentor().getId().equals(mentorId)) {
            throw new SecurityException("Only the designated mentor can reject this request.");
        }

        mentorship.setStatus("REJECTED");
        mentorship = mentorshipRepository.save(mentorship);

        // Notify Mentee
        notificationService.notifyMentorshipRejected(mentorship.getMentee(), mentorship.getMentor().getFullName(), mentorship.getSkill().getName(), mentorshipId);

        return mapToDto(mentorship);
    }

    @Transactional
    public MentorshipDto cancelMentorship(UUID mentorshipId, UUID userId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new RuntimeException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getMentee().getId().equals(userId) && !mentorship.getMentor().getId().equals(userId)) {
            throw new SecurityException("You are not authorized to cancel this mentorship.");
        }

        mentorship.setStatus("CANCELLED");
        mentorship.setEndDate(ZonedDateTime.now());
        return mapToDto(mentorshipRepository.save(mentorship));
    }

    @Transactional
    public MentorshipDto completeMentorship(UUID mentorshipId, UUID userId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new RuntimeException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getMentee().getId().equals(userId) && !mentorship.getMentor().getId().equals(userId)) {
            throw new SecurityException("You are not authorized to complete this mentorship.");
        }

        mentorship.setStatus("COMPLETED");
        mentorship.setEndDate(ZonedDateTime.now());
        return mapToDto(mentorshipRepository.save(mentorship));
    }

    public List<MentorshipDto> getMyMentors(UUID menteeId) {
        return mentorshipRepository.findByMenteeId(menteeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MentorshipDto> getMyMentees(UUID mentorId) {
        return mentorshipRepository.findByMentorId(mentorId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MentorshipDto getMentorshipById(UUID mentorshipId, UUID userId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new RuntimeException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getMentee().getId().equals(userId) && !mentorship.getMentor().getId().equals(userId)) {
            throw new SecurityException("Access denied to private mentorship details.");
        }
        return mapToDto(mentorship);
    }

    // MESSAGING & CHAT LIFECYCLE
    public List<MentorshipMessageDto> getMessages(UUID mentorshipId, UUID userId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new RuntimeException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getMentee().getId().equals(userId) && !mentorship.getMentor().getId().equals(userId)) {
            throw new SecurityException("Access denied to private mentorship conversation.");
        }

        List<MentorshipMessage> messages = messageRepository.findByMentorshipIdOrderByCreatedAtAsc(mentorshipId);
        return messages.stream().map(this::mapMessageToDto).collect(Collectors.toList());
    }

    @Transactional
    public MentorshipMessageDto sendMessage(UUID mentorshipId, UUID senderId, String text, String type, String url, String title) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new RuntimeException("Mentorship not found: " + mentorshipId));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found: " + senderId));

        User receiver;
        if (mentorship.getMentor().getId().equals(senderId)) {
            receiver = mentorship.getMentee();
        } else if (mentorship.getMentee().getId().equals(senderId)) {
            receiver = mentorship.getMentor();
        } else {
            throw new SecurityException("Only mentorship participants can send messages.");
        }

        MentorshipMessage msg = new MentorshipMessage(mentorship, sender, receiver, text);
        if (type != null && !type.isBlank()) msg.setMessageType(type);
        if (url != null && !url.isBlank()) msg.setResourceUrl(url);
        if (title != null && !title.isBlank()) msg.setResourceTitle(title);

        msg = messageRepository.save(msg);

        // Notify recipient
        notificationService.notifyMentorshipMessage(receiver, sender.getFullName(), text, mentorshipId);

        return mapMessageToDto(msg);
    }

    @Transactional
    public MentorshipDto updateMeetingLink(UUID mentorshipId, UUID userId, String meetingLink) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new RuntimeException("Mentorship not found: " + mentorshipId));

        if (!mentorship.getMentee().getId().equals(userId) && !mentorship.getMentor().getId().equals(userId)) {
            throw new SecurityException("Only mentorship participants can update meeting links.");
        }

        mentorship.setMeetingLink(meetingLink);
        mentorship = mentorshipRepository.save(mentorship);

        User sender = userRepository.findById(userId).orElse(mentorship.getMentor());
        User receiver = mentorship.getMentor().getId().equals(userId) ? mentorship.getMentee() : mentorship.getMentor();

        // Save automatic system message in conversation
        MentorshipMessage msg = new MentorshipMessage(mentorship, sender, receiver, "Shared Google Meet Link: " + meetingLink);
        msg.setMessageType("MEETING_LINK");
        msg.setResourceUrl(meetingLink);
        messageRepository.save(msg);

        return mapToDto(mentorship);
    }

    // EXPERT DIRECTORY
    public List<ExpertProfileDto> getExpertDirectory(String query, String deptFilter, String skillFilter) {
        List<User> activeUsers = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .filter(u -> u.getSystemRole() == SystemRole.EMPLOYEE || u.getSystemRole() == SystemRole.MANAGER)
                .collect(Collectors.toList());

        List<ExpertProfileDto> experts = new ArrayList<>();
        List<EmployeeSkill> allEmployeeSkills = employeeSkillRepository.findAll();

        for (User user : activeUsers) {
            if (query != null && !query.isBlank()) {
                String q = query.toLowerCase();
                boolean matchName = user.getFullName() != null && user.getFullName().toLowerCase().contains(q);
                boolean matchTitle = user.getRoleTitle() != null && user.getRoleTitle().toLowerCase().contains(q);
                boolean matchEmail = user.getEmail() != null && user.getEmail().toLowerCase().contains(q);
                if (!matchName && !matchTitle && !matchEmail) continue;
            }

            if (deptFilter != null && !deptFilter.isBlank() && !deptFilter.equalsIgnoreCase("ALL")) {
                if (user.getDepartment() == null || !user.getDepartment().getName().equalsIgnoreCase(deptFilter)) {
                    continue;
                }
            }

            // Find skills where user has level >= 4 (Advanced or Expert)
            List<EmployeeSkill> userSkills = allEmployeeSkills.stream()
                    .filter(es -> es.getUser().getId().equals(user.getId()))
                    .filter(es -> es.getProficiencyLevel() >= 4)
                    .collect(Collectors.toList());

            if (skillFilter != null && !skillFilter.isBlank() && !skillFilter.equalsIgnoreCase("ALL")) {
                userSkills = userSkills.stream()
                        .filter(es -> es.getSkill().getName().equalsIgnoreCase(skillFilter))
                        .collect(Collectors.toList());
            }

            if (userSkills.isEmpty()) continue; // Exclude non-experts

            List<SkillDto> skillDtos = userSkills.stream()
                    .map(es -> new SkillDto(es.getSkill().getId(), es.getSkill().getName(), es.getSkill().getCategory() != null ? es.getSkill().getCategory().getName() : "General", es.getProficiencyLevel()))
                    .collect(Collectors.toList());

            long activeMentees = mentorshipRepository.countByMentorIdAndStatus(user.getId(), "ACTIVE");
            long completed = mentorshipRepository.countByMentorIdAndStatus(user.getId(), "COMPLETED");

            ExpertProfileDto expert = new ExpertProfileDto(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRoleTitle(),
                    user.getDepartment() != null ? user.getDepartment().getName() : "Engineering",
                    user.getAvatarUrl(),
                    user.getBio(),
                    skillDtos,
                    activeMentees,
                    completed
            );
            experts.add(expert);
        }

        return experts;
    }

    private MentorshipDto mapToDto(Mentorship m) {
        MentorshipDto dto = new MentorshipDto();
        dto.setId(m.getId());
        dto.setMentorId(m.getMentor().getId());
        dto.setMentorName(m.getMentor().getFullName());
        dto.setMentorAvatar(m.getMentor().getAvatarUrl());
        dto.setMentorRole(m.getMentor().getRoleTitle());
        dto.setMentorEmail(m.getMentor().getEmail());

        dto.setMenteeId(m.getMentee().getId());
        dto.setMenteeName(m.getMentee().getFullName());
        dto.setMenteeAvatar(m.getMentee().getAvatarUrl());
        dto.setMenteeRole(m.getMentee().getRoleTitle());
        dto.setMenteeEmail(m.getMentee().getEmail());

        dto.setSkillId(m.getSkill().getId());
        dto.setSkillName(m.getSkill().getName());
        dto.setSkillCategory(m.getSkill().getCategory() != null ? m.getSkill().getCategory().getName() : "General");

        dto.setGoal(m.getGoal());
        dto.setRequestMessage(m.getRequestMessage());
        dto.setStatus(m.getStatus());
        dto.setMatchScore(m.getMatchScore());
        dto.setMeetingLink(m.getMeetingLink());

        dto.setStartDate(m.getStartDate());
        dto.setEndDate(m.getEndDate());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setUpdatedAt(m.getUpdatedAt());
        return dto;
    }

    private MentorshipMessageDto mapMessageToDto(MentorshipMessage msg) {
        MentorshipMessageDto dto = new MentorshipMessageDto();
        dto.setId(msg.getId());
        dto.setMentorshipId(msg.getMentorship().getId());
        dto.setSenderId(msg.getSender().getId());
        dto.setSenderName(msg.getSender().getFullName());
        dto.setSenderAvatar(msg.getSender().getAvatarUrl());
        dto.setReceiverId(msg.getReceiver().getId());
        dto.setReceiverName(msg.getReceiver().getFullName());
        dto.setMessage(msg.getMessage());
        dto.setMessageType(msg.getMessageType());
        dto.setResourceUrl(msg.getResourceUrl());
        dto.setResourceTitle(msg.getResourceTitle());
        dto.setReadStatus(msg.getReadStatus());
        dto.setCreatedAt(msg.getCreatedAt());
        return dto;
    }

    private String getProficiencyLabel(int level) {
        switch (level) {
            case 1: return "Beginner";
            case 2: return "Elementary";
            case 3: return "Intermediate";
            case 4: return "Advanced";
            case 5: return "Expert";
            default: return "Proficient";
        }
    }
}
