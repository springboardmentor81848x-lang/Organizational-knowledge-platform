package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.expert.ExpertResponse;
import com.orgskills.intelligence.entity.MentorshipMatch;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
import com.orgskills.intelligence.repository.SessionRegistrationRepository;
import com.orgskills.intelligence.repository.SessionRegistrationRepository.HostRatingAggregate;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Searches the organisation for employees who can act as experts in a skill.
 *
 * <p><b>Search approach:</b> Elasticsearch is not part of this stack, so this module uses the
 * documented relational substitute — a single indexed query against the existing
 * {@code user_skills}, {@code users} and {@code skills} tables, backed by the composite index
 * {@code idx_user_skill_skill_proficiency} on (skill_id, proficiency_level). There is no
 * separate "expert" table: expertise is derived from the skill data employees already maintain.
 */
@Service
@RequiredArgsConstructor
public class ExpertDirectoryService {

    /** Employees at or above this level are considered experts unless the caller says otherwise. */
    public static final ProficiencyLevel DEFAULT_MINIMUM_PROFICIENCY = ProficiencyLevel.ADVANCED;

    private final UserSkillRepository userSkillRepository;
    private final SessionRegistrationRepository sessionRegistrationRepository;
    private final MentorshipMatchRepository mentorshipMatchRepository;

    /**
     * Finds employees holding {@code skillName} at {@code minProficiency} or above, ranked by
     * proficiency descending and then by their prior mentorship rating — the mean feedback
     * their knowledge-sharing sessions received — falling back to completed mentorships and
     * the skill rating score.
     *
     * @param skillName      case-insensitive substring of the skill name, so "java" finds "Java"
     * @param minProficiency lowest level to treat as expert, or null for {@link #DEFAULT_MINIMUM_PROFICIENCY}
     */
    @Transactional(readOnly = true)
    public List<ExpertResponse> findExperts(String skillName, ProficiencyLevel minProficiency) {
        if (skillName == null || skillName.isBlank()) {
            throw new ValidationException("A skill name is required, e.g. /api/experts?skill=Java");
        }

        ProficiencyLevel threshold = minProficiency != null ? minProficiency : DEFAULT_MINIMUM_PROFICIENCY;
        List<ProficiencyLevel> levels = Arrays.stream(ProficiencyLevel.values())
                .filter(level -> level.ordinal() >= threshold.ordinal())
                .toList();

        List<UserSkill> matches = userSkillRepository.searchExperts(skillName.trim(), levels);
        if (matches.isEmpty()) {
            return List.of();
        }

        List<Long> expertIds = matches.stream().map(match -> match.getUser().getId()).distinct().toList();
        Map<Long, HostRatingAggregate> hostRatings = sessionRegistrationRepository
                .findHostRatingsByMentorIds(expertIds).stream()
                .collect(Collectors.toMap(HostRatingAggregate::getMentorId, Function.identity()));
        Map<Long, Long> completedMentorships = mentorshipMatchRepository
                .findByMentorIdInAndStatusIn(expertIds, List.of(MentorshipStatus.COMPLETED)).stream()
                .collect(Collectors.groupingBy(mentorship -> mentorship.getMentor().getId(), Collectors.counting()));

        return matches.stream()
                .map(match -> toResponse(match, hostRatings.get(match.getUser().getId()),
                        completedMentorships.getOrDefault(match.getUser().getId(), 0L)))
                .sorted(expertRanking())
                .toList();
    }

    /**
     * Proficiency first, then the prior mentorship rating, then mentoring track record and the
     * recorded skill rating. Proficiency is compared by enum order rather than in SQL, because
     * the column stores the level as a string and would otherwise sort alphabetically.
     */
    private Comparator<ExpertResponse> expertRanking() {
        return Comparator
                .comparingInt((ExpertResponse expert) -> expert.getProficiencyLevel().ordinal()).reversed()
                .thenComparing(ExpertResponse::getMentorRating,
                        Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(Comparator.comparingLong(ExpertResponse::getCompletedMentorships).reversed())
                .thenComparing(ExpertResponse::getRatingScore,
                        Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(ExpertResponse::getFullName,
                        Comparator.nullsLast(Comparator.naturalOrder()));
    }

    private ExpertResponse toResponse(UserSkill match, HostRatingAggregate hostRating, long completedMentorships) {
        User expert = match.getUser();
        Double mentorRating = hostRating != null && hostRating.getAverageRating() != null
                ? Math.round(hostRating.getAverageRating() * 100.0) / 100.0
                : null;
        long mentorRatingCount = hostRating != null && hostRating.getRatingCount() != null
                ? hostRating.getRatingCount()
                : 0L;

        return ExpertResponse.builder()
                .employeeId(expert.getId())
                .fullName(expert.getFullName())
                .email(expert.getEmail())
                .department(expert.getDepartment())
                .jobTitle(expert.getJobTitle())
                .skillId(match.getSkill().getId())
                .skillName(match.getSkill().getName())
                .proficiencyLevel(match.getProficiencyLevel())
                .ratingScore(match.getRatingScore())
                .mentorRating(mentorRating)
                .mentorRatingCount(mentorRatingCount)
                .completedMentorships(completedMentorships)
                .build();
    }
}
