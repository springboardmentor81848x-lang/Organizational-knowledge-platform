package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.skill.UserSkillRequest;
import com.orgskills.intelligence.dto.skill.UserSkillResponse;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.AssessmentResultRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class UserSkillService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final GapAnalysisService gapAnalysisService;

    /**
     * Runs the post-commit recalculation in a transaction of its own.
     *
     * <p>A plain {@code @Transactional} call from an after-commit callback is not enough: the
     * original transaction is still completing at that point, so a REQUIRED propagation joins it
     * and the recalculated gaps are written into a transaction that will never commit — the work
     * runs, and is then silently discarded. REQUIRES_NEW forces a real second transaction that
     * commits on its own.
     */
    private final TransactionTemplate freshTransaction;

    private final AnalyticsCacheInvalidator analyticsCacheInvalidator;

    public UserSkillService(
            UserRepository userRepository,
            SkillRepository skillRepository,
            UserSkillRepository userSkillRepository,
            AssessmentResultRepository assessmentResultRepository,
            @Lazy GapAnalysisService gapAnalysisService,
            PlatformTransactionManager transactionManager,
            AnalyticsCacheInvalidator analyticsCacheInvalidator
    ) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.assessmentResultRepository = assessmentResultRepository;
        this.gapAnalysisService = gapAnalysisService;
        this.analyticsCacheInvalidator = analyticsCacheInvalidator;

        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.freshTransaction = template;
    }

    /**
     * Annotated rather than relying on open-session-in-view: the response is mapped from lazy
     * skill associations, and a caller that is not a web request - a scheduled job, another
     * service, a test - has no session for those to initialise in.
     */
    @Transactional(readOnly = true)
    public List<UserSkillResponse> getUserSkills(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found for id: " + userId);
        }
        // One query for the whole set rather than one per row: which skills have been marked is
        // the same question for every skill in the list.
        Set<Long> assessed = assessmentResultRepository.findAssessedSkillIds(userId);
        return userSkillRepository.findByUserId(userId).stream()
                .map(userSkill -> toResponse(userSkill, !assessed.contains(userSkill.getSkill().getId())))
                .toList();
    }

    /**
     * The skills this person has on record but has never been assessed on.
     *
     * <p>This is what a newly added skill produces, and what the assessment module builds a
     * paper from so that the level - and through it the gap and the heatmap cell - comes from
     * marked answers rather than from the act of adding the skill.
     */
    @Transactional(readOnly = true)
    public List<Long> getUnassessedSkillIds(Long userId) {
        Set<Long> assessed = assessmentResultRepository.findAssessedSkillIds(userId);
        return userSkillRepository.findByUserId(userId).stream()
                .map(userSkill -> userSkill.getSkill().getId())
                .filter(skillId -> !assessed.contains(skillId))
                .distinct()
                .toList();
    }

    /**
     * Puts a skill on somebody's profile, unassessed.
     *
     * <p>Whatever level the request carries is ignored. Adding a skill is a claim that it is
     * part of your work; it is not evidence of how good you are at it, and the level is the
     * number that colours the gap heatmap and decides what training the organisation buys. So
     * the skill goes on at UNAWARE and the employee is offered an assessment covering it - once
     * that is marked, the level, the gap and the heatmap cell all move together.
     *
     * <p>UNAWARE rather than null because every consumer downstream reads the level, and the
     * response's {@code awaitingAssessment} flag is what tells a screen this is "not measured
     * yet" rather than "measured, and the answer was nothing".
     */
    @Transactional
    public UserSkillResponse addSkillToUser(Long userId, UserSkillRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + request.getSkillId()));

        userSkillRepository.findByUserIdAndSkillId(userId, request.getSkillId())
                .ifPresent(existing -> {
                    throw new ValidationException("User already has skill '" + skill.getName() + "' assigned");
                });

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setProficiencyLevel(ProficiencyLevel.UNAWARE);
        userSkill.setRatingScore((double) ProficiencyLevel.UNAWARE.getScore());

        UserSkill saved = userSkillRepository.save(userSkill);
        triggerAdaptiveReRanking(userId);

        // Never already assessed: the duplicate check above means this skill was not on the
        // profile a moment ago, and a result can only exist for a skill that was.
        return toResponse(saved, true);
    }

    /**
     * Withdrawn. A level is not something the holder of the skill gets to edit.
     *
     * <p>The route is kept, and answers with an explanation, rather than being deleted. It is
     * the endpoint every existing client uses to change a level, and a 404 or a 405 would tell
     * them the address was wrong when the truth is that the operation no longer exists - and
     * would say nothing about where the level comes from instead.
     */
    @Transactional(readOnly = true)
    public UserSkillResponse updateUserSkill(Long userId, Long userSkillId, UserSkillRequest request) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found for id: " + userId);
        }
        UserSkill userSkill = userSkillRepository.findById(userSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("UserSkill not found for id: " + userSkillId));
        if (!userSkill.getUser().getId().equals(userId)) {
            throw new ValidationException("UserSkill does not belong to user " + userId);
        }

        throw new ValidationException("A proficiency level can no longer be set by hand. Levels are "
                + "awarded by a marked assessment, so take the assessment covering '"
                + userSkill.getSkill().getName() + "' instead. Remove the skill if it does not "
                + "belong on this profile.");
    }

    @Transactional
    public void deleteUserSkill(Long userId, Long userSkillId) {
        UserSkill userSkill = userSkillRepository.findById(userSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("UserSkill not found for id: " + userSkillId));
        if (!userSkill.getUser().getId().equals(userId)) {
            throw new ValidationException("UserSkill does not belong to user " + userId);
        }
        userSkillRepository.delete(userSkill);
        triggerAdaptiveReRanking(userId);
    }

    /**
     * Recalculates the person's gaps after their skills change.
     *
     * <p>This is a side effect, not the point of the request. Somebody recording that they know
     * React must not be refused because their job title has no competency profile to measure
     * them against — which is the normal state for a VP, an HR specialist or an administrator,
     * since profiles are defined for the roles the organisation measures.
     *
     * <p>Catching the failure is not enough on its own, and that is what made this a 500 rather
     * than the quiet skip it was written to be. {@code calculateAndFetchUserGaps} is
     * transactional, so it joins the caller's transaction; when it throws, Spring marks that
     * shared transaction rollback-only. The catch below then swallowed the exception and let the
     * method return normally, but the commit was already doomed and failed with "Transaction
     * silently rolled back", losing the skill the user had just added.
     *
     * <p>So the recalculation is deferred until after this transaction commits. It then runs in
     * a transaction of its own, sees the saved skill, and can fail without taking the save down
     * with it. The callback still runs before the response is written, so a client that refetches
     * gaps immediately afterwards sees the updated figures.
     */
    private void triggerAdaptiveReRanking(Long userId) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    recalculateQuietly(userId);
                }
            });
            return;
        }
        recalculateQuietly(userId);
    }

    private void recalculateQuietly(Long userId) {
        try {
            freshTransaction.executeWithoutResult(status -> gapAnalysisService.calculateAndFetchUserGaps(userId));
        } catch (Exception ex) {
            // Expected whenever the person's role has no competency profile. Logged rather than
            // ignored outright, so a real failure in the recalculation chain is still findable.
            log.debug("Gap recalculation skipped for user {}: {}", userId, ex.getMessage());
        } finally {
            // In the finally block because the skipped case is exactly the one that would
            // otherwise be missed. A recalculation that ran invalidates the analytics caches
            // itself, but a person whose role has no competency profile still appears in the
            // heatmap as a row of their recorded skills, so the change has to be published even
            // though no gap was recomputed. This runs after the originating transaction has
            // committed, so nothing can refill the caches from the old rows.
            analyticsCacheInvalidator.invalidateNow();
        }
    }

    private UserSkillResponse toResponse(UserSkill userSkill, boolean awaitingAssessment) {
        return UserSkillResponse.builder()
                .id(userSkill.getId())
                .userId(userSkill.getUser().getId())
                .skillId(userSkill.getSkill().getId())
                .skillName(userSkill.getSkill().getName())
                .skillCategory(userSkill.getSkill().getCategory())
                .proficiencyLevel(userSkill.getProficiencyLevel())
                .ratingScore(userSkill.getRatingScore())
                .awaitingAssessment(awaitingAssessment)
                .build();
    }
}
