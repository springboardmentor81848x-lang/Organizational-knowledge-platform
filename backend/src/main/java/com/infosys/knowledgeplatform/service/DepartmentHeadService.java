package com.infosys.knowledgeplatform.service;

import com.infosys.knowledgeplatform.model.*;
import com.infosys.knowledgeplatform.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DepartmentHeadService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentTeamRepository departmentTeamRepository;
    private final KnowledgeApprovalRepository knowledgeApprovalRepository;
    private final LearningPriorityRepository learningPriorityRepository;
    private final TeamLeaderReportRepository teamLeaderReportRepository;
    private final UserRepository userRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EnrollmentRepository enrollmentRepository;

    public DepartmentHeadService(
            DepartmentRepository departmentRepository,
            DepartmentTeamRepository departmentTeamRepository,
            KnowledgeApprovalRepository knowledgeApprovalRepository,
            LearningPriorityRepository learningPriorityRepository,
            TeamLeaderReportRepository teamLeaderReportRepository,
            UserRepository userRepository,
            EmployeeSkillRepository employeeSkillRepository,
            EnrollmentRepository enrollmentRepository) {
        this.departmentRepository = departmentRepository;
        this.departmentTeamRepository = departmentTeamRepository;
        this.knowledgeApprovalRepository = knowledgeApprovalRepository;
        this.learningPriorityRepository = learningPriorityRepository;
        this.teamLeaderReportRepository = teamLeaderReportRepository;
        this.userRepository = userRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // ===== DEPARTMENT STATISTICS =====
    public Map<String, Object> getDepartmentStatistics(String departmentHeadEmail) {
        Optional<Department> dept = departmentRepository.findByHeadEmail(departmentHeadEmail);
        if (dept.isEmpty()) {
            return Map.of(
                "departmentName", "Organization-wide view",
                "totalEmployees", userRepository.count(),
                "totalTeams", 0,
                "avgCompetencyGap", "0.0",
                "avgTrainingProgress", "0.0",
                "criticalSkillGaps", 0,
                "pendingApprovals", 0
            );
        }

        Department department = dept.get();
        List<DepartmentTeam> teams = departmentTeamRepository.findByDepartment(department);
        
        int totalEmployees = teams.stream().mapToInt(DepartmentTeam::getMembersCount).sum();
        double avgCompetencyGap = teams.isEmpty() ? 0 : 
            teams.stream().mapToDouble(DepartmentTeam::getAvgCompetencyGap).average().orElse(0);
        double avgTrainingProgress = teams.isEmpty() ? 0 : 
            teams.stream().mapToDouble(DepartmentTeam::getTrainingProgress).average().orElse(0);
        int criticalSkillGaps = teams.stream().mapToInt(DepartmentTeam::getCriticalGaps).sum();

        return Map.of(
            "departmentName", department.getName(),
            "totalEmployees", totalEmployees,
            "totalTeams", teams.size(),
            "avgCompetencyGap", String.format("%.1f", avgCompetencyGap),
            "avgTrainingProgress", String.format("%.1f", avgTrainingProgress),
            "criticalSkillGaps", criticalSkillGaps,
            "pendingApprovals", knowledgeApprovalRepository.findByDepartmentAndStatus(
                department.getId(), "PENDING_REVIEW").size()
        );
    }

    // ===== TEAM MANAGEMENT =====
    public List<Map<String, Object>> getDepartmentTeams(String departmentHeadEmail) {
        Optional<Department> dept = departmentRepository.findByHeadEmail(departmentHeadEmail);
        if (dept.isEmpty()) return Collections.emptyList();

        return departmentTeamRepository.findByDepartment(dept.get())
            .stream()
            .map(this::teamToMap)
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getDepartmentEmployees(String departmentHeadEmail) {
        Optional<Department> dept = departmentRepository.findByHeadEmail(departmentHeadEmail);
        List<DepartmentTeam> teams = dept.map(departmentTeamRepository::findByDepartment).orElse(Collections.emptyList());
        List<User> employees = userRepository.findAll().stream()
            .filter(u -> dept.isEmpty() || (u.getDepartment() != null && u.getDepartment().equals(dept.get().getName())))
            .collect(Collectors.toList());

        return employees.stream().map(emp -> {
            DepartmentTeam team = teams.stream()
                .filter(t -> t.getName().contains(emp.getName()))
                .findFirst()
                .orElse(null);
            
            List<EmployeeSkill> skills = employeeSkillRepository.findByEmployeeEmail(emp.getEmail());
            double avgGap = skills.isEmpty() ? 0 : 
                skills.stream().mapToDouble(s -> 100 - (s.getProficiency() != null ? s.getProficiency() * 25 : 0)).average().orElse(0);

            Map<String, Object> employee = new HashMap<>();
            employee.put("id", emp.getId());
            employee.put("name", emp.getName());
            employee.put("email", emp.getEmail());
            employee.put("team", team != null ? team.getName() : "Unassigned");
            employee.put("role", emp.getRole());
            employee.put("status", "Active");
            employee.put("gap", String.format("%.0f", avgGap));
            employee.put("topSkill", skills.isEmpty() ? "N/A" : skills.get(0).getSkillName());
            employee.put("training", "In Progress");
            return employee;
        }).collect(Collectors.toList());
    }

    // ===== KNOWLEDGE GAPS ANALYSIS =====
    public List<Map<String, Object>> getKnowledgeGaps(String departmentHeadEmail) {
        Optional<Department> dept = departmentRepository.findByHeadEmail(departmentHeadEmail);
        if (dept.isEmpty()) return Collections.emptyList();

        List<DepartmentTeam> teams = departmentTeamRepository.findByDepartment(dept.get());
        
        return teams.stream()
            .flatMap(team -> {
                List<EmployeeSkill> skills = new ArrayList<>();
                // In a real implementation, fetch skills for all team members
                return skills.stream()
                    .map((EmployeeSkill s) -> {
                        Map<String, Object> gap = new HashMap<>();
                        int current = s.getProficiency() != null ? s.getProficiency() * 25 : 0;
                        gap.put("skillName", s.getSkillName());
                        gap.put("required", 85);
                        gap.put("current", current);
                        gap.put("gap", Math.max(0, 85 - current));
                        gap.put("severity", 85 - current > 30 ? "Critical" : "High");
                        gap.put("team", team.getName());
                        return gap;
                    });
            })
            .collect(Collectors.toList());
    }

    // ===== LEARNING PRIORITIES =====
    public List<Map<String, Object>> getLearningPriorities(String departmentHeadEmail) {
        Optional<Department> dept = departmentRepository.findByHeadEmail(departmentHeadEmail);
        if (dept.isEmpty()) return Collections.emptyList();

        return learningPriorityRepository.findActivePrioritiesByDepartment(dept.get().getId())
            .stream()
            .map(this::priorityToMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> createLearningPriority(String departmentHeadEmail, Map<String, Object> priorityData) {
        Optional<Department> dept = departmentRepository.findByHeadEmail(departmentHeadEmail);
        if (dept.isEmpty()) {
            return Map.of("error", "Department not found");
        }

        LearningPriority priority = new LearningPriority();
        priority.setDepartment(dept.get());
        priority.setSkillName((String) priorityData.get("skillName"));
        priority.setTargetTeams((String) priorityData.get("targetTeams"));
        priority.setTargetProficiencyLevel((Integer) priorityData.get("targetProficiencyLevel"));
        priority.setCurrentAvgProficiency((Integer) priorityData.getOrDefault("currentAvgProficiency", 50));
        priority.setPriority((String) priorityData.get("priority"));
        priority.setStatus("IN_PROGRESS");
        priority.setProgressPercentage(10);
        priority.setCreatedAt(LocalDateTime.now());
        priority.setUpdatedAt(LocalDateTime.now());

        LearningPriority saved = learningPriorityRepository.save(priority);
        return priorityToMap(saved);
    }

    // ===== KNOWLEDGE APPROVALS =====
    public List<Map<String, Object>> getKnowledgeApprovals(String departmentHeadEmail) {
        Optional<Department> dept = departmentRepository.findByHeadEmail(departmentHeadEmail);
        if (dept.isEmpty()) return Collections.emptyList();

        return knowledgeApprovalRepository.findRecentByDepartment(dept.get().getId())
            .stream()
            .map(this::approvalToMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> reviewKnowledgeApproval(Long approvalId, String departmentHeadEmail, String status, String reviewNotes) {
        Optional<KnowledgeApproval> approval = knowledgeApprovalRepository.findById(approvalId);
        if (approval.isEmpty()) {
            return Map.of("error", "Approval not found");
        }

        KnowledgeApproval item = approval.get();
        item.setStatus(status.toUpperCase());
        item.setReviewedBy(departmentHeadEmail);
        item.setReviewedDate(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        KnowledgeApproval saved = knowledgeApprovalRepository.save(item);
        return approvalToMap(saved);
    }

    // ===== TEAM LEADER REPORTS =====
    public List<Map<String, Object>> getTeamLeaderReports(String departmentHeadEmail) {
        Optional<Department> dept = departmentRepository.findByHeadEmail(departmentHeadEmail);
        if (dept.isEmpty()) return Collections.emptyList();

        return teamLeaderReportRepository.findRecentByDepartment(dept.get().getId())
            .stream()
            .map(this::reportToMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> resolveTeamLeaderReport(Long reportId, String departmentHeadEmail, String resolution) {
        Optional<TeamLeaderReport> report = teamLeaderReportRepository.findById(reportId);
        if (report.isEmpty()) {
            return Map.of("error", "Report not found");
        }

        TeamLeaderReport item = report.get();
        item.setStatus("RESOLVED");
        item.setReviewedBy(departmentHeadEmail);
        item.setReviewedDate(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        TeamLeaderReport saved = teamLeaderReportRepository.save(item);
        return reportToMap(saved);
    }

    // ===== HELPER METHODS =====
    private Map<String, Object> teamToMap(DepartmentTeam team) {
        return Map.of(
            "id", team.getId(),
            "name", team.getName(),
            "lead", team.getTeamLeadEmail(),
            "membersCount", team.getMembersCount(),
            "avgGap", team.getAvgCompetencyGap(),
            "trainingProgress", team.getTrainingProgress(),
            "activeProjects", team.getActiveProjects(),
            "criticalGaps", team.getCriticalGaps()
        );
    }

    private Map<String, Object> priorityToMap(LearningPriority priority) {
        return Map.of(
            "id", priority.getId(),
            "skill", priority.getSkillName(),
            "targetTeams", Arrays.asList(priority.getTargetTeams().split(",")),
            "targetLevel", priority.getTargetProficiencyLevel(),
            "currentAvg", priority.getCurrentAvgProficiency(),
            "priority", priority.getPriority(),
            "targetDate", priority.getTargetDate().toString(),
            "status", priority.getStatus(),
            "progress", priority.getProgressPercentage()
        );
    }

    private Map<String, Object> approvalToMap(KnowledgeApproval approval) {
        return Map.of(
            "id", approval.getId(),
            "title", approval.getTitle(),
            "type", approval.getType(),
            "author", approval.getAuthorName(),
            "team", approval.getTeamName(),
            "date", approval.getCreatedAt().toLocalDate().toString(),
            "status", approval.getStatus(),
            "summary", approval.getSummary()
        );
    }

    private Map<String, Object> reportToMap(TeamLeaderReport report) {
        return Map.of(
            "id", report.getId(),
            "team", report.getTeam().getName(),
            "lead", report.getSubmittedByName(),
            "date", report.getSubmittedDate().toLocalDate().toString(),
            "highlight", report.getHighlights(),
            "status", report.getStatus(),
            "riskLevel", report.getRiskLevel()
        );
    }
}
