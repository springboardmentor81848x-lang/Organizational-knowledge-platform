package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.gap.DepartmentGapMetricsResponse;
import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.gap.OrgGapMetricsResponse;
import com.orgskills.intelligence.dto.gap.UserGapSummaryResponse;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GapAnalysisService {

    /**
     * What the platform expects of a skill somebody claims that no role profile mentions.
     *
     * <p>INTERMEDIATE reads as "can work in this unsupervised", which is the weakest thing that
     * putting a skill on your own profile can reasonably be taken to mean. It is a fallback, not
     * a policy: as soon as any role defines a requirement for the skill, that requirement is
     * used instead - see gapsForSkillsOutsideTheProfile.
     */
    private static final ProficiencyLevel DEFAULT_BENCHMARK_FOR_UNPROFILED_SKILL =
            ProficiencyLevel.INTERMEDIATE;

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final RoleCompetencyRepository roleCompetencyRepository;
    private final GapAnalysisRepository gapAnalysisRepository;
    private final NotificationService notificationService;
    private final RecommendationService recommendationService;
    private final LearningPathService learningPathService;
    private final AnalyticsCacheInvalidator analyticsCacheInvalidator;
    private final PlatformTransactionManager transactionManager;

    /**
     * Runs the cold-start gap calculation in a writable transaction of its own.
     *
     * <p>{@link #getStoredUserGaps} calculates gaps when a person has none yet, and it is called
     * from read-only callers - the personal heatmap among them. On H2 that was harmless, because
     * read-only was advisory there. PostgreSQL issues SET TRANSACTION READ ONLY, so the insert
     * fails with SQLSTATE 25006 and takes the whole request with it. Used only when the current
     * transaction really is read-only; see the call site for why it must not be used otherwise.
     */
    private TransactionTemplate writableTransaction;

    @PostConstruct
    void initWritableTransaction() {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.writableTransaction = template;
    }

    public GapAnalysisService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            RoleCompetencyRepository roleCompetencyRepository,
            GapAnalysisRepository gapAnalysisRepository,
            NotificationService notificationService,
            RecommendationService recommendationService,
            @Lazy LearningPathService learningPathService,
            AnalyticsCacheInvalidator analyticsCacheInvalidator,
            PlatformTransactionManager transactionManager
    ) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.roleCompetencyRepository = roleCompetencyRepository;
        this.gapAnalysisRepository = gapAnalysisRepository;
        this.notificationService = notificationService;
        this.recommendationService = recommendationService;
        this.learningPathService = learningPathService;
        this.analyticsCacheInvalidator = analyticsCacheInvalidator;
        this.transactionManager = transactionManager;
    }

    @Transactional
    public List<GapAnalysisResponse> calculateAndFetchUserGaps(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));

        Map<Long, UserSkill> userSkillBySkillId = userSkillRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(us -> us.getSkill().getId(), Function.identity(), (a, b) -> a));

        List<RoleCompetency> requiredCompetencies = resolveMeasuringProfile(user, !userSkillBySkillId.isEmpty());

        gapAnalysisRepository.deleteByUserId(userId);

        List<GapAnalysis> gaps = new ArrayList<>(requiredCompetencies.stream()
                .map(rc -> buildGap(user, rc.getSkill(),
                        rc.getRequiredProficiencyLevel().getScore(),
                        userSkillBySkillId.get(rc.getSkill().getId())))
                .toList());

        // A skill the employee put on their own profile that their role does not ask for still
        // belongs on their heatmap - otherwise adding a skill would visibly do nothing, and the
        // assessment they then take for it would move a number nobody can see.
        gaps.addAll(gapsForSkillsOutsideTheProfile(user, requiredCompetencies, userSkillBySkillId));

        List<GapAnalysis> savedGaps = gaps.stream()
                .sorted(Comparator.comparing(GapAnalysis::getGapScore).reversed())
                .map(gapAnalysisRepository::save)
                .toList();

        // Auto-regenerate recommendations whenever gaps are recalculated
        recommendationService.generateRecommendations(userId);

        try {
            learningPathService.onGapsUpdated(userId, savedGaps);
        } catch (Exception ex) {
            // Ignore optional hook failure
        }

        // Every cached analytics view is built from the gap rows this method just rewrote, so
        // they are now wrong. This is the one place gaps are recalculated - the skill, assessment
        // and learning path flows all arrive here - so invalidating from this single point covers
        // all of them, and does so after the write rather than before it.
        analyticsCacheInvalidator.invalidateAfterCommit();

        return savedGaps.stream().map(this::toResponse).toList();
    }

    /**
     * The competency profile a person's gaps are measured against.
     *
     * <p>The target role wins when one is set, and that is the point of asking for it at
     * sign-up. Their assessment is built from the target role's skills, so measuring the
     * resulting gaps against their *current* job title would compare two different sets of
     * skills: an employee could answer every question on their target role and still see gaps
     * for skills the quiz never asked about, while the shortfalls they had just demonstrated
     * would not appear at all.
     *
     * <p>The current job title remains the fallback, which keeps every account that predates
     * target roles - and every manager, HR and administrator account, which have none - working
     * exactly as before.
     *
     * @param toleratesEmpty when true, an account with no profile at all gets an empty list
     *                       rather than a refusal. That is the case for somebody who has skills
     *                       of their own: those are worth measuring and showing even though
     *                       nobody has defined what their role requires, and refusing outright
     *                       would mean adding a skill failed for exactly those accounts.
     */
    private List<RoleCompetency> resolveMeasuringProfile(User user, boolean toleratesEmpty) {
        String targetTitle = user.getTargetJobTitle();
        String targetDepartment = user.getTargetDepartment();

        if (targetTitle != null && !targetTitle.isBlank()
                && targetDepartment != null && !targetDepartment.isBlank()) {
            List<RoleCompetency> target = roleCompetencyRepository
                    .findByJobTitleIgnoreCaseAndDepartmentIgnoreCase(targetTitle, targetDepartment);
            if (!target.isEmpty()) {
                return target;
            }
            // A target naming a role with no profile falls through rather than failing: the
            // person still has a current role that can be measured, and refusing here would
            // break gap analysis for them entirely over a stale target.
        }

        List<RoleCompetency> current = roleCompetencyRepository
                .findByJobTitleIgnoreCaseAndDepartmentIgnoreCase(user.getJobTitle(), user.getDepartment());
        if (current.isEmpty()) {
            if (toleratesEmpty) {
                return List.of();
            }
            throw new ValidationException("No role competency profile found for "
                    + user.getJobTitle() + " in " + user.getDepartment());
        }
        return current;
    }

    /**
     * Gap rows for skills an employee holds that their measuring profile says nothing about.
     *
     * <h2>What such a skill is measured against</h2>
     * Nothing in the employee's own role requires it, so there is no requirement to read off.
     * Rather than invent a number, the benchmark is the highest level <em>any</em> role in the
     * organisation asks of that skill: it is a real expectation, already agreed and written
     * down, and it moves on its own as the competency profiles are edited. A skill no profile
     * mentions at all falls back to {@link #DEFAULT_BENCHMARK_FOR_UNPROFILED_SKILL}, on the
     * reading that claiming a skill implies being able to work in it unsupervised.
     *
     * <p>These rows are marked {@code missingSkill = false}: the employee has the skill on
     * record. What they may not have yet is a level for it, and that shows as a full-height gap
     * until the assessment covering it is marked - which is exactly the prompt to go and sit it.
     */
    private List<GapAnalysis> gapsForSkillsOutsideTheProfile(User user,
                                                             List<RoleCompetency> profile,
                                                             Map<Long, UserSkill> userSkillBySkillId) {
        Set<Long> alreadyMeasured = profile.stream()
                .map(rc -> rc.getSkill().getId())
                .collect(Collectors.toSet());

        List<UserSkill> extras = userSkillBySkillId.values().stream()
                .filter(us -> !alreadyMeasured.contains(us.getSkill().getId()))
                .toList();
        if (extras.isEmpty()) {
            return List.of();
        }

        List<Long> extraSkillIds = extras.stream().map(us -> us.getSkill().getId()).toList();
        Map<Long, Integer> benchmarkBySkillId = roleCompetencyRepository.findBySkillIdIn(extraSkillIds).stream()
                .collect(Collectors.toMap(
                        rc -> rc.getSkill().getId(),
                        rc -> rc.getRequiredProficiencyLevel().getScore(),
                        Math::max));

        return extras.stream()
                .map(us -> buildGap(user, us.getSkill(),
                        benchmarkBySkillId.getOrDefault(us.getSkill().getId(),
                                DEFAULT_BENCHMARK_FOR_UNPROFILED_SKILL.getScore()),
                        us))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GapAnalysisResponse> calculateAndFetchTargetRoleGaps(Long userId, String targetJobTitle, String targetDepartment) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));

        List<RoleCompetency> requiredCompetencies = roleCompetencyRepository
                .findByJobTitleIgnoreCaseAndDepartmentIgnoreCase(targetJobTitle, targetDepartment);
        if (requiredCompetencies.isEmpty()) {
            throw new ValidationException("No role competency profile found for target role: " + targetJobTitle + " in " + targetDepartment);
        }

        Map<Long, UserSkill> userSkillBySkillId = userSkillRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(us -> us.getSkill().getId(), Function.identity(), (a, b) -> a));

        return requiredCompetencies.stream()
                .map(rc -> buildGap(user, rc.getSkill(),
                        rc.getRequiredProficiencyLevel().getScore(),
                        userSkillBySkillId.get(rc.getSkill().getId())))
                .sorted(Comparator.comparing(GapAnalysis::getGapScore).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<GapAnalysisResponse> getStoredUserGaps(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found for id: " + userId);
        }
        List<GapAnalysis> storedGaps = gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(userId);
        if (storedGaps.isEmpty()) {
            // Only escape the surrounding transaction when it is read-only, which is the case
            // this has to solve: PostgreSQL refuses an insert there outright, and the personal
            // heatmap reaches this method that way.
            //
            // Escaping unconditionally would be wrong. A new transaction gets its own
            // connection and cannot see the caller's uncommitted rows, so a caller that had
            // just written the user - or their skills - inside its own read-write transaction
            // would find them missing here and fail with "user not found". Joining the caller
            // whenever it can write preserves that visibility.
            if (TransactionSynchronizationManager.isCurrentTransactionReadOnly()) {
                return writableTransaction.execute(status -> calculateAndFetchUserGaps(userId));
            }
            return calculateAndFetchUserGaps(userId);
        }
        return storedGaps.stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<GapAnalysisResponse> getMissingSkills(Long userId) {
        List<GapAnalysisResponse> allGaps = getStoredUserGaps(userId);
        return allGaps.stream()
                .filter(GapAnalysisResponse::isMissingSkill)
                .toList();
    }

    @Transactional
    public List<GapAnalysisResponse> getProficiencyGaps(Long userId) {
        List<GapAnalysisResponse> allGaps = getStoredUserGaps(userId);
        return allGaps.stream()
                .filter(g -> !g.isMissingSkill() && g.getGapScore() > 0.0)
                .toList();
    }

    @Transactional
    public UserGapSummaryResponse getUserGapSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));

        List<GapAnalysisResponse> gaps = getStoredUserGaps(userId);
        int totalRequired = gaps.size();
        int missingCount = (int) gaps.stream().filter(GapAnalysisResponse::isMissingSkill).count();
        int proficiencyGapCount = (int) gaps.stream().filter(g -> !g.isMissingSkill() && g.getGapScore() > 0.0).count();
        int metCount = totalRequired - missingCount - proficiencyGapCount;

        double totalTargetScore = gaps.stream().mapToDouble(GapAnalysisResponse::getTargetScore).sum();
        double totalCurrentScore = gaps.stream().mapToDouble(GapAnalysisResponse::getCurrentScore).sum();
        double readiness = totalTargetScore > 0 ? Math.min(100.0, (totalCurrentScore / totalTargetScore) * 100.0) : 100.0;
        double avgGap = gaps.stream().mapToDouble(GapAnalysisResponse::getGapScore).average().orElse(0.0);

        Map<String, Long> riskMap = new java.util.LinkedHashMap<>();
        for (RiskSeverity r : RiskSeverity.values()) {
            riskMap.put(r.name(), 0L);
        }
        gaps.forEach(g -> riskMap.put(g.getRiskSeverity().name(), riskMap.get(g.getRiskSeverity().name()) + 1));

        List<GapAnalysisResponse> topCritical = gaps.stream()
                .filter(g -> g.getRiskSeverity() == RiskSeverity.CRITICAL || g.getRiskSeverity() == RiskSeverity.HIGH)
                .limit(5)
                .toList();

        return UserGapSummaryResponse.builder()
                .userId(user.getId())
                .userName(user.getFullName())
                .jobTitle(user.getJobTitle())
                .department(user.getDepartment())
                .totalRequiredSkills(totalRequired)
                .metSkillsCount(metCount)
                .missingSkillsCount(missingCount)
                .proficiencyGapsCount(proficiencyGapCount)
                .overallReadinessPercentage(Math.round(readiness * 100.0) / 100.0)
                .averageGapScore(Math.round(avgGap * 100.0) / 100.0)
                .riskDistribution(riskMap)
                .topCriticalGaps(topCritical)
                .build();
    }

    @Transactional(readOnly = true)
    public DepartmentGapMetricsResponse getDepartmentMetrics(String department) {
        List<User> users = userRepository.findByDepartmentIgnoreCase(department);
        if (users.isEmpty()) {
            throw new ResourceNotFoundException("No users found for department: " + department);
        }

        List<Long> userIds = users.stream().map(User::getId).toList();
        List<GapAnalysis> gaps = gapAnalysisRepository.findByUserIdIn(userIds);
        if (gaps.isEmpty()) {
            throw new ValidationException("No gap analysis records exist for department: " + department
                    + ". Run user gap analysis first.");
        }

        Map<RiskSeverity, Long> severityCounts = new EnumMap<>(RiskSeverity.class);
        for (RiskSeverity severity : RiskSeverity.values()) {
            severityCounts.put(severity, 0L);
        }
        gaps.forEach(g -> severityCounts.put(g.getRiskSeverity(), severityCounts.get(g.getRiskSeverity()) + 1));

        Map<String, Double> skillAverages = gaps.stream()
                .collect(Collectors.groupingBy(
                        g -> g.getSkill().getName(),
                        Collectors.averagingDouble(GapAnalysis::getGapScore)
                ));

        return DepartmentGapMetricsResponse.builder()
                .department(department)
                .employeeCount(users.size())
                .averageGapScore(Math.round(gaps.stream().mapToDouble(GapAnalysis::getGapScore).average().orElse(0.0) * 100.0) / 100.0)
                .severityDistribution(severityCounts.entrySet().stream()
                        .collect(Collectors.toMap(e -> e.getKey().name(), Map.Entry::getValue)))
                .skillGapAverages(skillAverages)
                .build();
    }

    @Transactional(readOnly = true)
    public OrgGapMetricsResponse getOrgGapMetrics() {
        List<User> allUsers = userRepository.findAll();
        List<GapAnalysis> allGaps = gapAnalysisRepository.findAll();

        if (allGaps.isEmpty()) {
            return OrgGapMetricsResponse.builder()
                    .totalEmployees(allUsers.size())
                    .totalAnalyzedGaps(0)
                    .overallAverageGapScore(0.0)
                    .overallReadinessPercentage(100.0)
                    .riskDistribution(Map.of())
                    .departmentAverageGaps(Map.of())
                    .topMissingSkills(List.of())
                    .build();
        }

        double totalTarget = allGaps.stream().mapToDouble(GapAnalysis::getTargetScore).sum();
        double totalCurrent = allGaps.stream().mapToDouble(GapAnalysis::getCurrentScore).sum();
        double readiness = totalTarget > 0 ? Math.min(100.0, (totalCurrent / totalTarget) * 100.0) : 100.0;
        double overallAvgGap = allGaps.stream().mapToDouble(GapAnalysis::getGapScore).average().orElse(0.0);

        Map<String, Long> riskMap = new java.util.LinkedHashMap<>();
        for (RiskSeverity r : RiskSeverity.values()) {
            riskMap.put(r.name(), 0L);
        }
        allGaps.forEach(g -> riskMap.put(g.getRiskSeverity().name(), riskMap.get(g.getRiskSeverity().name()) + 1));

        Map<String, Double> deptAverages = allGaps.stream()
                .collect(Collectors.groupingBy(
                        g -> g.getUser().getDepartment(),
                        Collectors.averagingDouble(GapAnalysis::getGapScore)
                ));

        Map<Long, List<GapAnalysis>> missingBySkill = allGaps.stream()
                .filter(g -> Boolean.TRUE.equals(g.getMissingSkill()))
                .collect(Collectors.groupingBy(g -> g.getSkill().getId()));

        List<OrgGapMetricsResponse.SkillGapSummary> topMissing = missingBySkill.entrySet().stream()
                .map(e -> {
                    List<GapAnalysis> skillGaps = e.getValue();
                    var first = skillGaps.get(0);
                    double avgScore = skillGaps.stream().mapToDouble(GapAnalysis::getGapScore).average().orElse(0.0);
                    return OrgGapMetricsResponse.SkillGapSummary.builder()
                            .skillId(first.getSkill().getId())
                            .skillName(first.getSkill().getName())
                            .category(first.getSkill().getCategory())
                            .affectedEmployeesCount(skillGaps.size())
                            .averageGapScore(Math.round(avgScore * 100.0) / 100.0)
                            .build();
                })
                .sorted(Comparator.comparingLong(OrgGapMetricsResponse.SkillGapSummary::getAffectedEmployeesCount).reversed())
                .limit(10)
                .toList();

        return OrgGapMetricsResponse.builder()
                .totalEmployees(allUsers.size())
                .totalAnalyzedGaps(allGaps.size())
                .overallAverageGapScore(Math.round(overallAvgGap * 100.0) / 100.0)
                .overallReadinessPercentage(Math.round(readiness * 100.0) / 100.0)
                .riskDistribution(riskMap)
                .departmentAverageGaps(deptAverages)
                .topMissingSkills(topMissing)
                .build();
    }

    private GapAnalysis buildGap(User user, Skill skill, double target, UserSkill userSkill) {
        double current = userSkill == null || userSkill.getProficiencyLevel() == null
                ? 0.0
                : userSkill.getProficiencyLevel().getScore();
        double gapScore = Math.max(0.0, target - current);
        RiskSeverity severity = RiskSeverity.fromGapScore(gapScore);

        GapAnalysis gap = new GapAnalysis();
        gap.setUser(user);
        gap.setSkill(skill);
        gap.setTargetScore(target);
        gap.setCurrentScore(current);
        gap.setGapScore(gapScore);
        gap.setRiskSeverity(severity);
        gap.setMissingSkill(userSkill == null);

        // HIGH and CRITICAL gaps alert the employee; the service decides which severities qualify.
        notificationService.createGapAlert(user, skill, gapScore, severity);
        return gap;
    }



    /** Labels a score on the canonical scale. Missing skills are labelled by the caller. */
    private String scoreToProficiencyLabel(double score) {
        return ProficiencyLevel.fromScore(score).name();
    }


    public GapAnalysisResponse toResponse(GapAnalysis gap) {
        boolean missing = Boolean.TRUE.equals(gap.getMissingSkill());
        return GapAnalysisResponse.builder()
                .id(gap.getId())
                .userId(gap.getUser().getId())
                .userName(gap.getUser().getFullName())
                .skillId(gap.getSkill().getId())
                .skillName(gap.getSkill().getName())
                .skillCategory(gap.getSkill().getCategory())
                .targetScore(gap.getTargetScore())
                .currentScore(gap.getCurrentScore())
                .gapScore(gap.getGapScore())
                .targetProficiency(scoreToProficiencyLabel(gap.getTargetScore()))
                .currentProficiency(missing ? "NONE" : scoreToProficiencyLabel(gap.getCurrentScore()))
                .isMissingSkill(missing)
                .riskSeverity(gap.getRiskSeverity())
                .build();
    }
}
