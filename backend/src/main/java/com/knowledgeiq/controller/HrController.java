package com.knowledgeiq.controller;

import com.knowledgeiq.dto.SkillGapDto;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import com.knowledgeiq.service.GapAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr")
@PreAuthorize("hasAnyRole('HR_SPECIALIST', 'SYSTEM_ADMIN')")
public class HrController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private CertificationRepository certificationRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getHrDashboard(Authentication auth) {
        UUID hrId = UUID.fromString((String) auth.getPrincipal());
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR User not found"));

        Organization org = hr.getOrganization();
        Map<String, Object> data = new HashMap<>();

        data.put("name", hr.getFullName());
        data.put("title", hr.getRoleTitle() != null ? hr.getRoleTitle() : "HR Specialist");
        data.put("initials", hr.getFullName() != null && hr.getFullName().length() > 0 ?
                hr.getFullName().substring(0, 1).toUpperCase() : "HR");

        if (org == null) {
            data.put("totalEmployees", 0);
            data.put("criticalGaps", 0);
            data.put("avgCompletion", 0);
            data.put("roi", "0.0x");
            data.put("departments", Collections.emptyList());
            data.put("heatmap", Map.of("rows", Collections.emptyList(), "cols", Collections.emptyList(), "values", Collections.emptyList()));
            data.put("alerts", Collections.emptyList());
            data.put("certStatus", Collections.emptyList());
            data.put("directory", Collections.emptyList());
            return ResponseEntity.ok(data);
        }

        UUID orgId = org.getId();

        // 1. Get employees in organization
        List<User> employees = userRepository.findByOrganizationIdAndSystemRole(orgId, SystemRole.EMPLOYEE);
        data.put("totalEmployees", employees.size());

        // Cache user gaps & enrollments to avoid duplicate remote queries
        Map<UUID, List<SkillGapDto>> userGapsCache = new HashMap<>();
        Map<UUID, List<CourseEnrollment>> userEnrollmentsCache = new HashMap<>();
        for (User emp : employees) {
            if (emp == null || emp.getId() == null) continue;
            try {
                List<SkillGapDto> gList = gapAnalysisService.calculateUserGaps(emp.getId());
                userGapsCache.put(emp.getId(), gList != null ? gList : Collections.emptyList());
            } catch (Exception ignored) {
                userGapsCache.put(emp.getId(), Collections.emptyList());
            }
            try {
                List<CourseEnrollment> eList = enrollmentRepository.findByUserId(emp.getId());
                userEnrollmentsCache.put(emp.getId(), eList != null ? eList : Collections.emptyList());
            } catch (Exception ignored) {
                userEnrollmentsCache.put(emp.getId(), Collections.emptyList());
            }
        }

        // 2. Count critical gaps & overall gap analysis
        long criticalGaps = 0;
        double totalCompletion = 0;
        int enrollmentCount = 0;

        for (User emp : employees) {
            if (emp == null || emp.getId() == null) continue;
            List<SkillGapDto> gaps = userGapsCache.getOrDefault(emp.getId(), Collections.emptyList());
            criticalGaps += gaps.stream().filter(g -> g != null && g.getIsCritical() != null && g.getIsCritical()).count();

            List<CourseEnrollment> enrollments = userEnrollmentsCache.getOrDefault(emp.getId(), Collections.emptyList());
            if (!enrollments.isEmpty()) {
                long completed = enrollments.stream().filter(e -> e != null && "COMPLETED".equalsIgnoreCase(e.getStatus())).count();
                totalCompletion += (double) completed / enrollments.size() * 100.0;
                enrollmentCount++;
            }
        }

        data.put("criticalGaps", criticalGaps);
        int avgComp = enrollmentCount > 0 ? (int) Math.round(totalCompletion / enrollmentCount) : 0;
        data.put("avgCompletion", avgComp);

        long activeCerts = 0;
        long pendingCerts = 0;
        long expiredCerts = 0;
        try {
            List<Certification> orgCerts = certificationRepository.findByUserOrganizationIdOrderByCreatedAtDesc(orgId);
            if (orgCerts != null) {
                activeCerts = orgCerts.stream().filter(c -> c != null && "VERIFIED".equalsIgnoreCase(c.getStatus())).count();
                pendingCerts = orgCerts.stream().filter(c -> c != null && ("UPLOADED".equalsIgnoreCase(c.getStatus()) || "PENDING".equalsIgnoreCase(c.getStatus()))).count();
                expiredCerts = orgCerts.stream().filter(c -> c != null && "EXPIRED".equalsIgnoreCase(c.getStatus())).count();
            }
        } catch (Exception ignored) {}

        double dynamicRoi = 1.0 + (activeCerts * 0.25) + (avgComp / 100.0 * 1.8);
        data.put("roi", String.format(Locale.US, "%.1fx", Math.max(1.0, dynamicRoi)));

        // 3. Departments metrics
        List<Department> orgDepts = departmentRepository.findByOrganizationId(orgId);
        List<Map<String, Object>> deptsData = new ArrayList<>();

        for (Department d : orgDepts) {
            if (d == null) continue;
            List<User> deptEmps = employees.stream()
                    .filter(e -> e != null && e.getDepartment() != null && e.getDepartment().getId().equals(d.getId()))
                    .collect(Collectors.toList());
            double deptCompletion = 0.0;
            long deptGaps = 0;
            int deptEnrollmentCount = 0;

            for (User de : deptEmps) {
                if (de == null || de.getId() == null) continue;
                List<SkillGapDto> gaps = userGapsCache.getOrDefault(de.getId(), Collections.emptyList());
                deptGaps += gaps.stream().filter(g -> g != null && g.getIsCritical() != null && g.getIsCritical()).count();

                List<CourseEnrollment> enrollments = userEnrollmentsCache.getOrDefault(de.getId(), Collections.emptyList());
                if (!enrollments.isEmpty()) {
                    long completed = enrollments.stream().filter(e -> e != null && "COMPLETED".equalsIgnoreCase(e.getStatus())).count();
                    deptCompletion += (double) completed / enrollments.size() * 100.0;
                    deptEnrollmentCount++;
                }
            }

            Map<String, Object> deptMap = new HashMap<>();
            deptMap.put("name", d.getName());
            deptMap.put("headcount", deptEmps.size());
            deptMap.put("completion", deptEnrollmentCount > 0 ? (int) Math.round(deptCompletion / deptEnrollmentCount) : 0);
            deptMap.put("gap", deptGaps);
            deptsData.add(deptMap);
        }
        data.put("departments", deptsData);

        // 4. Heatmap data (Departments x Skills) - dynamically query org skills
        List<String> heatmapRows = orgDepts.stream().filter(Objects::nonNull).map(Department::getName).collect(Collectors.toList());
        List<String> heatmapCols = skillRepository.findAll().stream()
                .filter(Objects::nonNull)
                .map(Skill::getName)
                .filter(Objects::nonNull)
                .distinct()
                .limit(6)
                .collect(Collectors.toList());
        if (heatmapCols.isEmpty()) {
            heatmapCols = Arrays.asList("Java Spring Boot", "React", "SQL", "Cloud / AWS", "Communication & Soft Skills");
        }

        List<List<Integer>> heatmapValues = new ArrayList<>();

        for (Department d : orgDepts) {
            if (d == null) continue;
            List<Integer> deptValues = new ArrayList<>();
            List<User> deptEmps = employees.stream()
                    .filter(e -> e != null && e.getDepartment() != null && e.getDepartment().getId().equals(d.getId()))
                    .collect(Collectors.toList());

            for (String col : heatmapCols) {
                if (col == null) continue;
                double totalLvl = 0;
                int empCount = 0;

                for (User de : deptEmps) {
                    if (de == null || de.getId() == null) continue;
                    List<SkillGapDto> gaps = userGapsCache.getOrDefault(de.getId(), Collections.emptyList());
                    Optional<SkillGapDto> matching = gaps.stream()
                            .filter(g -> g != null && g.getSkillName() != null && g.getSkillName().equalsIgnoreCase(col))
                            .findFirst();
                    if (matching.isPresent()) {
                        Integer lvl = matching.get().getCurrentLevel();
                        if (lvl != null) {
                            totalLvl += lvl;
                            empCount++;
                        }
                    }
                }
                int scaledVal = empCount > 0 ? (int) Math.round((totalLvl / empCount) * 20.0) : 0;
                deptValues.add(scaledVal);
            }
            heatmapValues.add(deptValues);
        }

        Map<String, Object> heatmap = new HashMap<>();
        heatmap.put("rows", heatmapRows);
        heatmap.put("cols", heatmapCols);
        heatmap.put("values", heatmapValues);
        data.put("heatmap", heatmap);

        // 5. Alerts
        List<Map<String, String>> alerts = new ArrayList<>();
        if (criticalGaps > 10) {
            alerts.add(Map.of("title", "Workforce critical knowledge gap density is elevated.", "sev", "Critical", "dept", "All Depts"));
        } else if (criticalGaps > 0) {
            alerts.add(Map.of("title", "Identified " + criticalGaps + " critical skill gap(s) requiring targeted training.", "sev", "Medium", "dept", "All Depts"));
        } else {
            alerts.add(Map.of("title", "Skill capabilities are currently aligned with strategic benchmarks.", "sev", "Low", "dept", "All Depts"));
        }
        data.put("alerts", alerts);

        // 6. Certifications
        List<Map<String, Object>> certStatus = Arrays.asList(
                Map.of("name", "Active", "value", activeCerts, "color", "#65D46E"),
                Map.of("name", "Pending", "value", pendingCerts, "color", "#F59E0B"),
                Map.of("name", "Expired", "value", expiredCerts, "color", "#F43F5E")
        );
        data.put("certStatus", certStatus);

        // 7. Directory List
        List<Map<String, Object>> directory = new ArrayList<>();
        for (User emp : employees) {
            Map<String, Object> empMap = new HashMap<>();
            empMap.put("name", emp.getFullName());
            empMap.put("dept", emp.getDepartment() != null ? emp.getDepartment().getName() : "General");
            empMap.put("role", emp.getRoleTitle() != null ? emp.getRoleTitle() : "Employee");

            List<SkillGapDto> gaps = userGapsCache.getOrDefault(emp.getId(), Collections.emptyList());
            long empCrit = gaps.stream().filter(g -> g.getIsCritical() != null && g.getIsCritical()).count();

            empMap.put("score", Math.max(0, 100 - (gaps.size() * 5)));
            empMap.put("status", empCrit > 1 ? "At Risk" : empCrit > 0 ? "Needs Review" : "On Track");
            directory.add(empMap);
        }
        data.put("directory", directory);

        // 8. Trends
        java.time.ZonedDateTime now = java.time.ZonedDateTime.now();
        List<Map<String, Object>> training = new ArrayList<>();
        for (int i = 2; i >= 0; i--) {
            java.time.ZonedDateTime m = now.minusMonths(i);
            String mName = m.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH);
            int val = avgComp > 0 ? Math.max(0, (int) Math.round(avgComp - (i * 6))) : 0;
            training.add(Map.of("month", mName, "value", val));
        }
        data.put("training", training);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getHrUsers(Authentication auth) {
        UUID hrId = UUID.fromString((String) auth.getPrincipal());
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR User not found"));
        Organization org = hr.getOrganization();
        if (org == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<User> orgUsers = userRepository.findByOrganizationId(org.getId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : orgUsers) {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("id", u.getId());
            uMap.put("fullName", u.getFullName());
            uMap.put("email", u.getEmail());
            uMap.put("systemRole", u.getSystemRole().name());
            uMap.put("dept", u.getDepartment() != null ? u.getDepartment().getName() : "N/A");
            uMap.put("roleTitle", u.getRoleTitle() != null ? u.getRoleTitle() : "N/A");
            uMap.put("isActive", u.getIsActive() != null ? u.getIsActive() : true);
            result.add(uMap);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable("id") UUID userId, Authentication auth) {
        UUID hrId = UUID.fromString((String) auth.getPrincipal());
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR User not found"));
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (hr.getOrganization() == null || target.getOrganization() == null || 
            !hr.getOrganization().getId().equals(target.getOrganization().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        
        target.setIsActive(target.getIsActive() == null || !target.getIsActive());
        userRepository.save(target);
        return ResponseEntity.ok(Map.of("success", true, "isActive", target.getIsActive()));
    }

    @PostMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable("id") UUID userId, @RequestBody Map<String, String> payload, Authentication auth) {
        UUID hrId = UUID.fromString((String) auth.getPrincipal());
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR User not found"));
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (hr.getOrganization() == null || target.getOrganization() == null || 
            !hr.getOrganization().getId().equals(target.getOrganization().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        
        String newRoleTitle = payload.get("roleTitle");
        String newDeptName = payload.get("departmentName");
        String newSystemRole = payload.get("systemRole");
        
        if (newRoleTitle != null && !newRoleTitle.isBlank()) {
            final Department targetDept = target.getDepartment();
            Role r = roleRepository.findAllByTitle(newRoleTitle).stream().findFirst()
                    .orElseGet(() -> roleRepository.save(new Role(newRoleTitle, targetDept, newRoleTitle)));
            target.setRole(r);
        }
        
        if (newDeptName != null && !newDeptName.isBlank()) {
            Department dept = departmentRepository.findByNameAndOrganizationId(newDeptName, hr.getOrganization().getId())
                    .orElseGet(() -> {
                        Department d = new Department(newDeptName, newDeptName + " Department");
                        d.setOrganization(hr.getOrganization());
                        return departmentRepository.save(d);
                    });
            target.setDepartment(dept);
        }
        
        if (newSystemRole != null && !newSystemRole.isBlank()) {
            try {
                target.setSystemRole(SystemRole.valueOf(newSystemRole.toUpperCase()));
            } catch (Exception ignored) {}
        }
        
        userRepository.save(target);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/departments-list")
    public ResponseEntity<List<Map<String, Object>>> getHrDepartments(Authentication auth) {
        UUID hrId = UUID.fromString((String) auth.getPrincipal());
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR User not found"));
        Organization org = hr.getOrganization();
        if (org == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<Department> orgDepts = departmentRepository.findByOrganizationId(org.getId());
        List<User> employees = userRepository.findByOrganizationIdAndSystemRole(org.getId(), SystemRole.EMPLOYEE);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Department d : orgDepts) {
            if (d == null) continue;
            List<User> deptEmps = employees.stream()
                    .filter(e -> e != null && e.getDepartment() != null && e.getDepartment().getId().equals(d.getId()))
                    .collect(Collectors.toList());
            
            String managerName = "Unassigned";
            if (d.getManagerId() != null) {
                try {
                    User mgr = userRepository.findById(d.getManagerId()).orElse(null);
                    if (mgr != null && mgr.getFullName() != null) managerName = mgr.getFullName();
                } catch (Exception ignored) {}
            }
            
            long criticalGaps = 0;
            double totalCompletion = 0;
            int enrollmentCount = 0;
            for (User de : deptEmps) {
                if (de == null) continue;
                List<SkillGapDto> gaps = Collections.emptyList();
                try {
                    gaps = gapAnalysisService.calculateUserGaps(de.getId());
                } catch (Exception ignored) {}
                if (gaps != null) {
                    criticalGaps += gaps.stream().filter(g -> g != null && g.getIsCritical() != null && g.getIsCritical()).count();
                }
                List<CourseEnrollment> enrollments = Collections.emptyList();
                try {
                    enrollments = enrollmentRepository.findByUserId(de.getId());
                } catch (Exception ignored) {}
                if (enrollments != null && !enrollments.isEmpty()) {
                    long completed = enrollments.stream().filter(e -> e != null && "COMPLETED".equalsIgnoreCase(e.getStatus())).count();
                    totalCompletion += (double) completed / enrollments.size() * 100.0;
                    enrollmentCount++;
                }
            }
            
            Map<String, Object> dMap = new HashMap<>();
            dMap.put("id", d.getId());
            dMap.put("name", d.getName() != null ? d.getName() : "Department");
            dMap.put("description", d.getDescription() != null ? d.getDescription() : "");
            dMap.put("managerName", managerName);
            dMap.put("headcount", deptEmps.size());
            dMap.put("completion", enrollmentCount > 0 ? (int) Math.round(totalCompletion / enrollmentCount) : 80);
            dMap.put("gap", criticalGaps);
            result.add(dMap);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/departments")
    public ResponseEntity<?> createHrDepartment(@RequestBody Map<String, String> payload, Authentication auth) {
        UUID hrId = UUID.fromString((String) auth.getPrincipal());
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR User not found"));
        Organization org = hr.getOrganization();
        if (org == null) {
            return ResponseEntity.status(400).body(Map.of("error", "No organization associated with this HR Specialist"));
        }
        String name = payload.get("name");
        String desc = payload.get("description");
        if (name == null || name.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("error", "Department name is required"));
        }
        if (departmentRepository.findByNameAndOrganizationId(name, org.getId()).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("error", "Department already exists in this organization"));
        }
        Department d = new Department(name, desc != null ? desc : "");
        d.setOrganization(org);
        departmentRepository.save(d);
        return ResponseEntity.ok(d);
    }

    @GetMapping("/forecasting-data")
    public ResponseEntity<Map<String, Object>> getHrForecasting(Authentication auth) {
        UUID hrId = UUID.fromString((String) auth.getPrincipal());
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR User not found"));
        Organization org = hr.getOrganization();
        
        Map<String, Object> data = new HashMap<>();
        if (org == null) {
            data.put("forecastSkills", Collections.emptyList());
            data.put("learningVelocity", 0);
            data.put("demandIndex", Collections.emptyList());
            return ResponseEntity.ok(data);
        }
        
        List<User> employees = userRepository.findByOrganizationIdAndSystemRole(org.getId(), SystemRole.EMPLOYEE);
        
        Map<String, Integer> gapWeights = new HashMap<>();
        Map<String, Integer> criticalGaps = new HashMap<>();
        for (User emp : employees) {
            if (emp == null) continue;
            List<SkillGapDto> gaps = Collections.emptyList();
            try {
                gaps = gapAnalysisService.calculateUserGaps(emp.getId());
            } catch (Exception ignored) {}
            if (gaps == null) continue;
            for (SkillGapDto g : gaps) {
                if (g != null && g.getSkillName() != null && g.getCurrentLevel() != null && g.getRequiredLevel() != null) {
                    if (g.getCurrentLevel() < g.getRequiredLevel()) {
                        int diff = g.getRequiredLevel() - g.getCurrentLevel();
                        gapWeights.put(g.getSkillName(), gapWeights.getOrDefault(g.getSkillName(), 0) + diff);
                        if (g.getIsCritical() != null && g.getIsCritical()) {
                            criticalGaps.put(g.getSkillName(), criticalGaps.getOrDefault(g.getSkillName(), 0) + 1);
                        }
                    }
                }
            }
        }
        
        List<Map<String, Object>> forecastSkills = new ArrayList<>();
        List<String> targetSkills = new ArrayList<>(gapWeights.keySet());
        if (targetSkills.isEmpty()) {
            targetSkills = skillRepository.findAll().stream().map(Skill::getName).limit(4).collect(Collectors.toList());
        } else {
            targetSkills = targetSkills.stream()
                    .sorted((s1, s2) -> Integer.compare(gapWeights.getOrDefault(s2, 0), gapWeights.getOrDefault(s1, 0)))
                    .limit(6)
                    .collect(Collectors.toList());
        }

        int totalDeficit = 0;
        for (String skill : targetSkills) {
            int gapWeight = gapWeights.getOrDefault(skill, 0);
            int critCount = criticalGaps.getOrDefault(skill, 0);
            totalDeficit += gapWeight;

            String forecastTrend = gapWeight > 6 ? "Increasing Deficit" : gapWeight > 2 ? "Stable Deficit" : "Aligned";
            int demandScore = Math.min(100, Math.max(10, 40 + (gapWeight * 8)));
            int learningVelocity = Math.max(15, Math.min(95, 85 - (gapWeight * 6)));

            Map<String, Object> fMap = new HashMap<>();
            fMap.put("skill", skill);
            fMap.put("deficitScore", gapWeight * 15);
            fMap.put("criticalGaps", critCount);
            fMap.put("trend", forecastTrend);
            fMap.put("demandScore", demandScore);
            fMap.put("learningVelocity", learningVelocity);
            forecastSkills.add(fMap);
        }

        int avgGapPerEmp = employees.isEmpty() ? 0 : totalDeficit / employees.size();
        int overallVelocity = Math.max(20, Math.min(95, 80 - (avgGapPerEmp * 5)));

        data.put("forecastSkills", forecastSkills);
        data.put("learningVelocity", overallVelocity);
        data.put("demandIndex", Arrays.asList(
                Map.of("month", "Q1", "demand", Math.min(100, 45 + avgGapPerEmp * 3), "supply", Math.max(20, 50 - avgGapPerEmp)),
                Map.of("month", "Q2", "demand", Math.min(100, 55 + avgGapPerEmp * 4), "supply", Math.max(25, 55 - avgGapPerEmp / 2)),
                Map.of("month", "Q3", "demand", Math.min(100, 65 + avgGapPerEmp * 5), "supply", Math.max(30, 60)),
                Map.of("month", "Q4", "demand", Math.min(100, 75 + avgGapPerEmp * 6), "supply", Math.max(35, 68))
        ));

        return ResponseEntity.ok(data);
    }
}
