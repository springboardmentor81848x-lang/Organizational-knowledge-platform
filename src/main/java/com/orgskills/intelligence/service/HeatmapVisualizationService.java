package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.heatmap.DepartmentHeatmapMatrixResponse;
import com.orgskills.intelligence.dto.heatmap.DepartmentHeatmapMatrixResponse.DepartmentSkillCell;
import com.orgskills.intelligence.dto.heatmap.HeatmapMatrixCellResponse;
import com.orgskills.intelligence.dto.heatmap.HeatmapMatrixResponse;
import com.orgskills.intelligence.dto.heatmap.HeatmapMatrixResponse.SkillHeader;
import com.orgskills.intelligence.dto.heatmap.HeatmapMatrixResponse.UserHeader;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HeatmapVisualizationService {

    public static final String COLOR_HIGH = "#22c55e";   // Green
    public static final String COLOR_MEDIUM = "#f59e0b"; // Amber
    public static final String COLOR_LOW = "#ef4444";    // Red

    public static final String LEVEL_HIGH = "HIGH";
    public static final String LEVEL_MEDIUM = "MEDIUM";
    public static final String LEVEL_LOW = "LOW";

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final RoleCompetencyRepository roleCompetencyRepository;
    private final GapAnalysisRepository gapAnalysisRepository;
    private final GapAnalysisService gapAnalysisService;

    /**
     * Build organization or department-scoped User x Skill Heatmap Matrix
     */
    @Transactional(readOnly = true)
    public HeatmapMatrixResponse getHeatmapMatrix(String department, String category) {
        List<User> users = department != null && !department.isBlank()
                ? userRepository.findByDepartmentIgnoreCase(department.trim())
                : userRepository.findAll();

        if (users.isEmpty()) {
            return buildEmptyHeatmapResponse(department != null ? "DEPARTMENT" : "ORG", department);
        }

        List<Long> userIds = users.stream().map(User::getId).toList();
        List<GapAnalysis> storedGaps = gapAnalysisRepository.findByUserIdIn(userIds);

        // If no stored gaps exist yet, trigger calculation for these users
        if (storedGaps.isEmpty()) {
            for (User user : users) {
                try {
                    gapAnalysisService.calculateAndFetchUserGaps(user.getId());
                } catch (Exception e) {
                    log.warn("Could not calculate gaps for user {}: {}", user.getId(), e.getMessage());
                }
            }
            storedGaps = gapAnalysisRepository.findByUserIdIn(userIds);
        }

        // Apply skill category filter if requested
        if (category != null && !category.isBlank()) {
            String catTrim = category.trim();
            storedGaps = storedGaps.stream()
                    .filter(g -> g.getSkill() != null && catTrim.equalsIgnoreCase(g.getSkill().getCategory()))
                    .toList();
        }

        // Extract headers
        Map<Long, SkillHeader> skillHeadersMap = new LinkedHashMap<>();
        Map<Long, UserHeader> userHeadersMap = new LinkedHashMap<>();
        List<HeatmapMatrixCellResponse> cells = new ArrayList<>();

        Map<String, Long> levelCounts = new LinkedHashMap<>();
        levelCounts.put(LEVEL_HIGH, 0L);
        levelCounts.put(LEVEL_MEDIUM, 0L);
        levelCounts.put(LEVEL_LOW, 0L);

        for (GapAnalysis gap : storedGaps) {
            User user = gap.getUser();
            Skill skill = gap.getSkill();

            if (user == null || skill == null) continue;

            userHeadersMap.putIfAbsent(user.getId(), UserHeader.builder()
                    .userId(user.getId())
                    .userName(user.getFullName())
                    .department(user.getDepartment())
                    .jobTitle(user.getJobTitle())
                    .build());

            skillHeadersMap.putIfAbsent(skill.getId(), SkillHeader.builder()
                    .skillId(skill.getId())
                    .skillName(skill.getName())
                    .category(skill.getCategory())
                    .build());

            double currentScore = gap.getCurrentScore();
            double targetScore = gap.getTargetScore();
            double gapScore = gap.getGapScore();
            boolean isMissing = currentScore == 0.0;

            String skillLevel = determineSkillLevel(currentScore, gapScore);
            String colorCode = getColorCodeForLevel(skillLevel);

            levelCounts.put(skillLevel, levelCounts.get(skillLevel) + 1);

            cells.add(HeatmapMatrixCellResponse.builder()
                    .userId(user.getId())
                    .userName(user.getFullName())
                    .department(user.getDepartment())
                    .jobTitle(user.getJobTitle())
                    .skillId(skill.getId())
                    .skillName(skill.getName())
                    .category(skill.getCategory())
                    .currentProficiency(currentScore)
                    .currentProficiencyLabel(scoreToProficiencyLabel(currentScore))
                    .targetProficiency(targetScore)
                    .targetProficiencyLabel(scoreToProficiencyLabel(targetScore))
                    .gapScore(gapScore)
                    .skillLevel(skillLevel)
                    .gapSeverity(gap.getRiskSeverity())
                    .colorCode(colorCode)
                    .missingSkill(isMissing)
                    .build());
        }

        List<SkillHeader> skillHeaders = skillHeadersMap.values().stream()
                .sorted(Comparator.comparing(SkillHeader::getSkillName))
                .toList();

        List<UserHeader> userHeaders = userHeadersMap.values().stream()
                .sorted(Comparator.comparing(UserHeader::getUserName))
                .toList();

        return HeatmapMatrixResponse.builder()
                .scope(department != null ? "DEPARTMENT" : "ORG")
                .scopeName(department != null ? department : "All Departments")
                .totalUsers(userHeaders.size())
                .totalSkills(skillHeaders.size())
                .skills(skillHeaders)
                .users(userHeaders)
                .matrix(cells)
                .levelCounts(levelCounts)
                .colorLegend(getColorLegendMap())
                .generatedAt(Instant.now())
                .build();
    }

    /**
     * Build Department x Skill Heatmap Matrix
     */
    @Transactional(readOnly = true)
    public DepartmentHeatmapMatrixResponse getDepartmentHeatmapMatrix() {
        List<GapAnalysis> allGaps = gapAnalysisRepository.findAll();
        if (allGaps.isEmpty()) {
            List<User> users = userRepository.findAll();
            for (User user : users) {
                try {
                    gapAnalysisService.calculateAndFetchUserGaps(user.getId());
                } catch (Exception ignored) {}
            }
            allGaps = gapAnalysisRepository.findAll();
        }

        Map<String, Map<Long, List<GapAnalysis>>> deptSkillMap = allGaps.stream()
                .filter(g -> g.getUser() != null && g.getUser().getDepartment() != null && g.getSkill() != null)
                .collect(Collectors.groupingBy(
                        g -> g.getUser().getDepartment(),
                        Collectors.groupingBy(g -> g.getSkill().getId())
                ));

        Map<Long, SkillHeader> skillHeadersMap = new LinkedHashMap<>();
        List<DepartmentSkillCell> matrixCells = new ArrayList<>();

        Map<String, Long> levelCounts = new LinkedHashMap<>();
        levelCounts.put(LEVEL_HIGH, 0L);
        levelCounts.put(LEVEL_MEDIUM, 0L);
        levelCounts.put(LEVEL_LOW, 0L);

        for (var deptEntry : deptSkillMap.entrySet()) {
            String deptName = deptEntry.getKey();
            for (var skillEntry : deptEntry.getValue().entrySet()) {
                List<GapAnalysis> gaps = skillEntry.getValue();
                if (gaps.isEmpty()) continue;

                Skill skill = gaps.get(0).getSkill();
                skillHeadersMap.putIfAbsent(skill.getId(), SkillHeader.builder()
                        .skillId(skill.getId())
                        .skillName(skill.getName())
                        .category(skill.getCategory())
                        .build());

                double avgCurrent = gaps.stream().mapToDouble(GapAnalysis::getCurrentScore).average().orElse(0.0);
                double avgGap = gaps.stream().mapToDouble(GapAnalysis::getGapScore).average().orElse(0.0);

                String level = determineSkillLevel(avgCurrent, avgGap);
                String colorCode = getColorCodeForLevel(level);

                levelCounts.put(level, levelCounts.get(level) + 1);

                matrixCells.add(DepartmentSkillCell.builder()
                        .department(deptName)
                        .skillId(skill.getId())
                        .skillName(skill.getName())
                        .category(skill.getCategory())
                        .avgProficiency(Math.round(avgCurrent * 100.0) / 100.0)
                        .avgProficiencyLabel(scoreToProficiencyLabel(avgCurrent))
                        .avgGapScore(Math.round(avgGap * 100.0) / 100.0)
                        .skillLevel(level)
                        .colorCode(colorCode)
                        .employeeCount((long) gaps.size())
                        .build());
            }
        }

        List<String> departments = deptSkillMap.keySet().stream().sorted().toList();
        List<SkillHeader> skills = skillHeadersMap.values().stream().sorted(Comparator.comparing(SkillHeader::getSkillName)).toList();

        return DepartmentHeatmapMatrixResponse.builder()
                .totalDepartments(departments.size())
                .totalSkills(skills.size())
                .departments(departments)
                .skills(skills)
                .matrix(matrixCells)
                .levelCounts(levelCounts)
                .colorLegend(getColorLegendMap())
                .generatedAt(Instant.now())
                .build();
    }

    /**
     * Build User-Specific Heatmap Matrix
     */
    @Transactional(readOnly = true)
    public HeatmapMatrixResponse getUserHeatmap(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));

        List<GapAnalysisResponseDto> gaps = gapAnalysisService.getStoredUserGaps(userId).stream()
                .map(g -> new GapAnalysisResponseDto(
                        g.getSkillId(),
                        g.getSkillName(),
                        g.getSkillCategory(),
                        g.getCurrentScore(),
                        g.getTargetScore(),
                        g.getGapScore(),
                        g.getRiskSeverity(),
                        g.isMissingSkill()))
                .toList();

        List<SkillHeader> skills = gaps.stream()
                .map(g -> SkillHeader.builder()
                        .skillId(g.skillId())
                        .skillName(g.skillName())
                        .category(g.category())
                        .build())
                .toList();

        UserHeader userHeader = UserHeader.builder()
                .userId(user.getId())
                .userName(user.getFullName())
                .department(user.getDepartment())
                .jobTitle(user.getJobTitle())
                .build();

        Map<String, Long> levelCounts = new LinkedHashMap<>();
        levelCounts.put(LEVEL_HIGH, 0L);
        levelCounts.put(LEVEL_MEDIUM, 0L);
        levelCounts.put(LEVEL_LOW, 0L);

        List<HeatmapMatrixCellResponse> cells = gaps.stream().map(g -> {
            String level = determineSkillLevel(g.currentScore(), g.gapScore());
            String colorCode = getColorCodeForLevel(level);

            levelCounts.put(level, levelCounts.get(level) + 1);

            return HeatmapMatrixCellResponse.builder()
                    .userId(user.getId())
                    .userName(user.getFullName())
                    .department(user.getDepartment())
                    .jobTitle(user.getJobTitle())
                    .skillId(g.skillId())
                    .skillName(g.skillName())
                    .category(g.category())
                    .currentProficiency(g.currentScore())
                    .currentProficiencyLabel(scoreToProficiencyLabel(g.currentScore()))
                    .targetProficiency(g.targetScore())
                    .targetProficiencyLabel(scoreToProficiencyLabel(g.targetScore()))
                    .gapScore(g.gapScore())
                    .skillLevel(level)
                    .gapSeverity(g.severity())
                    .colorCode(colorCode)
                    .missingSkill(g.isMissing())
                    .build();
        }).toList();

        return HeatmapMatrixResponse.builder()
                .scope("USER")
                .scopeName(user.getFullName())
                .totalUsers(1)
                .totalSkills(skills.size())
                .skills(skills)
                .users(List.of(userHeader))
                .matrix(cells)
                .levelCounts(levelCounts)
                .colorLegend(getColorLegendMap())
                .generatedAt(Instant.now())
                .build();
    }

    /**
     * Organization-wide Summary Metrics for dashboard widgets
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getHeatmapSummaryMetrics() {
        HeatmapMatrixResponse matrix = getHeatmapMatrix(null, null);

        long totalCells = matrix.getMatrix().size();
        Map<String, Long> counts = matrix.getLevelCounts();

        double highPct = totalCells > 0 ? (counts.getOrDefault(LEVEL_HIGH, 0L) * 100.0) / totalCells : 0.0;
        double medPct = totalCells > 0 ? (counts.getOrDefault(LEVEL_MEDIUM, 0L) * 100.0) / totalCells : 0.0;
        double lowPct = totalCells > 0 ? (counts.getOrDefault(LEVEL_LOW, 0L) * 100.0) / totalCells : 0.0;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalAssessedGaps", totalCells);
        summary.put("totalUsers", matrix.getTotalUsers());
        summary.put("totalSkills", matrix.getTotalSkills());
        summary.put("levelCounts", counts);
        summary.put("levelPercentages", Map.of(
                LEVEL_HIGH, Math.round(highPct * 100.0) / 100.0,
                LEVEL_MEDIUM, Math.round(medPct * 100.0) / 100.0,
                LEVEL_LOW, Math.round(lowPct * 100.0) / 100.0
        ));
        summary.put("colorLegend", getColorLegendMap());

        return summary;
    }

    // ── Helper Methods ─────────────────────────────────────────────────────────

    public String determineSkillLevel(double currentProficiencyScore, double gapScore) {
        if (currentProficiencyScore >= 4.0 || gapScore == 0.0) {
            return LEVEL_HIGH;
        } else if (currentProficiencyScore >= 2.5 || gapScore <= 1.5) {
            return LEVEL_MEDIUM;
        } else {
            return LEVEL_LOW;
        }
    }

    public String getColorCodeForLevel(String skillLevel) {
        if (LEVEL_HIGH.equalsIgnoreCase(skillLevel)) return COLOR_HIGH;
        if (LEVEL_MEDIUM.equalsIgnoreCase(skillLevel)) return COLOR_MEDIUM;
        return COLOR_LOW;
    }

    public Map<String, String> getColorLegendMap() {
        Map<String, String> legend = new LinkedHashMap<>();
        legend.put(LEVEL_HIGH, COLOR_HIGH);
        legend.put(LEVEL_MEDIUM, COLOR_MEDIUM);
        legend.put(LEVEL_LOW, COLOR_LOW);
        return legend;
    }

    private String scoreToProficiencyLabel(double score) {
        return ProficiencyLevel.fromScore(score).name();
    }

    private HeatmapMatrixResponse buildEmptyHeatmapResponse(String scope, String scopeName) {
        return HeatmapMatrixResponse.builder()
                .scope(scope)
                .scopeName(scopeName != null ? scopeName : "All")
                .totalUsers(0)
                .totalSkills(0)
                .skills(List.of())
                .users(List.of())
                .matrix(List.of())
                .levelCounts(Map.of(LEVEL_HIGH, 0L, LEVEL_MEDIUM, 0L, LEVEL_LOW, 0L))
                .colorLegend(getColorLegendMap())
                .generatedAt(Instant.now())
                .build();
    }

    private record GapAnalysisResponseDto(
            Long skillId,
            String skillName,
            String category,
            Double currentScore,
            Double targetScore,
            Double gapScore,
            RiskSeverity severity,
            boolean isMissing
    ) {}
}
