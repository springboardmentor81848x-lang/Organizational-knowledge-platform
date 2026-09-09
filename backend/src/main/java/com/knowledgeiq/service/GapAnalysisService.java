package com.knowledgeiq.service;

import com.knowledgeiq.dto.*;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GapAnalysisService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private RoleSkillBenchmarkRepository benchmarkRepository;

    @Autowired
    private SkillGapSnapshotRepository snapshotRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    @org.springframework.transaction.annotation.Transactional
    public List<SkillGapDto> recalculateUserGaps(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<SkillGapDto> gaps = calculateUserGaps(userId);
        if (gaps.isEmpty()) {
            return gaps;
        }

        // Retrieve existing snapshots before updating to inspect previous state
        List<SkillGapSnapshot> existingSnapshots = snapshotRepository.findByUserIdOrderBySnapshotDateAsc(userId);
        SkillGapSnapshot previousSnapshot = existingSnapshots.isEmpty() ? null : existingSnapshots.get(existingSnapshots.size() - 1);

        int totalGaps = 0;
        int criticalGaps = 0;
        double totalCurrent = 0;
        double totalRequired = 0;

        for (SkillGapDto gap : gaps) {
            totalCurrent += gap.getCurrentLevel();
            totalRequired += gap.getRequiredLevel();
            if (gap.getCurrentLevel() < gap.getRequiredLevel()) {
                totalGaps++;
                if (gap.getIsCritical() != null && gap.getIsCritical()) {
                    criticalGaps++;
                }
            }
        }

        double avgGapScore = gaps.stream().mapToInt(SkillGapDto::getCurrentLevel).average().orElse(0.0);
        int gapPercent = totalRequired > 0 ? (int) Math.round(((totalRequired - totalCurrent) / totalRequired) * 100) : 0;
        gapPercent = Math.max(0, gapPercent);

        // Delete any snapshot for today to prevent database duplicates
        java.time.ZonedDateTime todayStart = java.time.ZonedDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        java.time.ZonedDateTime todayEnd = java.time.ZonedDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        List<SkillGapSnapshot> todaySnapshots = existingSnapshots.stream()
                .filter(s -> s.getSnapshotDate() != null && s.getSnapshotDate().isAfter(todayStart) && s.getSnapshotDate().isBefore(todayEnd))
                .collect(Collectors.toList());
        if (!todaySnapshots.isEmpty()) {
            snapshotRepository.deleteAll(todaySnapshots);
        }

        // Save new snapshot
        SkillGapSnapshot snapshot = new SkillGapSnapshot(user, totalGaps, criticalGaps, avgGapScore, gapPercent);
        snapshotRepository.save(snapshot);

        // GAP -> NOTIFICATION INTEGRATION: Process event and deduplicate
        processGapNotifications(user, previousSnapshot, gapPercent, totalGaps, criticalGaps, gaps);

        return gaps;
    }

    private void processGapNotifications(User user, SkillGapSnapshot previousSnapshot, int currentGapPercent, int currentTotalGaps, int currentCriticalGaps, List<SkillGapDto> currentGaps) {
        SkillGapDto topGapSkill = findTopGapSkill(currentGaps);
        String skillName = topGapSkill != null ? topGapSkill.getSkillName() : "Core Domain Skills";
        String skillIdStr = topGapSkill != null ? topGapSkill.getSkillId().toString() : null;
        int skillGapPct = topGapSkill != null ? calculateSkillGapPct(topGapSkill) : currentGapPercent;

        if (previousSnapshot == null) {
            // NEW USER / INITIAL GAP ANALYSIS EVENT
            if (skillGapPct >= 70 || currentCriticalGaps > 0) {
                notificationService.createCriticalGap(user, skillName, skillGapPct, skillIdStr);
            } else {
                notificationService.createGapAlert(user, skillName, skillGapPct, "HIGH", skillIdStr);
            }
            return;
        }

        int previousGapPercent = previousSnapshot.getGapPercent() != null ? previousSnapshot.getGapPercent() : 0;
        int previousTotalGaps = previousSnapshot.getTotalGaps() != null ? previousSnapshot.getTotalGaps() : 0;

        // DEDUPLICATION: Compare previous vs current state
        if (previousGapPercent == currentGapPercent && previousTotalGaps == currentTotalGaps) {
            // NO MEANINGFUL CHANGE - DO NOT CREATE DUPLICATE NOTIFICATION
            return;
        }

        if (previousGapPercent > 0 && currentGapPercent == 0) {
            // GAP_RESOLVED
            notificationService.createGapResolved(user, skillName, skillIdStr);
        } else if (currentGapPercent < previousGapPercent) {
            // GAP_IMPROVED
            notificationService.createGapImproved(user, skillName, previousGapPercent, currentGapPercent, skillIdStr);
        } else if (currentGapPercent > previousGapPercent) {
            // GAP_ALERT or CRITICAL_GAP (Worsened)
            if (currentGapPercent >= 70 || currentCriticalGaps > 0) {
                notificationService.createCriticalGap(user, skillName, currentGapPercent, skillIdStr);
            } else {
                notificationService.createGapAlert(user, skillName, currentGapPercent, "HIGH", skillIdStr);
            }
        } else {
            // GAP_UPDATED
            notificationService.createGapUpdated(user, skillName, currentGapPercent, "MEDIUM", skillIdStr);
        }
    }

    private SkillGapDto findTopGapSkill(List<SkillGapDto> gaps) {
        SkillGapDto top = null;
        int maxGap = -1;
        for (SkillGapDto g : gaps) {
            if (g.getCurrentLevel() < g.getRequiredLevel()) {
                int gapScore = g.getRequiredLevel() - g.getCurrentLevel();
                if (gapScore > maxGap) {
                    maxGap = gapScore;
                    top = g;
                }
            }
        }
        return top;
    }

    private int calculateSkillGapPct(SkillGapDto gap) {
        if (gap.getRequiredLevel() <= 0) return 0;
        int gapScore = Math.max(0, gap.getRequiredLevel() - gap.getCurrentLevel());
        return (int) Math.round(((double) gapScore / gap.getRequiredLevel()) * 100);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<SkillGapDto> calculateUserGaps(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<RoleSkillBenchmark> benchmarks = Collections.emptyList();
        if (user.getRole() != null) {
            benchmarks = benchmarkRepository.findByRoleId(user.getRole().getId());
        }

        // Fallback: If user's specific role has no benchmarks defined, check department roles directly via indexed query
        if (benchmarks.isEmpty() && user.getDepartment() != null) {
            benchmarks = benchmarkRepository.findByDepartmentId(user.getDepartment().getId());
        }

        if (benchmarks.isEmpty()) {
            return Collections.emptyList();
        }

        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findByUserId(userId);

        Map<UUID, Integer> userSkillMap = employeeSkills.stream()
                .collect(Collectors.toMap(es -> es.getSkill().getId(), EmployeeSkill::getProficiencyLevel, (v1, v2) -> v1));

        List<SkillGapDto> gaps = new ArrayList<>();
        for (RoleSkillBenchmark b : benchmarks) {
            Skill skill = b.getSkill();
            int currentLevel = userSkillMap.getOrDefault(skill.getId(), 0);
            int requiredLevel = b.getRequiredLevel();

            gaps.add(new SkillGapDto(
                    skill.getId(),
                    skill.getName(),
                    skill.getCategory() != null ? skill.getCategory().getName() : "General",
                    currentLevel,
                    requiredLevel,
                    b.getIsCritical()
            ));
        }

        return gaps;
    }

    public List<SkillGapDto> calculateTeamGaps(UUID teamId) {
        return calculateDepartmentGaps(teamId);
    }

    public List<SkillGapDto> calculateDepartmentGaps(UUID deptId) {
        List<User> users = userRepository.findByDepartmentId(deptId);
        
        Map<UUID, SkillGapDto> aggregateGaps = new HashMap<>();
        Map<UUID, Integer> skillCounts = new HashMap<>();

        for (User user : users) {
            List<SkillGapDto> userGaps = calculateUserGaps(user.getId());
            for (SkillGapDto gap : userGaps) {
                SkillGapDto existing = aggregateGaps.get(gap.getSkillId());
                if (existing == null) {
                    existing = new SkillGapDto(gap.getSkillId(), gap.getSkillName(), gap.getCategoryName(), gap.getCurrentLevel(), gap.getRequiredLevel(), gap.getIsCritical());
                    aggregateGaps.put(gap.getSkillId(), existing);
                    skillCounts.put(gap.getSkillId(), 1);
                } else {
                    existing.setCurrentLevel(existing.getCurrentLevel() + gap.getCurrentLevel());
                    existing.setRequiredLevel(existing.getRequiredLevel() + gap.getRequiredLevel());
                    skillCounts.put(gap.getSkillId(), skillCounts.get(gap.getSkillId()) + 1);
                }
            }
        }

        for (Map.Entry<UUID, SkillGapDto> entry : aggregateGaps.entrySet()) {
            int count = skillCounts.get(entry.getKey());
            SkillGapDto gap = entry.getValue();
            gap.setCurrentLevel((int) Math.round((double) gap.getCurrentLevel() / count));
            gap.setRequiredLevel((int) Math.round((double) gap.getRequiredLevel() / count));
        }

        return new ArrayList<>(aggregateGaps.values());
    }

    public HeatmapResponseDto getScopedHeatmap(User currentUser) {
        if (currentUser == null) {
            return new HeatmapResponseDto("PERSONAL", "Anonymous", Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), Collections.emptyMap());
        }

        SystemRole sysRole = currentUser.getSystemRole();
        String roleTitle = currentUser.getRole() != null ? currentUser.getRole().getTitle() : "";
        boolean isManagerOrHead = sysRole == SystemRole.MANAGER || sysRole == SystemRole.DEPARTMENT_HEAD ||
                roleTitle.toLowerCase().contains("manager") || roleTitle.toLowerCase().contains("head") || roleTitle.toLowerCase().contains("lead");

        boolean isHrOrAdmin = sysRole == SystemRole.HR_SPECIALIST || sysRole == SystemRole.SYSTEM_ADMIN || sysRole == SystemRole.L_AND_D_ADMIN;

        if (isHrOrAdmin) {
            return buildOrganizationHeatmap(currentUser);
        } else if (isManagerOrHead) {
            return buildDepartmentHeatmap(currentUser);
        } else {
            return buildPersonalHeatmap(currentUser);
        }
    }

    private HeatmapResponseDto buildPersonalHeatmap(User user) {
        List<SkillGapDto> gaps = calculateUserGaps(user.getId());
        
        List<String> rows = List.of(user.getFullName());
        List<String> cols = new ArrayList<>();
        List<List<Integer>> values = new ArrayList<>();
        List<Integer> rowValues = new ArrayList<>();
        List<HeatmapCellDto> cells = new ArrayList<>();

        for (SkillGapDto gap : gaps) {
            cols.add(gap.getSkillName());
            int gapScore = Math.max(0, gap.getRequiredLevel() - gap.getCurrentLevel());
            int gapPct = gap.getRequiredLevel() > 0 ? (int) Math.round(((double) gapScore / gap.getRequiredLevel()) * 100) : 0;
            rowValues.add(gapPct);

            String sev = calculateSeverity(gapPct);
            cells.add(new HeatmapCellDto(
                    user.getFullName(), gap.getSkillName(), gap.getSkillId(), gap.getSkillName(),
                    gap.getCurrentLevel(), gap.getRequiredLevel(), gapScore, gapPct, sev
            ));
        }
        values.add(rowValues);

        List<GapAlertDto> alerts = generateDynamicAlerts(cells, user.getDepartment() != null ? user.getDepartment().getName() : "Personal");

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalUsers", 1);
        summary.put("criticalGaps", cells.stream().filter(c -> "Critical".equals(c.getSeverity())).count());
        summary.put("avgGapPercent", rowValues.isEmpty() ? 0 : (int) Math.round(rowValues.stream().mapToInt(Integer::intValue).average().orElse(0)));

        return new HeatmapResponseDto(
                "PERSONAL",
                user.getFullName() + "'s Knowledge Gaps",
                rows, cols, values, cells, alerts, summary
        );
    }

    private HeatmapResponseDto buildDepartmentHeatmap(User manager) {
        Department dept = manager.getDepartment();
        
        // 1. Search by direct manager ID mapping
        List<User> teamMembers = userRepository.findByManagerId(manager.getId());
        
        // 2. Fall back to matching organization and department
        if (teamMembers.isEmpty() && dept != null && manager.getOrganization() != null) {
            teamMembers = userRepository.findByDepartmentIdAndOrganizationIdAndSystemRole(
                    dept.getId(), manager.getOrganization().getId(), SystemRole.EMPLOYEE
            );
        }
        
        // 3. Scoped organization fallback
        if (teamMembers.isEmpty() && manager.getOrganization() != null) {
            final UUID orgId = manager.getOrganization().getId();
            teamMembers = userRepository.findAll().stream()
                    .filter(u -> u.getSystemRole() == SystemRole.EMPLOYEE)
                    .filter(u -> u.getOrganization() != null && u.getOrganization().getId().equals(orgId))
                    .collect(Collectors.toList());
        }

        teamMembers = teamMembers.stream()
                .filter(u -> u.getSystemRole() == SystemRole.EMPLOYEE)
                .filter(u -> !u.getId().equals(manager.getId()))
                .collect(Collectors.toList());

        boolean isDemoManager = manager.getEmail() != null && manager.getEmail().equalsIgnoreCase("manager@northwind.io");

        if (isDemoManager) {
            List<String> cols = List.of(
                    "Communication",
                    "Java Spring Boot",
                    "React",
                    "SQL",
                    "Cloud",
                    "Talent Acquisition & Recruiting",
                    "HR Compliance & Policy",
                    "Performance Management"
            );
            List<String> rows = List.of("Ava Chen", "Liam Harper", "Chloe Adams", "Jordan Taylor", "Ravi Shah", "Grace Kim", "Sofia Ruiz", "Daniel Osei");
            List<List<Integer>> values = List.of(
                    List.of(10, 20, 10, 15, 20, 0, 0, 10),
                    List.of(20, 30, 0, 0, 0, 0, 0, 25),
                    List.of(20, 60, 20, 20, 0, 0, 0, 40),
                    List.of(30, 40, 20, 25, 50, 0, 0, 35),
                    List.of(40, 55, 35, 45, 60, 0, 0, 50),
                    List.of(15, 20, 10, 15, 25, 0, 0, 20),
                    List.of(10, 15, 30, 10, 20, 0, 0, 15),
                    List.of(25, 35, 20, 30, 45, 0, 0, 40)
            );
            List<HeatmapCellDto> cells = new ArrayList<>();
            for (int r = 0; r < rows.size(); r++) {
                String userName = rows.get(r);
                List<Integer> rowVals = values.get(r);
                for (int c = 0; c < cols.size(); c++) {
                    String skillName = cols.get(c);
                    int gapPct = rowVals.get(c);
                    int reqLvl = 5;
                    int currLvl = Math.max(0, (int) Math.round(((100.0 - gapPct) / 100.0) * reqLvl));
                    int gapScore = Math.max(0, reqLvl - currLvl);
                    String sev = calculateSeverity(gapPct);
                    cells.add(new HeatmapCellDto(userName, skillName, UUID.nameUUIDFromBytes(skillName.getBytes()), skillName, currLvl, reqLvl, gapScore, gapPct, sev));
                }
            }
            String deptName = (dept != null) ? dept.getName() : "Engineering";
            List<GapAlertDto> alerts = generateDynamicAlerts(cells, deptName);
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalUsers", rows.size());
            summary.put("criticalGaps", cells.stream().filter(c -> "Critical".equals(c.getSeverity())).count());
            summary.put("avgGapPercent", 23);
            return new HeatmapResponseDto("DEPARTMENT", deptName + " Department Scope", rows, cols, values, cells, alerts, summary);
        }

        if (teamMembers.isEmpty()) {
            return new HeatmapResponseDto(
                    "DEPARTMENT",
                    (dept != null ? dept.getName() : "Team") + " Department Scope",
                    Collections.emptyList(), Collections.emptyList(), Collections.emptyList(),
                    Collections.emptyList(), Collections.emptyList(),
                    Map.of("totalUsers", 0, "criticalGaps", 0, "avgGapPercent", 0)
            );
        }

        // DYNAMIC LIVE CALCULATION FOR REAL REGISTERED MANAGERS
        Set<String> distinctSkillNames = new LinkedHashSet<>();
        Map<UUID, List<SkillGapDto>> userGapsMap = new LinkedHashMap<>();

        for (User u : teamMembers) {
            List<SkillGapDto> gaps = calculateUserGaps(u.getId());
            userGapsMap.put(u.getId(), gaps);
            for (SkillGapDto g : gaps) {
                if (g.getSkillName() != null && !g.getSkillName().isBlank()) {
                    distinctSkillNames.add(g.getSkillName());
                }
            }
        }

        if (distinctSkillNames.isEmpty()) {
            distinctSkillNames.add("Core Competencies");
        }

        List<String> cols = new ArrayList<>(distinctSkillNames);
        List<String> rows = new ArrayList<>();
        List<List<Integer>> values = new ArrayList<>();
        List<HeatmapCellDto> cells = new ArrayList<>();

        for (User u : teamMembers) {
            String userName = u.getFullName() != null && !u.getFullName().isBlank() ? u.getFullName() : u.getEmail();
            rows.add(userName);
            List<SkillGapDto> userGaps = userGapsMap.getOrDefault(u.getId(), Collections.emptyList());
            Map<String, SkillGapDto> gapBySkillName = userGaps.stream()
                    .filter(g -> g.getSkillName() != null)
                    .collect(Collectors.toMap(SkillGapDto::getSkillName, g -> g, (g1, g2) -> g1));

            List<Integer> rowVals = new ArrayList<>();

            for (String skillName : cols) {
                SkillGapDto gapDto = gapBySkillName.get(skillName);
                int currLvl = gapDto != null ? gapDto.getCurrentLevel() : 0;
                int reqLvl = gapDto != null ? gapDto.getRequiredLevel() : 3;
                int gapScore = Math.max(0, reqLvl - currLvl);
                int gapPct = reqLvl > 0 ? (int) Math.round(((double) gapScore / reqLvl) * 100) : 0;

                rowVals.add(gapPct);

                String sev = calculateSeverity(gapPct);
                cells.add(new HeatmapCellDto(
                        userName, skillName, gapDto != null ? gapDto.getSkillId() : UUID.nameUUIDFromBytes(skillName.getBytes()),
                        skillName, currLvl, reqLvl, gapScore, gapPct, sev
                ));
            }
            values.add(rowVals);
        }

        String deptName = (dept != null) ? dept.getName() : "Team";
        List<GapAlertDto> alerts = generateDynamicAlerts(cells, deptName);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalUsers", teamMembers.size());
        summary.put("criticalGaps", cells.stream().filter(c -> "Critical".equals(c.getSeverity())).count());
        summary.put("avgGapPercent", cells.isEmpty() ? 0 : (int) Math.round(cells.stream().mapToInt(HeatmapCellDto::getGapPercentage).average().orElse(0)));

        return new HeatmapResponseDto(
                "DEPARTMENT",
                deptName + " Department Scope",
                rows, cols, values, cells, alerts, summary
        );
    }

    private HeatmapResponseDto buildOrganizationHeatmap(User currentUser) {
        List<User> allUsers;
        if (currentUser != null && currentUser.getOrganization() != null) {
            allUsers = userRepository.findByOrganizationId(currentUser.getOrganization().getId());
        } else {
            allUsers = userRepository.findAll();
        }
        Map<String, List<User>> usersByDept = allUsers.stream()
                .filter(u -> u.getDepartment() != null)
                .collect(Collectors.groupingBy(u -> u.getDepartment().getName()));

        Set<String> uniqueSkills = new LinkedHashSet<>();
        Map<String, Map<String, List<Integer>>> deptSkillScores = new LinkedHashMap<>();

        for (Map.Entry<String, List<User>> entry : usersByDept.entrySet()) {
            String deptName = entry.getKey();
            List<User> deptUsers = entry.getValue();
            Map<String, List<Integer>> skillGapsMap = new HashMap<>();

            for (User u : deptUsers) {
                List<SkillGapDto> gaps = calculateUserGaps(u.getId());
                for (SkillGapDto g : gaps) {
                    uniqueSkills.add(g.getSkillName());
                    int gapScore = Math.max(0, g.getRequiredLevel() - g.getCurrentLevel());
                    int gapPct = g.getRequiredLevel() > 0 ? (int) Math.round(((double) gapScore / g.getRequiredLevel()) * 100) : 0;
                    skillGapsMap.computeIfAbsent(g.getSkillName(), k -> new ArrayList<>()).add(gapPct);
                }
            }
            deptSkillScores.put(deptName, skillGapsMap);
        }

        List<String> rows = new ArrayList<>(deptSkillScores.keySet());
        List<String> cols = new ArrayList<>(uniqueSkills);
        if (rows.isEmpty()) rows = List.of("Sales", "Engineering", "Data & Analytics");
        if (cols.isEmpty()) cols = List.of("Communication", "CRM Tools", "SQL", "System Design");

        List<List<Integer>> values = new ArrayList<>();
        List<HeatmapCellDto> cells = new ArrayList<>();

        for (String deptName : rows) {
            Map<String, List<Integer>> skillGaps = deptSkillScores.getOrDefault(deptName, Collections.emptyMap());
            List<Integer> rowVals = new ArrayList<>();

            for (String skillName : cols) {
                List<Integer> pcts = skillGaps.getOrDefault(skillName, List.of(0));
                int avgPct = (int) Math.round(pcts.stream().mapToInt(Integer::intValue).average().orElse(0));
                rowVals.add(avgPct);

                String sev = calculateSeverity(avgPct);
                cells.add(new HeatmapCellDto(
                        deptName, skillName, null, skillName,
                        0, 0, 0, avgPct, sev
                ));
            }
            values.add(rowVals);
        }

        List<GapAlertDto> alerts = generateDynamicAlerts(cells, "Organization");

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalUsers", allUsers.size());
        summary.put("criticalGaps", cells.stream().filter(c -> "Critical".equals(c.getSeverity())).count());
        summary.put("avgGapPercent", cells.isEmpty() ? 0 : (int) Math.round(cells.stream().mapToInt(HeatmapCellDto::getGapPercentage).average().orElse(0)));

        return new HeatmapResponseDto(
                "ORGANIZATION",
                "Organization-Wide Gap Intelligence",
                rows, cols, values, cells, alerts, summary
        );
    }

    private String calculateSeverity(int gapPercentage) {
        if (gapPercentage > 60) return "Critical";
        if (gapPercentage > 40) return "High";
        if (gapPercentage > 20) return "Medium";
        return "Low";
    }

    private List<GapAlertDto> generateDynamicAlerts(List<HeatmapCellDto> cells, String scopeName) {
        List<GapAlertDto> alerts = new ArrayList<>();
        List<HeatmapCellDto> sortedCells = cells.stream()
                .filter(c -> c.getGapPercentage() > 20)
                .sorted((c1, c2) -> Integer.compare(c2.getGapPercentage(), c1.getGapPercentage()))
                .limit(4)
                .collect(Collectors.toList());

        for (HeatmapCellDto cell : sortedCells) {
            String title = String.format("%s gap (%d%%) detected in %s", cell.getSkillName(), cell.getGapPercentage(), cell.getRow());
            String rec = String.format("AI recommends initiating a targeted learning module for %s.", cell.getSkillName());
            alerts.add(new GapAlertDto(title, cell.getSeverity(), scopeName, cell.getSkillName(), rec));
        }

        if (alerts.isEmpty()) {
            alerts.add(new GapAlertDto("No critical skill gaps detected", "Low", scopeName, "All Skills", "Current skill proficiency meets or exceeds role benchmarks."));
        }

        return alerts;
    }

    public List<SkillGapSnapshot> getUserGapSnapshots(UUID userId) {
        return snapshotRepository.findByUserIdOrderBySnapshotDateAsc(userId);
    }

    public Map<String, Object> getHeatmap() {
        return Map.of("data", Collections.emptyList());
    }
}
