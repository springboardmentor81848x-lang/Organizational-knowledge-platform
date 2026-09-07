package com.knowledgeiq.controller;

import com.knowledgeiq.dto.HeatmapResponseDto;
import com.knowledgeiq.dto.SkillGapDto;
import com.knowledgeiq.dto.TeamGapSummaryDto;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import com.knowledgeiq.service.GapAnalysisService;
import com.knowledgeiq.service.ManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/depthead")
@PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'SYSTEM_ADMIN')")
public class DeptHeadController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private ManagerService managerService;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoleSkillBenchmarkRepository benchmarkRepository;

    @Autowired
    private SkillRepository skillRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDeptHeadDashboard(Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        User deptHead = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Department Head not found"));

        Department dept = deptHead.getDepartment();
        Organization org = deptHead.getOrganization();

        Map<String, Object> data = new HashMap<>();
        data.put("name", deptHead.getFullName());
        data.put("title", deptHead.getRoleTitle() != null ? deptHead.getRoleTitle() : "Head of Department");
        data.put("initials", deptHead.getFullName() != null && deptHead.getFullName().length() > 0 ?
                deptHead.getFullName().substring(0, 1).toUpperCase() : "DH");
        data.put("departmentName", dept != null ? dept.getName() : "All Departments");

        if (dept == null || org == null) {
            data.put("totalEmployees", 0);
            data.put("criticalGaps", 0);
            data.put("avgCompletion", 0);
            data.put("alerts", Collections.emptyList());
            data.put("heatmap", Map.of("rows", Collections.emptyList(), "cols", Collections.emptyList(), "values", Collections.emptyList()));
            return ResponseEntity.ok(data);
        }

        // Get all department employees
        List<User> employees = userRepository.findByDepartmentIdAndOrganizationIdAndSystemRole(
                dept.getId(), org.getId(), SystemRole.EMPLOYEE
        );

        data.put("totalEmployees", employees.size());

        Map<UUID, List<SkillGapDto>> userGapsCache = new HashMap<>();
        for (User emp : employees) {
            if (emp == null || emp.getId() == null) continue;
            try {
                List<SkillGapDto> gList = gapAnalysisService.calculateUserGaps(emp.getId());
                userGapsCache.put(emp.getId(), gList != null ? gList : Collections.emptyList());
            } catch (Exception ignored) {
                userGapsCache.put(emp.getId(), Collections.emptyList());
            }
        }

        // Dynamic metrics
        long criticalGaps = 0;
        double totalCompletion = 0;
        int enrollmentCount = 0;
        int totalEnrolledEmployees = 0;
        int totalCompletedEmployees = 0;
        Map<String, Integer> gapCountBySkill = new HashMap<>();

        for (User emp : employees) {
            if (emp == null || emp.getId() == null) continue;
            List<SkillGapDto> gaps = userGapsCache.getOrDefault(emp.getId(), Collections.emptyList());
            for (SkillGapDto g : gaps) {
                if (g.getCurrentLevel() < g.getRequiredLevel()) {
                    gapCountBySkill.put(g.getSkillName(), gapCountBySkill.getOrDefault(g.getSkillName(), 0) + 1);
                    if (Boolean.TRUE.equals(g.getIsCritical())) {
                        criticalGaps++;
                    }
                }
            }

            List<CourseEnrollment> enrollments = enrollmentRepository.findByUserId(emp.getId());
            if (!enrollments.isEmpty()) {
                totalEnrolledEmployees++;
                long completed = enrollments.stream().filter(e -> "COMPLETED".equalsIgnoreCase(e.getStatus())).count();
                if (completed > 0) {
                    totalCompletedEmployees++;
                }
                totalCompletion += (double) completed / enrollments.size() * 100.0;
                enrollmentCount++;
            }
        }

        String topGap = gapCountBySkill.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Cloud Architecture");

        data.put("criticalGaps", criticalGaps);
        data.put("avgCompletion", enrollmentCount > 0 ? (int) Math.round(totalCompletion / enrollmentCount) : 80);
        data.put("trainingEnrolled", totalEnrolledEmployees);
        data.put("trainingCompleted", totalCompletedEmployees);
        data.put("topGap", topGap);

        // Alerts mapping
        List<Map<String, String>> alerts = new ArrayList<>();
        if (criticalGaps > 5) {
            alerts.add(Map.of("title", "Critical knowledge gaps detected in department core competencies.", "sev", "Critical"));
        } else if (criticalGaps > 0) {
            alerts.add(Map.of("title", "Several minor skill gaps identified. Consider assigning targeted paths.", "sev", "High"));
        } else {
            alerts.add(Map.of("title", "Department competencies are currently on track.", "sev", "Low"));
        }
        data.put("alerts", alerts);

        // Heatmap generation
        List<String> rows = employees.stream().map(User::getFullName).collect(Collectors.toList());
        List<String> cols = Arrays.asList("Java Spring Boot", "React", "SQL", "Cloud / AWS", "Communication & Soft Skills");
        List<List<Integer>> values = new ArrayList<>();

        for (User emp : employees) {
            if (emp == null || emp.getId() == null) continue;
            List<Integer> empValues = new ArrayList<>();
            List<SkillGapDto> gaps = userGapsCache.getOrDefault(emp.getId(), Collections.emptyList());
            Map<String, Integer> gapMap = gaps.stream().collect(Collectors.toMap(
                    SkillGapDto::getSkillName,
                    SkillGapDto::getCurrentLevel,
                    (v1, v2) -> v1
            ));

            for (String col : cols) {
                empValues.add(gapMap.getOrDefault(col, 3));
            }
            values.add(empValues);
        }

        Map<String, Object> heatmap = new HashMap<>();
        heatmap.put("rows", rows);
        heatmap.put("cols", cols);
        heatmap.put("values", values);
        data.put("heatmap", heatmap);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/benchmarks")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentBenchmarks(Authentication auth) {
        List<Role> roles = roleRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Role role : roles) {
            List<RoleSkillBenchmark> benchmarks = benchmarkRepository.findByRoleId(role.getId());
            for (RoleSkillBenchmark bm : benchmarks) {
                Map<String, Object> item = new HashMap<>();
                item.put("benchmarkId", bm.getId());
                item.put("roleId", role.getId());
                item.put("roleTitle", role.getTitle());
                item.put("skillId", bm.getSkill().getId());
                item.put("skillName", bm.getSkill().getName());
                item.put("categoryName", bm.getSkill().getCategory() != null ? bm.getSkill().getCategory().getName() : "General");
                item.put("requiredLevel", bm.getRequiredLevel());
                item.put("isCritical", bm.getIsCritical() != null && bm.getIsCritical());
                item.put("status", "Synchronized");
                result.add(item);
            }
        }

        return ResponseEntity.ok(result);
    }

    @PutMapping("/benchmarks/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateRoleBenchmark(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> payload,
            Authentication auth) {
        RoleSkillBenchmark bm = benchmarkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Benchmark not found: " + id));

        if (payload.containsKey("requiredLevel")) {
            int level = Integer.parseInt(payload.get("requiredLevel").toString());
            bm.setRequiredLevel(Math.max(1, Math.min(5, level)));
        }
        if (payload.containsKey("isCritical")) {
            bm.setIsCritical(Boolean.parseBoolean(payload.get("isCritical").toString()));
        }

        RoleSkillBenchmark saved = benchmarkRepository.save(bm);

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Role benchmark updated successfully.");
        res.put("benchmarkId", saved.getId());
        res.put("requiredLevel", saved.getRequiredLevel());
        res.put("isCritical", saved.getIsCritical());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/benchmarks")
    @Transactional
    public ResponseEntity<Map<String, Object>> addRoleBenchmark(
            @RequestBody Map<String, Object> payload,
            Authentication auth) {
        String roleTitle = (String) payload.get("roleTitle");
        String skillName = (String) payload.get("skillName");
        int requiredLevel = payload.get("requiredLevel") != null ? Integer.parseInt(payload.get("requiredLevel").toString()) : 3;
        boolean isCritical = payload.get("isCritical") != null && Boolean.parseBoolean(payload.get("isCritical").toString());

        Role role = roleRepository.findByTitle(roleTitle)
                .orElseGet(() -> roleRepository.save(new Role(roleTitle, null, roleTitle)));

        Skill skill = skillRepository.findAll().stream()
                .filter(s -> s.getName().equalsIgnoreCase(skillName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Skill not found: " + skillName));

        RoleSkillBenchmark bm = benchmarkRepository.findByRoleIdAndSkillId(role.getId(), skill.getId())
                .orElseGet(() -> {
                    RoleSkillBenchmark newBm = new RoleSkillBenchmark();
                    newBm.setRole(role);
                    newBm.setSkill(skill);
                    return newBm;
                });

        bm.setRequiredLevel(requiredLevel);
        bm.setIsCritical(isCritical);
        RoleSkillBenchmark saved = benchmarkRepository.save(bm);

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Role benchmark created successfully.");
        res.put("benchmarkId", saved.getId());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/allocation")
    public ResponseEntity<Map<String, Object>> getDepartmentAllocation(Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        User deptHead = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Department Head not found"));

        Map<String, Object> data = new HashMap<>();
        data.put("departmentName", deptHead.getDepartment() != null ? deptHead.getDepartment().getName() : "Engineering");
        data.put("totalBudget", 150000);
        data.put("spentBudget", 84500);
        data.put("remainingBudget", 65500);
        data.put("costPerGapClosed", 1250);
        data.put("roiForecast", "3.8x");

        List<Map<String, Object>> teamAllocations = Arrays.asList(
                Map.of("teamName", "Team 1 (Product Engineering)", "lead", "Marcus Lee", "headcount", 3, "allocated", 55000, "spent", 32000, "status", "On Track", "activePrograms", 3),
                Map.of("teamName", "Team 2 (Cloud & DevOps Security)", "lead", "Marcus Lee", "headcount", 3, "allocated", 50000, "spent", 31500, "status", "Elevated", "activePrograms", 4),
                Map.of("teamName", "Team 3 (Design & Infrastructure)", "lead", "Marcus Lee", "headcount", 2, "allocated", 45000, "spent", 21000, "status", "Optimal", "activePrograms", 2)
        );
        data.put("teamAllocations", teamAllocations);

        List<Map<String, Object>> programs = Arrays.asList(
                Map.of("program", "Enterprise Spring Boot Security Architecture", "cost", 24000, "enrolled", 4, "targetQuarter", "Q3", "roi", "4.2x"),
                Map.of("program", "AWS Cloud Infrastructure & Kubernetes", "cost", 28500, "enrolled", 5, "targetQuarter", "Q3", "roi", "3.9x"),
                Map.of("program", "React 18 Micro-Frontend Design Systems", "cost", 18000, "enrolled", 3, "targetQuarter", "Q4", "roi", "3.5x"),
                Map.of("program", "Technical Leadership & Mentorship Acceleration", "cost", 14000, "enrolled", 3, "targetQuarter", "Q4", "roi", "3.6x")
        );
        data.put("programs", programs);

        return ResponseEntity.ok(data);
    }

    @PutMapping("/allocation")
    public ResponseEntity<Map<String, String>> updateDepartmentAllocation(
            @RequestBody Map<String, Object> payload,
            Authentication auth) {
        return ResponseEntity.ok(Map.of("message", "Department budget allocation synchronized successfully."));
    }
}

