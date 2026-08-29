package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.mentorship.MentorshipMatchRequest;
import com.orgskills.intelligence.dto.mentorship.MentorshipMatchResponse;
import com.orgskills.intelligence.dto.mentorship.MentorshipRequest;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.dto.mentorship.RecommendedMentorResponse;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.Achievement;
import com.orgskills.intelligence.entity.MentorshipMatch;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AchievementType;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.AchievementRepository;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorshipService {

    /** Maximum number of concurrently ACTIVE mentorships before a mentor counts as unavailable. */
    static final int MAX_ACTIVE_MENTORSHIPS_PER_MENTOR = 5;

    private static final double PROFICIENCY_DELTA_WEIGHT = 15.0;
    private static final double RATING_WEIGHT = 3.0;
    private static final double SAME_DEPARTMENT_BONUS = 10.0;
    private static final double AVAILABILITY_BONUS = 10.0;
    private static final double EXPERIENCE_WEIGHT = 2.0;
    private static final long MAX_SCORED_EXPERIENCE = 5;

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final GapAnalysisRepository gapAnalysisRepository;
    private final MentorshipMatchRepository mentorshipMatchRepository;
    private final AchievementRepository achievementRepository;
    private final NotificationService notificationService;

    // ── Mentor matching ─────────────────────────────────────────────────────────

    /**
     * Ranks the employees who can mentor {@code employeeId} on {@code skillId}.
     * Candidates must already hold the skill at a strictly higher proficiency than
     * the mentee; the ranking then rewards a larger proficiency delta, a higher
     * rating score, a shared department, spare mentoring capacity and prior
     * mentorship experience.
     */
    @Transactional(readOnly = true)
    public List<RecommendedMentorResponse> findRecommendedMentors(Long employeeId, Long skillId) {
        User mentee = getUser(employeeId);
        Skill skill = getSkill(skillId);
        ProficiencyLevel menteeLevel = currentProficiency(employeeId, skillId);

        List<UserSkill> candidates = userSkillRepository.findBySkillId(skillId).stream()
                .filter(us -> !us.getUser().getId().equals(employeeId))
                .filter(us -> !Boolean.FALSE.equals(us.getUser().getActive()))
                .filter(us -> us.getProficiencyLevel().ordinal() > menteeLevel.ordinal())
                .toList();

        if (candidates.isEmpty()) {
            return List.of();
        }

        List<Long> mentorIds = candidates.stream().map(us -> us.getUser().getId()).toList();
        List<MentorshipMatch> history = mentorshipMatchRepository.findByMentorIdInAndStatusIn(
                mentorIds, List.of(MentorshipStatus.ACTIVE, MentorshipStatus.COMPLETED));

        Map<Long, Long> activeCounts = countByMentor(history, MentorshipStatus.ACTIVE);
        Map<Long, Long> completedCounts = countByMentor(history, MentorshipStatus.COMPLETED);

        return candidates.stream()
                .map(candidate -> score(candidate, mentee, skill, menteeLevel,
                        activeCounts.getOrDefault(candidate.getUser().getId(), 0L),
                        completedCounts.getOrDefault(candidate.getUser().getId(), 0L)))
                .sorted(Comparator.comparing(RecommendedMentorResponse::isAvailable).reversed()
                        .thenComparing(Comparator.comparingDouble(RecommendedMentorResponse::getMatchScore).reversed())
                        .thenComparing(RecommendedMentorResponse::getMentorName,
                                Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private RecommendedMentorResponse score(UserSkill candidate, User mentee, Skill skill,
                                            ProficiencyLevel menteeLevel, long activeCount, long completedCount) {
        User mentor = candidate.getUser();
        List<String> reasons = new ArrayList<>();

        int delta = candidate.getProficiencyLevel().ordinal() - menteeLevel.ordinal();
        double matchScore = delta * PROFICIENCY_DELTA_WEIGHT;
        reasons.add("Holds " + skill.getName() + " at " + candidate.getProficiencyLevel() + ", " + delta
                + " level(s) above the mentee level of " + menteeLevel + ".");

        double rating = candidate.getRatingScore() != null ? candidate.getRatingScore() : 0.0;
        matchScore += rating * RATING_WEIGHT;

        boolean sameDepartment = mentee.getDepartment() != null
                && mentee.getDepartment().equalsIgnoreCase(mentor.getDepartment());
        if (sameDepartment) {
            matchScore += SAME_DEPARTMENT_BONUS;
            reasons.add("Works in the same department (" + mentor.getDepartment() + ").");
        }

        boolean available = activeCount < MAX_ACTIVE_MENTORSHIPS_PER_MENTOR;
        if (available) {
            matchScore += AVAILABILITY_BONUS;
            reasons.add("Available: mentoring " + activeCount + " of "
                    + MAX_ACTIVE_MENTORSHIPS_PER_MENTOR + " mentees.");
        } else {
            reasons.add("At mentoring capacity with " + activeCount + " active mentorships.");
        }

        if (completedCount > 0) {
            matchScore += Math.min(completedCount, MAX_SCORED_EXPERIENCE) * EXPERIENCE_WEIGHT;
            reasons.add("Has completed " + completedCount + " prior mentorship(s).");
        }

        return RecommendedMentorResponse.builder()
                .mentorId(mentor.getId())
                .mentorName(mentor.getFullName())
                .mentorEmail(mentor.getEmail())
                .department(mentor.getDepartment())
                .jobTitle(mentor.getJobTitle())
                .skillId(skill.getId())
                .skillName(skill.getName())
                .mentorProficiency(candidate.getProficiencyLevel())
                .mentorRatingScore(candidate.getRatingScore())
                .menteeProficiency(menteeLevel)
                .sameDepartment(sameDepartment)
                .available(available)
                .activeMentorships(activeCount)
                .completedMentorships(completedCount)
                .matchScore(Math.round(matchScore * 10.0) / 10.0)
                .reasons(reasons)
                .build();
    }

    // ── Request workflow ────────────────────────────────────────────────────────

    /** A mentee asks a mentor for help with a skill. The mentorship starts as REQUESTED. */
    @Transactional
    public MentorshipResponse requestMentorship(MentorshipRequest request) {
        if (request.getMenteeId().equals(request.getMentorId())) {
            throw new ValidationException("Cannot request mentorship with yourself");
        }
        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new ValidationException("End date must not be before start date");
        }

        User mentee = getUser(request.getMenteeId());
        User mentor = getUser(request.getMentorId());
        Skill skill = getSkill(request.getSkillId());

        requirePairingIsSound(mentee, mentor, skill);

        MentorshipMatch mentorship = new MentorshipMatch();
        mentorship.setMentee(mentee);
        mentorship.setMentor(mentor);
        mentorship.setTargetSkill(skill);
        mentorship.setGoal(request.getGoal());
        mentorship.setStartDate(request.getStartDate());
        mentorship.setEndDate(request.getEndDate());
        mentorship.setStatus(MentorshipStatus.REQUESTED);

        MentorshipMatch saved = mentorshipMatchRepository.save(mentorship);

        notificationService.createNotification(
                mentor,
                "Mentorship Request",
                mentee.getFullName() + " has requested your mentorship for " + skill.getName()
                        + (request.getGoal() != null ? ". Goal: " + request.getGoal() : ""),
                NotificationType.MENTORSHIP_REQUEST
        );

        return toMentorshipResponse(saved);
    }

    /**
     * The rules a new mentorship must satisfy however it is created — asked for by the mentee, or
     * arranged by their manager. Pairing somebody with a mentor no more skilled than they are, or
     * stacking a second mentorship on a skill they are already being mentored in, is a mistake
     * whoever makes it.
     */
    private void requirePairingIsSound(User mentee, User mentor, Skill skill) {
        if (Boolean.FALSE.equals(mentor.getActive())) {
            throw new ValidationException("Mentor " + mentor.getFullName() + " is not an active employee");
        }
        if (mentorshipMatchRepository.existsByMenteeIdAndTargetSkillIdAndStatus(
                mentee.getId(), skill.getId(), MentorshipStatus.ACTIVE)) {
            throw new ValidationException("An ACTIVE mentorship already exists for " + skill.getName()
                    + ". Complete or cancel it before requesting another.");
        }
        if (mentorshipMatchRepository.existsByMentorIdAndMenteeIdAndTargetSkillIdAndStatus(
                mentor.getId(), mentee.getId(), skill.getId(), MentorshipStatus.REQUESTED)) {
            throw new ValidationException("A mentorship request for " + skill.getName()
                    + " is already pending with " + mentor.getFullName());
        }

        ProficiencyLevel menteeLevel = currentProficiency(mentee.getId(), skill.getId());
        ProficiencyLevel mentorLevel = userSkillRepository.findByUserIdAndSkillId(mentor.getId(), skill.getId())
                .map(UserSkill::getProficiencyLevel)
                .orElseThrow(() -> new ValidationException(
                        mentor.getFullName() + " has no recorded proficiency in " + skill.getName()));
        if (mentorLevel.ordinal() <= menteeLevel.ordinal()) {
            throw new ValidationException(mentor.getFullName() + " is at " + mentorLevel + " for "
                    + skill.getName() + ", which is not above the mentee level of " + menteeLevel);
        }
    }

    /**
     * A manager pairs an employee with a mentor. This skips the request-and-accept handshake — the
     * pairing is a management decision, not an invitation — but applies the same pairing rules.
     */
    @Transactional
    public MentorshipResponse assignMentorship(User assigner, Long menteeId, Long mentorId, Long skillId) {
        User mentee = getUser(menteeId);
        User mentor = getUser(mentorId);
        Skill skill = getSkill(skillId);

        if (mentee.getId().equals(mentor.getId())) {
            throw new ValidationException("Cannot assign somebody as their own mentor");
        }
        requirePairingIsSound(mentee, mentor, skill);

        MentorshipMatch mentorship = new MentorshipMatch();
        mentorship.setMentee(mentee);
        mentorship.setMentor(mentor);
        mentorship.setTargetSkill(skill);
        mentorship.setStatus(MentorshipStatus.ACTIVE);
        mentorship.setStartDate(LocalDate.now());
        MentorshipMatch saved = mentorshipMatchRepository.save(mentorship);

        notificationService.createNotification(mentee, "Mentorship Assigned",
                assigner.getFullName() + " has paired you with mentor " + mentor.getFullName()
                        + " for " + skill.getName(),
                NotificationType.MENTORSHIP_REQUEST);
        notificationService.createNotification(mentor, "New Mentee Assigned",
                assigner.getFullName() + " assigned " + mentee.getFullName()
                        + " to you for mentorship in " + skill.getName(),
                NotificationType.MENTORSHIP_REQUEST);

        return toMentorshipResponse(saved);
    }

    /** The mentor accepts; the mentorship becomes ACTIVE. */
    @Transactional
    public MentorshipResponse acceptMentorship(Long mentorshipId, Long actingUserId) {
        MentorshipMatch mentorship = getMentorship(mentorshipId);
        requireMentor(mentorship, actingUserId);
        requirePending(mentorship, "accepted");

        if (mentorshipMatchRepository.existsByMenteeIdAndTargetSkillIdAndStatus(
                mentorship.getMentee().getId(), mentorship.getTargetSkill().getId(), MentorshipStatus.ACTIVE)) {
            throw new ValidationException("The mentee already has an ACTIVE mentorship for "
                    + mentorship.getTargetSkill().getName());
        }

        mentorship.setStatus(MentorshipStatus.ACTIVE);
        if (mentorship.getStartDate() == null) {
            mentorship.setStartDate(LocalDate.now());
        }
        MentorshipMatch saved = mentorshipMatchRepository.save(mentorship);

        notificationService.createNotification(
                saved.getMentee(),
                "Mentorship Request Accepted",
                saved.getMentor().getFullName() + " accepted your mentorship request for "
                        + saved.getTargetSkill().getName(),
                NotificationType.INFO
        );

        return toMentorshipResponse(saved);
    }

    /**
     * Either participant closes out an ACTIVE mentorship. The mentee earns the achievement, since
     * they are the one who did the learning.
     */
    @Transactional
    public MentorshipResponse completeMentorship(Long mentorshipId, Long actingUserId) {
        MentorshipMatch mentorship = getMentorship(mentorshipId);
        if (!mentorship.getMentee().getId().equals(actingUserId)
                && !mentorship.getMentor().getId().equals(actingUserId)) {
            throw new ValidationException("Access denied. You are not a participant in this mentorship.");
        }
        if (mentorship.getStatus() != MentorshipStatus.ACTIVE) {
            throw new ValidationException("Only an ACTIVE mentorship can be completed; this one is "
                    + mentorship.getStatus());
        }

        mentorship.setStatus(MentorshipStatus.COMPLETED);
        if (mentorship.getEndDate() == null) {
            mentorship.setEndDate(LocalDate.now());
        }
        MentorshipMatch saved = mentorshipMatchRepository.save(mentorship);

        Achievement achievement = new Achievement();
        achievement.setEmployee(saved.getMentee());
        achievement.setType(AchievementType.MENTORSHIP_COMPLETED);
        achievement.setTitle("Mentorship Completed: " + saved.getTargetSkill().getName());
        achievement.setDescription("Completed mentorship with " + saved.getMentor().getFullName());
        achievementRepository.save(achievement);

        notificationService.createNotification(
                saved.getMentee(),
                "Mentorship completed",
                "Your mentorship with " + saved.getMentor().getFullName() + " for "
                        + saved.getTargetSkill().getName() + " is complete.",
                NotificationType.INFO);

        return toMentorshipResponse(saved);
    }

    /** The mentor declines; the mentorship becomes REJECTED. */
    @Transactional
    public MentorshipResponse rejectMentorship(Long mentorshipId, Long actingUserId) {
        MentorshipMatch mentorship = getMentorship(mentorshipId);
        requireMentor(mentorship, actingUserId);
        requirePending(mentorship, "rejected");

        mentorship.setStatus(MentorshipStatus.REJECTED);
        mentorship.setEndDate(LocalDate.now());
        MentorshipMatch saved = mentorshipMatchRepository.save(mentorship);

        notificationService.createNotification(
                saved.getMentee(),
                "Mentorship Request Declined",
                saved.getMentor().getFullName() + " is unable to mentor you for "
                        + saved.getTargetSkill().getName() + " right now",
                NotificationType.INFO
        );

        return toMentorshipResponse(saved);
    }

    /** All mentorships an employee takes part in, as mentor or as mentee. */
    @Transactional(readOnly = true)
    public List<MentorshipResponse> getMentorshipsForUser(Long employeeId) {
        if (!userRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("User not found for id: " + employeeId);
        }
        return mentorshipMatchRepository.findByMenteeIdOrMentorIdOrderByCreatedAtDesc(employeeId, employeeId)
                .stream()
                .map(this::toMentorshipResponse)
                .toList();
    }

    // ── Legacy gap-driven auto-match ────────────────────────────────────────────

    @Transactional
    public MentorshipMatchResponse createMatch(MentorshipMatchRequest request) {
        User mentee = userRepository.findById(request.getMenteeId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentee not found for id: " + request.getMenteeId()));
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + request.getSkillId()));

        List<GapAnalysis> criticalGaps = gapAnalysisRepository.findByUserIdAndRiskSeverity(mentee.getId(), RiskSeverity.CRITICAL);
        boolean hasCriticalForSkill = criticalGaps.stream().anyMatch(g -> g.getSkill().getId().equals(skill.getId()));
        if (!hasCriticalForSkill) {
            throw new ValidationException("Mentee does not have a CRITICAL gap for skill " + skill.getName());
        }

        List<UserSkill> expertCandidates = userSkillRepository
                .findBySkillIdAndProficiencyLevelOrderByRatingScoreDesc(skill.getId(), ProficiencyLevel.EXPERT);
        Optional<UserSkill> expert = expertCandidates.stream()
                .filter(candidate -> !candidate.getUser().getId().equals(mentee.getId()))
                .findFirst();

        if (expert.isEmpty()) {
            throw new ValidationException("No internal expert mentor available for skill " + skill.getName());
        }

        User mentor = expert.get().getUser();
        requirePairingIsSound(mentee, mentor, skill);

        MentorshipMatch match = new MentorshipMatch();
        match.setMentee(mentee);
        match.setMentor(mentor);
        match.setTargetSkill(skill);
        match.setStatus(MentorshipStatus.REQUESTED);

        MentorshipMatch saved = mentorshipMatchRepository.save(match);

        notificationService.createMentorshipInvite(
                mentor,
                "You have a mentorship request from " + mentee.getFullName() + " for skill " + skill.getName() + "."
        );
        notificationService.createMentorshipInvite(
                mentee,
                "Mentor " + mentor.getFullName() + " has been matched for your " + skill.getName() + " development journey."
        );

        return toResponse(saved);
    }

    public List<MentorshipMatchResponse> getMatchesByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found for id: " + userId);
        }
        return mentorshipMatchRepository.findByMenteeIdOrMentorIdOrderByCreatedAtDesc(userId, userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MentorshipMatchResponse updateStatus(Long matchId, MentorshipStatus status) {
        MentorshipMatch match = getMentorship(matchId);
        match.setStatus(status);
        return toResponse(mentorshipMatchRepository.save(match));
    }

    // ── Helper methods ──────────────────────────────────────────────────────────

    private Map<Long, Long> countByMentor(List<MentorshipMatch> history, MentorshipStatus status) {
        return history.stream()
                .filter(m -> m.getStatus() == status)
                .collect(Collectors.groupingBy(m -> m.getMentor().getId(), Collectors.counting()));
    }

    /** The proficiency an employee currently holds for a skill, from the existing user_skills data. */
    private ProficiencyLevel currentProficiency(Long userId, Long skillId) {
        return userSkillRepository.findByUserIdAndSkillId(userId, skillId)
                .map(UserSkill::getProficiencyLevel)
                .orElse(ProficiencyLevel.UNAWARE);
    }

    private void requireMentor(MentorshipMatch mentorship, Long actingUserId) {
        if (!mentorship.getMentor().getId().equals(actingUserId)) {
            throw new UnauthorizedException("Only the assigned mentor can respond to this mentorship request");
        }
    }

    private void requirePending(MentorshipMatch mentorship, String action) {
        if (mentorship.getStatus() != MentorshipStatus.REQUESTED) {
            throw new ValidationException("Only a REQUESTED mentorship can be " + action
                    + "; this one is " + mentorship.getStatus());
        }
    }

    private MentorshipMatch getMentorship(Long mentorshipId) {
        return mentorshipMatchRepository.findById(mentorshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship not found for id: " + mentorshipId));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));
    }

    private Skill getSkill(Long skillId) {
        return skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + skillId));
    }

    private MentorshipResponse toMentorshipResponse(MentorshipMatch mentorship) {
        return MentorshipResponse.builder()
                .mentorshipId(mentorship.getId())
                .mentorId(mentorship.getMentor().getId())
                .mentorName(mentorship.getMentor().getFullName())
                .menteeId(mentorship.getMentee().getId())
                .menteeName(mentorship.getMentee().getFullName())
                .skillId(mentorship.getTargetSkill().getId())
                .skillName(mentorship.getTargetSkill().getName())
                .goal(mentorship.getGoal())
                .startDate(mentorship.getStartDate())
                .endDate(mentorship.getEndDate())
                .status(mentorship.getStatus())
                .createdAt(mentorship.getCreatedAt())
                .build();
    }

    private MentorshipMatchResponse toResponse(MentorshipMatch match) {
        return MentorshipMatchResponse.builder()
                .id(match.getId())
                .menteeId(match.getMentee().getId())
                .menteeName(match.getMentee().getFullName())
                .mentorId(match.getMentor().getId())
                .mentorName(match.getMentor().getFullName())
                .skillId(match.getTargetSkill().getId())
                .skillName(match.getTargetSkill().getName())
                .status(match.getStatus())
                .createdAt(match.getCreatedAt())
                .build();
    }
}
