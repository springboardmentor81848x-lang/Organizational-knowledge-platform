package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.gap.DepartmentGapMetricsResponse;
import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.gap.OrgGapMetricsResponse;
import com.orgskills.intelligence.dto.gap.UserGapSummaryResponse;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.RoleCompetency;
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
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GapAnalysisService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final RoleCompetencyRepository roleCompetencyRepository;
    private final GapAnalysisRepository gapAnalysisRepository;
    private final NotificationService notificationService;
    private final RecommendationService recommendationService;
    private final LearningPathService learningPathService;

    public GapAnalysisService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            RoleCompetencyRepository roleCompetencyRepository,
            GapAnalysisRepository gapAnalysisRepository,
            NotificationService notificationService,
            RecommendationService recommendationService,
            @Lazy LearningPathService learningPathService
    ) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.roleCompetencyRepository = roleCompetencyRepository;
        this.gapAnalysisRepository = gapAnalysisRepository;
        this.notificationService = notificationService;
        this.recommendationService = recommendationService;
        this.learningPathService = learningPathService;
    }

    @Transactional
    public List<GapAnalysisResponse> calculateAndFetchUserGaps(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));

        List<RoleCompetency> requiredCompetencies = roleCompetencyRepository
                .findByJobTitleIgnoreCaseAndDepartmentIgnoreCase(user.getJobTitle(), user.getDepartment());
        if (requiredCompetencies.isEmpty()) {
            throw new ValidationException("No role competency profile found for " + user.getJobTitle() + " in " + user.getDepartment());
        }

        Map<Long, UserSkill> userSkillBySkillId = userSkillRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(us -> us.getSkill().getId(), Function.identity(), (a, b) -> a));

        gapAnalysisRepository.deleteByUserId(userId);

        List<GapAnalysis> savedGaps = requiredCompetencies.stream()
                .map(rc -> buildGap(user, rc, userSkillBySkillId.get(rc.getSkill().getId())))
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

        return savedGaps.stream().map(this::toResponse).toList();
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
                .map(rc -> buildGap(user, rc, userSkillBySkillId.get(rc.getSkill().getId())))
                .sorted(Comparator.comparing(GapAnalysis::getGapScore).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GapAnalysisResponse> getStoredUserGaps(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found for id: " + userId);
        }
        List<GapAnalysis> storedGaps = gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(userId);
        if (storedGaps.isEmpty()) {
            return calculateAndFetchUserGaps(userId);
        }
        return storedGaps.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<GapAnalysisResponse> getMissingSkills(Long userId) {
        List<GapAnalysisResponse> allGaps = getStoredUserGaps(userId);
        return allGaps.stream()
                .filter(GapAnalysisResponse::isMissingSkill)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GapAnalysisResponse> getProficiencyGaps(Long userId) {
        List<GapAnalysisResponse> allGaps = getStoredUserGaps(userId);
        return allGaps.stream()
                .filter(g -> !g.isMissingSkill() && g.getGapScore() > 0.0)
                .toList();
    }

    @Transactional(readOnly = true)
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

    private GapAnalysis buildGap(User user, RoleCompetency roleCompetency, UserSkill userSkill) {
        double target = roleCompetency.getRequiredProficiencyLevel().getScore();
        double current = userSkill == null ? 0.0 : userSkill.getProficiencyLevel().getScore();
        double gapScore = Math.max(0.0, target - current);
        RiskSeverity severity = classifyRisk(gapScore);

        GapAnalysis gap = new GapAnalysis();
        gap.setUser(user);
        gap.setSkill(roleCompetency.getSkill());
        gap.setTargetScore(target);
        gap.setCurrentScore(current);
        gap.setGapScore(gapScore);
        gap.setRiskSeverity(severity);
        gap.setMissingSkill(userSkill == null);

        if (severity == RiskSeverity.CRITICAL) {
            notificationService.createGapAlert(user, roleCompetency.getSkill(), gapScore);
        }
        return gap;
    }



    /** Labels a score on the canonical scale. Missing skills are labelled by the caller. */
    private String scoreToProficiencyLabel(double score) {
        return ProficiencyLevel.fromScore(score).name();
    }

    private RiskSeverity classifyRisk(double gapScore) {
        if (gapScore >= 3.0) {
            return RiskSeverity.CRITICAL;
        }
        if (gapScore >= 2.0) {
            return RiskSeverity.HIGH;
        }
        if (gapScore >= 1.0) {
            return RiskSeverity.MEDIUM;
        }
        return RiskSeverity.LOW;
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
