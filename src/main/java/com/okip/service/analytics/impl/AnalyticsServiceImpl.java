package com.okip.service.analytics.impl;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.okip.dto.analytics.*;
import com.okip.entity.master.Department;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.entity.transaction.TrainingEnrollment;
import com.okip.enums.AssessmentStatus;
import com.okip.enums.GapStatus;
import com.okip.enums.SessionStatus;
import com.okip.enums.TrainingStatus;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.*;
import com.okip.service.analytics.AnalyticsService;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeJobRoleRepository employeeJobRoleRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final DepartmentRepository departmentRepository;
    private final SkillRepository skillRepository;
    private final TrainingEnrollmentRepository trainingEnrollmentRepository;
    private final KnowledgeSessionRepository knowledgeSessionRepository;
    private final SessionRegistrationRepository sessionRegistrationRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final SkillAssessmentRepository skillAssessmentRepository;
    private final NotificationRepository notificationRepository;

    public AnalyticsServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            EmployeeSkillRepository employeeSkillRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            DepartmentRepository departmentRepository,
            SkillRepository skillRepository,
            TrainingEnrollmentRepository trainingEnrollmentRepository,
            KnowledgeSessionRepository knowledgeSessionRepository,
            SessionRegistrationRepository sessionRegistrationRepository,
            MentorshipRequestRepository mentorshipRequestRepository,
            SkillAssessmentRepository skillAssessmentRepository,
            NotificationRepository notificationRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.departmentRepository = departmentRepository;
        this.skillRepository = skillRepository;
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
        this.knowledgeSessionRepository = knowledgeSessionRepository;
        this.sessionRegistrationRepository = sessionRegistrationRepository;
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.skillAssessmentRepository = skillAssessmentRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public EmployeeAnalyticsDTO getEmployeeAnalytics(Long employeeId) {
        Employee employee = getEmployee(employeeId);
        List<KnowledgeGap> gaps = getEmployeeGaps(employee);

        EmployeeAnalyticsDTO response = new EmployeeAnalyticsDTO();
        response.setEmployeeId(employee.getEmployeeId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());

        List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);
        if (!roles.isEmpty()) {
            response.setJobRoleName(roles.get(0).getJobRole().getJobRoleName());
        }

        response.setTotalSkills(gaps.size());
        int completedSkills = 0;
        double totalGap = 0.0;

        for (KnowledgeGap gap : gaps) {
            if ("COMPLETE".equals(gap.getGapType().name())) {
                completedSkills++;
            }
            if (gap.getGapPercentage() != null) {
                totalGap += gap.getGapPercentage();
            }
        }

        response.setCompletedSkills(completedSkills);
        response.setGapSkills(gaps.size() - completedSkills);

        if (!gaps.isEmpty()) {
            double averageGap = totalGap / gaps.size();
            response.setOverallGapPercentage(round(averageGap));
            response.setReadinessPercentage(round(100.0 - averageGap));
        } else {
            response.setOverallGapPercentage(0.0);
            response.setReadinessPercentage(100.0);
        }

        return response;
    }

    @Override
    public List<SkillGapAnalyticsDTO> getEmployeeSkillGaps(Long employeeId) {
        Employee employee = getEmployee(employeeId);
        List<KnowledgeGap> gaps = getEmployeeGaps(employee);

        List<SkillGapAnalyticsDTO> response = new ArrayList<>();
        for (KnowledgeGap gap : gaps) {
            SkillGapAnalyticsDTO dto = new SkillGapAnalyticsDTO();
            dto.setSkillName(gap.getSkill().getSkillName());
            dto.setGapType(gap.getGapType().name());
            dto.setGapPercentage(round(gap.getGapPercentage()));
            dto.setGapScore(round(gap.getGapScore()));
            response.add(dto);
        }
        return response;
    }

    @Override
    public List<ProficiencyAnalyticsDTO> getEmployeeProficiency(Long employeeId) {
        Employee employee = getEmployee(employeeId);
        List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);
        if (roles.isEmpty()) {
            return new ArrayList<>();
        }

        List<KnowledgeGap> gaps = knowledgeGapRepository.findByEmployeeJobRoleIn(roles);
        List<ProficiencyAnalyticsDTO> response = new ArrayList<>();
        for (KnowledgeGap gap : gaps) {
            ProficiencyAnalyticsDTO dto = new ProficiencyAnalyticsDTO();
            dto.setSkillName(gap.getSkill().getSkillName());
            dto.setCurrentProficiency(gap.getCurrentProficiency() == null ? "NONE" : gap.getCurrentProficiency().name());
            dto.setRequiredProficiency(gap.getRequiredProficiency() == null ? "NONE" : gap.getRequiredProficiency().name());
            response.add(dto);
        }
        return response;
    }

    @Override
    public List<TeamAnalyticsDTO> getTeamAnalytics() {
        List<Employee> employees = employeeRepository.findAll();
        List<TeamAnalyticsDTO> response = new ArrayList<>();

        for (Employee employee : employees) {
            List<KnowledgeGap> gaps = getEmployeeGaps(employee);
            if (gaps.isEmpty()) continue;

            double totalGap = 0.0;
            for (KnowledgeGap gap : gaps) {
                if (gap.getGapPercentage() != null) {
                    totalGap += gap.getGapPercentage();
                }
            }

            double averageGap = totalGap / gaps.size();
            TeamAnalyticsDTO dto = new TeamAnalyticsDTO();
            dto.setEmployeeId(employee.getEmployeeId());
            dto.setEmployeeCode(employee.getEmployeeCode());
            dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());

            List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);
            if (!roles.isEmpty()) {
                dto.setJobRoleName(roles.get(0).getJobRole().getJobRoleName());
            }

            dto.setGapPercentage(round(averageGap));
            dto.setReadinessPercentage(round(100.0 - averageGap));
            response.add(dto);
        }
        return response;
    }

    @Override
    public List<DepartmentAnalyticsDTO> getDepartmentAnalytics() {
        List<Employee> employees = employeeRepository.findAll();
        Map<String, List<Employee>> employeesByDepartment = new LinkedHashMap<>();

        for (Employee employee : employees) {
            if (employee.getDepartment() == null) continue;
            String departmentName = employee.getDepartment().getDepartmentName();
            employeesByDepartment.computeIfAbsent(departmentName, key -> new ArrayList<>()).add(employee);
        }

        List<DepartmentAnalyticsDTO> response = new ArrayList<>();
        for (Map.Entry<String, List<Employee>> entry : employeesByDepartment.entrySet()) {
            String departmentName = entry.getKey();
            List<Employee> departmentEmployees = entry.getValue();

            double totalGap = 0.0;
            int employeesWithGaps = 0;

            for (Employee employee : departmentEmployees) {
                List<KnowledgeGap> gaps = getEmployeeGaps(employee);
                if (gaps.isEmpty()) continue;

                double employeeGap = 0.0;
                for (KnowledgeGap gap : gaps) {
                    if (gap.getGapPercentage() != null) {
                        employeeGap += gap.getGapPercentage();
                    }
                }
                totalGap += employeeGap / gaps.size();
                employeesWithGaps++;
            }

            if (employeesWithGaps == 0) continue;

            double averageGap = totalGap / employeesWithGaps;
            DepartmentAnalyticsDTO dto = new DepartmentAnalyticsDTO();
            dto.setDepartmentName(departmentName);
            dto.setEmployeeCount(departmentEmployees.size());
            dto.setAverageGapPercentage(round(averageGap));
            dto.setAverageReadinessPercentage(round(100.0 - averageGap));
            response.add(dto);
        }
        return response;
    }

    @Override
    public ManagerHeatmapDTO getManagerTeamHeatmap() {
        List<Skill> allSkills = skillRepository.findAll();
        List<String> skillHeaders = allSkills.stream().map(Skill::getSkillName).collect(Collectors.toList());

        List<Employee> employees = employeeRepository.findAll();
        List<ManagerHeatmapDTO.EmployeeHeatmapRow> rows = new ArrayList<>();

        for (Employee emp : employees) {
            List<KnowledgeGap> gaps = getEmployeeGaps(emp);
            List<EmployeeSkill> empSkills = employeeSkillRepository.findByEmployee(emp);

            ManagerHeatmapDTO.EmployeeHeatmapRow row = new ManagerHeatmapDTO.EmployeeHeatmapRow();
            row.setEmployeeId(emp.getEmployeeId());
            row.setEmployeeCode(emp.getEmployeeCode());
            row.setEmployeeName(emp.getFirstName() + " " + emp.getLastName());

            List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(emp);
            row.setJobRole(roles.isEmpty() ? "N/A" : roles.get(0).getJobRole().getJobRoleName());

            double avgGap = gaps.isEmpty() ? 0.0 : gaps.stream().mapToDouble(g -> g.getGapPercentage() != null ? g.getGapPercentage() : 0.0).average().orElse(0.0);
            row.setReadinessPercentage(round(100.0 - avgGap));

            Map<String, ManagerHeatmapDTO.SkillCellInfo> cells = new HashMap<>();
            for (Skill s : allSkills) {
                KnowledgeGap matchGap = gaps.stream().filter(g -> g.getSkill().getSkillId().equals(s.getSkillId())).findFirst().orElse(null);
                EmployeeSkill matchSkill = empSkills.stream().filter(es -> es.getSkill().getSkillId().equals(s.getSkillId())).findFirst().orElse(null);

                String currentProf = matchSkill != null && matchSkill.getProficiencyLevel() != null ? matchSkill.getProficiencyLevel().name() : (matchGap != null && matchGap.getCurrentProficiency() != null ? matchGap.getCurrentProficiency().name() : "NONE");
                String reqProf = matchGap != null && matchGap.getRequiredProficiency() != null ? matchGap.getRequiredProficiency().name() : "N/A";
                String gapType = matchGap != null ? matchGap.getGapType().name() : "NOT_APPLICABLE";
                Double score = matchGap != null ? matchGap.getGapScore() : 0.0;

                cells.put(s.getSkillName(), new ManagerHeatmapDTO.SkillCellInfo(currentProf, reqProf, gapType, score));
            }
            row.setSkillCells(cells);
            rows.add(row);
        }

        ManagerHeatmapDTO result = new ManagerHeatmapDTO();
        result.setSkillHeaders(skillHeaders);
        result.setEmployeeRows(rows);
        return result;
    }

    @Override
    public List<HighRiskGapDTO> getHighRiskGaps() {
        List<KnowledgeGap> allGaps = knowledgeGapRepository.findAll();
        List<HighRiskGapDTO> highRisk = new ArrayList<>();

        for (KnowledgeGap gap : allGaps) {
            if (gap.getGapPercentage() != null && gap.getGapPercentage() >= 40.0 && gap.getStatus() == GapStatus.OPEN) {
                Employee emp = gap.getEmployeeJobRole().getEmployee();
                HighRiskGapDTO dto = new HighRiskGapDTO();
                dto.setEmployeeId(emp.getEmployeeId());
                dto.setEmployeeName(emp.getFirstName() + " " + emp.getLastName());
                dto.setEmployeeCode(emp.getEmployeeCode());
                dto.setDepartment(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "N/A");
                dto.setJobRole(gap.getEmployeeJobRole().getJobRole().getJobRoleName());
                dto.setSkillName(gap.getSkill().getSkillName());
                dto.setRequiredProficiency(gap.getRequiredProficiency() != null ? gap.getRequiredProficiency().name() : "N/A");
                dto.setCurrentProficiency(gap.getCurrentProficiency() != null ? gap.getCurrentProficiency().name() : "NONE");
                dto.setGapType(gap.getGapType().name());
                dto.setGapPercentage(round(gap.getGapPercentage()));

                if (gap.getGapPercentage() >= 80.0) {
                    dto.setRiskLevel("CRITICAL");
                } else if (gap.getGapPercentage() >= 50.0) {
                    dto.setRiskLevel("HIGH");
                } else {
                    dto.setRiskLevel("MEDIUM");
                }
                highRisk.add(dto);
            }
        }
        return highRisk;
    }

    @Override
    public HRWorkforceSummaryDTO getHRWorkforceSummary() {
        List<Employee> employees = employeeRepository.findAll();
        List<Department> departments = departmentRepository.findAll();
        List<Skill> skills = skillRepository.findAll();
        List<TrainingEnrollment> enrollments = trainingEnrollmentRepository.findAll();

        HRWorkforceSummaryDTO summary = new HRWorkforceSummaryDTO();
        summary.setTotalEmployees(employees.size());
        summary.setTotalDepartments(departments.size());
        summary.setTotalSkillsTracked(skills.size());

        long completedTrainings = enrollments.stream().filter(e -> e.getStatus() == TrainingStatus.COMPLETED || e.getStatus() == TrainingStatus.CERTIFIED).count();
        summary.setTotalTrainingsCompleted(completedTrainings);

        List<TeamAnalyticsDTO> teamAnalytics = getTeamAnalytics();
        double avgReadiness = teamAnalytics.isEmpty() ? 100.0 : teamAnalytics.stream().mapToDouble(TeamAnalyticsDTO::getReadinessPercentage).average().orElse(100.0);
        summary.setOverallOrgReadiness(round(avgReadiness));
        summary.setAverageGapScore(round(100.0 - avgReadiness));

        // Skill category distribution
        Map<String, Long> categoryMap = skills.stream()
                .collect(Collectors.groupingBy(s -> s.getSkillCategory() != null ? s.getSkillCategory().name() : "OTHER", Collectors.counting()));
        summary.setSkillCategoryDistribution(categoryMap);

        // Proficiency distribution
        List<EmployeeSkill> allEmpSkills = employeeSkillRepository.findAll();
        Map<String, Long> profMap = allEmpSkills.stream()
                .collect(Collectors.groupingBy(es -> es.getProficiencyLevel() != null ? es.getProficiencyLevel().name() : "BEGINNER", Collectors.counting()));
        summary.setProficiencyDistribution(profMap);

        summary.setDepartmentSummaries(getDepartmentComparisons());
        return summary;
    }

    @Override
    public List<DepartmentComparisonDTO> getDepartmentComparisons() {
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentComparisonDTO> list = new ArrayList<>();

        for (Department dept : departments) {
            List<Employee> deptEmps = employeeRepository.findAll().stream()
                    .filter(e -> e.getDepartment() != null && e.getDepartment().getDepartmentId().equals(dept.getDepartmentId()))
                    .collect(Collectors.toList());

            DepartmentComparisonDTO dto = new DepartmentComparisonDTO();
            dto.setDepartmentId(dept.getDepartmentId());
            dto.setDepartmentName(dept.getDepartmentName());
            dto.setEmployeeCount(deptEmps.size());

            double totalReadiness = 0.0;
            int count = 0;
            long openGaps = 0;
            long completedTrainings = 0;
            long activeEnrollments = 0;

            for (Employee e : deptEmps) {
                List<KnowledgeGap> gaps = getEmployeeGaps(e);
                if (!gaps.isEmpty()) {
                    double avgGap = gaps.stream().mapToDouble(g -> g.getGapPercentage() != null ? g.getGapPercentage() : 0.0).average().orElse(0.0);
                    totalReadiness += (100.0 - avgGap);
                    count++;
                    openGaps += gaps.stream().filter(g -> g.getStatus() == GapStatus.OPEN).count();
                }

                List<TrainingEnrollment> empEnrollments = trainingEnrollmentRepository.findByEmployee(e);
                for (TrainingEnrollment te : empEnrollments) {
                    if (te.getStatus() == TrainingStatus.COMPLETED || te.getStatus() == TrainingStatus.CERTIFIED) {
                        completedTrainings++;
                    } else if (te.getStatus() == TrainingStatus.IN_PROGRESS) {
                        activeEnrollments++;
                    }
                }
            }

            dto.setAverageReadinessPercentage(count > 0 ? round(totalReadiness / count) : 100.0);
            dto.setAverageGapScore(count > 0 ? round(100.0 - (totalReadiness / count)) : 0.0);
            dto.setOpenGapsCount(openGaps);
            dto.setCompletedTrainingsCount(completedTrainings);
            dto.setActiveEnrollmentsCount(activeEnrollments);

            list.add(dto);
        }
        return list;
    }

    @Override
    public DashboardSummaryDTO getMyDashboardSummary() {
        Employee employee = getLoggedInEmployee();
        return buildDashboardSummary(employee);
    }

    @Override
    public DashboardSummaryDTO getEmployeeDashboardSummary(Long employeeId) {
        Employee employee = getEmployee(employeeId);
        return buildDashboardSummary(employee);
    }

    private DashboardSummaryDTO buildDashboardSummary(Employee employee) {
        DashboardSummaryDTO summary = new DashboardSummaryDTO();
        summary.setEmployeeId(employee.getEmployeeId());
        summary.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        summary.setDepartment(employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : "N/A");

        List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);
        summary.setJobRole(roles.isEmpty() ? "Associate" : roles.get(0).getJobRole().getJobRoleName());

        List<KnowledgeGap> gaps = getEmployeeGaps(employee);
        summary.setTotalSkillsRequired(gaps.size());

        int mastered = 0;
        int openGaps = 0;
        double totalGap = 0.0;

        for (KnowledgeGap g : gaps) {
            if ("COMPLETE".equals(g.getGapType().name()) || g.getStatus() == GapStatus.CLOSED) {
                mastered++;
            } else {
                openGaps++;
            }
            if (g.getGapPercentage() != null) {
                totalGap += g.getGapPercentage();
            }
        }

        summary.setSkillsMastered(mastered);
        summary.setOpenGaps(openGaps);

        if (!gaps.isEmpty()) {
            double avgGap = totalGap / gaps.size();
            summary.setOverallGapPercentage(round(avgGap));
            summary.setReadinessPercentage(round(100.0 - avgGap));
        } else {
            summary.setOverallGapPercentage(0.0);
            summary.setReadinessPercentage(100.0);
        }

        List<TrainingEnrollment> enrollments = trainingEnrollmentRepository.findByEmployee(employee);
        summary.setEnrolledTrainingsCount((int) enrollments.stream().filter(e -> e.getStatus() == TrainingStatus.IN_PROGRESS || e.getStatus() == TrainingStatus.NOT_STARTED).count());
        summary.setCompletedTrainingsCount((int) enrollments.stream().filter(e -> e.getStatus() == TrainingStatus.COMPLETED || e.getStatus() == TrainingStatus.CERTIFIED).count());

        long upcomingSessions = knowledgeSessionRepository.findAllByOrderBySessionDateDesc().stream()
                .filter(s -> s.getStatus() == SessionStatus.UPCOMING && s.getSessionDate().isAfter(LocalDateTime.now()))
                .count();
        summary.setUpcomingSessionsCount((int) upcomingSessions);

        summary.setActiveMentorshipsCount(mentorshipRequestRepository.findActiveMentorshipsForEmployee(employee).size());
        summary.setPendingAssessmentsCount(skillAssessmentRepository.findByEmployeeAndStatusOrderByCreatedAtDesc(employee, AssessmentStatus.PENDING_REVIEW).size());
        summary.setUnreadNotificationsCount((int) notificationRepository.countByRecipientAndIsReadFalse(employee));

        return summary;
    }

    private Employee getLoggedInEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return employeeRepository.findByOfficialEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found."));
    }

    private Employee getEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
    }

    private List<KnowledgeGap> getEmployeeGaps(Employee employee) {
        List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);
        if (roles.isEmpty()) return new ArrayList<>();
        return knowledgeGapRepository.findByEmployeeJobRoleIn(roles);
    }

    @Override
    public Long getEmployeeIdByEmail(String email) {
        Employee employee = employeeRepository.findByOfficialEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
        return employee.getEmployeeId();
    }

    private double round(Double value) {
        if (value == null) return 0.0;
        return Math.round(value * 100.0) / 100.0;
    }
}
