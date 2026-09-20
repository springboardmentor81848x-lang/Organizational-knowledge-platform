package com.okip.service.manager;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.ai.AiRecommendationResponseDTO;
import com.okip.dto.analytics.DepartmentAnalyticsDTO;
import com.okip.dto.analytics.EmployeeAnalyticsDTO;
import com.okip.dto.analytics.ProficiencyAnalyticsDTO;
import com.okip.dto.analytics.SkillGapAnalyticsDTO;
import com.okip.dto.analytics.SkillGapHeatmapDTO;
import com.okip.dto.analytics.TeamAnalyticsDTO;
import com.okip.dto.gap.GapAnalysisResponseDTO;
import com.okip.entity.assessment.AssessmentAttempt;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.EmployeeTraining;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.entity.transaction.JobRoleCompetency;
import com.okip.entity.transaction.TrainingSkill;
import com.okip.repository.TrainingSkillRepository;
import com.okip.enums.ProficiencyLevel;
import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.EmployeeTrainingRepository;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.repository.JobRoleCompetencyRepository;
import com.okip.repository.assessment.AssessmentAttemptRepository;
import com.okip.repository.TrainingRepository;
import com.okip.service.ai.AiRecommendationService;
import com.okip.service.analytics.AnalyticsService;
import com.okip.service.gap.GapAnalysisService;

@Service
public class ManagerServiceImpl implements ManagerService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeJobRoleRepository employeeJobRoleRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeTrainingRepository employeeTrainingRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final JobRoleCompetencyRepository jobRoleCompetencyRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingSkillRepository trainingSkillRepository;
    private final AnalyticsService analyticsService;
    private final GapAnalysisService gapAnalysisService;
    private final AiRecommendationService aiRecommendationService;

    public ManagerServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            EmployeeSkillRepository employeeSkillRepository,
            EmployeeTrainingRepository employeeTrainingRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            JobRoleCompetencyRepository jobRoleCompetencyRepository,
            TrainingRepository trainingRepository,
            TrainingSkillRepository trainingSkillRepository,
            AnalyticsService analyticsService,
            GapAnalysisService gapAnalysisService,
            AiRecommendationService aiRecommendationService) {
        this.employeeRepository = employeeRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.employeeTrainingRepository = employeeTrainingRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.jobRoleCompetencyRepository = jobRoleCompetencyRepository;
        this.trainingRepository = trainingRepository;
        this.trainingSkillRepository = trainingSkillRepository;
        this.analyticsService = analyticsService;
        this.gapAnalysisService = gapAnalysisService;
        this.aiRecommendationService = aiRecommendationService;
    }

    private Employee currentManager() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Authenticated manager is required.");
        }
        return employeeRepository.findByOfficialEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated manager was not found."));
    }

    private List<Employee> teamEmployees() {
        Employee manager = currentManager();
        return employeeJobRoleRepository.findByAssignedByAndActiveTrue(manager)
                .stream()
                .map(EmployeeJobRole::getEmployee)
                .filter(e -> e != null && e.getEmployeeId() != null)
                .collect(Collectors.toMap(Employee::getEmployeeId, e -> e,
                        (first, second) -> first, LinkedHashMap::new))
                .values().stream().toList();
    }

    private void requireTeamMember(Long employeeId) {
        boolean allowed = teamEmployees().stream()
                .anyMatch(e -> e.getEmployeeId().equals(employeeId));
        if (!allowed) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "The selected employee is not assigned to this manager.");
        }
    }

    @Override
    public List<TeamAnalyticsDTO> getTeam() {
        List<TeamAnalyticsDTO> result = new ArrayList<>();

        for (Employee employee : teamEmployees()) {
            List<KnowledgeGap> gaps = knowledgeGapRepository
                    .findByEmployeeJobRole_Employee_EmployeeId(employee.getEmployeeId());

            double total = gaps.stream()
                    .filter(g -> g.getGapPercentage() != null)
                    .mapToDouble(KnowledgeGap::getGapPercentage)
                    .sum();

            long count = gaps.stream()
                    .filter(g -> g.getGapPercentage() != null)
                    .count();

            double avgGap = count == 0 ? 0.0 : total / count;

            TeamAnalyticsDTO dto = new TeamAnalyticsDTO();
            dto.setEmployeeId(employee.getEmployeeId());
            dto.setEmployeeCode(employee.getEmployeeCode());
            dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());

            employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee).stream()
                    .findFirst()
                    .ifPresent(r -> dto.setJobRoleName(r.getJobRole().getJobRoleName()));

            dto.setGapPercentage(round(avgGap));
            dto.setReadinessPercentage(round(Math.max(0, 100.0 - avgGap)));

            boolean hasRoleCompetencies = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee)
                    .stream()
                    .anyMatch(role -> !jobRoleCompetencyRepository.findByJobRole(role.getJobRole()).isEmpty());

            dto.setAnalysisStatus(!gaps.isEmpty()
                    ? "READY"
                    : (hasRoleCompetencies ? "NOT_RUN" : "NO_COMPETENCIES"));
            result.add(dto);
        }

        return result;
    }

    @Override
    public List<SkillGapHeatmapDTO> getTeamHeatmap() {
        Map<String,List<Double>> gaps = new LinkedHashMap<>();
        for (Employee employee : teamEmployees()) {
            for (KnowledgeGap gap : knowledgeGapRepository
                    .findByEmployeeJobRole_Employee_EmployeeId(employee.getEmployeeId())) {
                if (gap.getSkill() != null && gap.getGapPercentage() != null) {
                    gaps.computeIfAbsent(gap.getSkill().getSkillName(), k -> new ArrayList<>())
                            .add(gap.getGapPercentage());
                }
            }
        }
        List<SkillGapHeatmapDTO> result = new ArrayList<>();
        gaps.forEach((skill, values) -> {
            SkillGapHeatmapDTO dto = new SkillGapHeatmapDTO();
            dto.setSkillName(skill);
            dto.setEmployeeCount(values.size());
            dto.setAverageGapPercentage(round(values.stream().mapToDouble(Double::doubleValue).average().orElse(0)));
            result.add(dto);
        });
        result.sort((a,b) -> Double.compare(b.getAverageGapPercentage(), a.getAverageGapPercentage()));
        return result;
    }

    @Override
    public List<DepartmentAnalyticsDTO> getTeamDepartments() {
        Map<String, List<Employee>> grouped = new LinkedHashMap<>();

        for (Employee employee : teamEmployees()) {
            if (employee.getDepartment() != null) {
                grouped.computeIfAbsent(
                        employee.getDepartment().getDepartmentName(),
                        k -> new ArrayList<>())
                        .add(employee);
            }
        }

        List<DepartmentAnalyticsDTO> result = new ArrayList<>();

        grouped.forEach((name, employees) -> {
            double gapTotal = 0.0;

            for (Employee employee : employees) {
                List<KnowledgeGap> gaps = knowledgeGapRepository
                        .findByEmployeeJobRole_Employee_EmployeeId(employee.getEmployeeId());

                double employeeGap = gaps.stream()
                        .filter(g -> g.getGapPercentage() != null)
                        .mapToDouble(KnowledgeGap::getGapPercentage)
                        .average()
                        .orElse(0.0);

                gapTotal += employeeGap;
            }

            double avgGap = employees.isEmpty() ? 0.0 : gapTotal / employees.size();

            DepartmentAnalyticsDTO dto = new DepartmentAnalyticsDTO();
            dto.setDepartmentName(name);
            dto.setEmployeeCount(employees.size());
            dto.setAverageGapPercentage(round(avgGap));
            dto.setAverageReadinessPercentage(round(Math.max(0, 100.0 - avgGap)));
            result.add(dto);
        });

        return result;
    }

    @Override public EmployeeAnalyticsDTO getEmployeeSummary(Long id) {
        requireTeamMember(id);
        return analyticsService.getEmployeeAnalytics(id);
    }

    @Override public List<SkillGapAnalyticsDTO> getEmployeeGaps(Long id) {
        requireTeamMember(id);
        return analyticsService.getEmployeeSkillGaps(id);
    }

    @Override public List<ProficiencyAnalyticsDTO> getEmployeeProficiency(Long id) {
        requireTeamMember(id);
        return analyticsService.getEmployeeProficiency(id);
    }

    @Override public GapAnalysisResponseDTO getGapAnalysis(Long id) {
        requireTeamMember(id);
        return gapAnalysisService.getEmployeeGapAnalysis(id);
    }

    @Override @Transactional
    public GapAnalysisResponseDTO runGapAnalysis(Long id) {
        requireTeamMember(id);
        return gapAnalysisService.runGapAnalysis(id);
    }

    @Override
    public AiRecommendationResponseDTO generateRecommendation(Long id) {
        requireTeamMember(id);
        return aiRecommendationService.generateRecommendation(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String,Object> getTrainingAnalytics() {
        List<Employee> team = teamEmployees();
        List<Long> ids = team.stream().map(Employee::getEmployeeId).toList();

        List<EmployeeTraining> enrollmentRows = employeeTrainingRepository.findAll().stream()
                .filter(x -> x.getEmployee() != null
                        && x.getEmployee().getEmployeeId() != null
                        && ids.contains(x.getEmployee().getEmployeeId()))
                .toList();

        long notStarted = enrollmentRows.stream()
                .filter(x -> x.getStatus() == EmployeeTraining.Status.NOT_STARTED).count();
        long inProgress = enrollmentRows.stream()
                .filter(x -> x.getStatus() == EmployeeTraining.Status.IN_PROGRESS).count();
        long completed = enrollmentRows.stream()
                .filter(x -> x.getStatus() == EmployeeTraining.Status.COMPLETED).count();

        double avgProgress = enrollmentRows.stream()
                .mapToDouble(EmployeeTraining::getProgressPercentage)
                .average().orElse(0.0);

        Map<String,Object> response = new LinkedHashMap<>();
        response.put("teamSize", team.size());
        long enrolledEmployees = enrollmentRows.stream()
                .map(x -> x.getEmployee().getEmployeeId())
                .distinct().count();
        response.put("enrollments", enrollmentRows.size());
        response.put("enrolledEmployees", enrolledEmployees);
        response.put("adoptionRate", team.isEmpty() ? 0.0 : round(enrolledEmployees * 100.0 / team.size()));
        response.put("notStarted", notStarted);
        response.put("inProgress", inProgress);
        response.put("completed", completed);
        response.put("completionRate", enrollmentRows.isEmpty() ? 0.0 : round(completed * 100.0 / enrollmentRows.size()));
        response.put("averageProgress", round(avgProgress));
        response.put("trainingCatalogSize", trainingRepository.count());

        // Keep every catalog training visible, even when nobody has enrolled yet.
        List<KnowledgeGap> openGaps = team.stream()
                .flatMap(employee -> knowledgeGapRepository
                        .findByEmployeeJobRole_Employee_EmployeeId(employee.getEmployeeId()).stream())
                .filter(g -> g.getStatus() != null
                        && "OPEN".equals(g.getStatus().name())
                        && g.getSkill() != null)
                .toList();

        response.put("catalog", trainingRepository.findAll().stream().map(training -> {
            List<TrainingSkill> mappings = trainingSkillRepository.findByTrainingWithSkill(training);
            long matchedGaps = mappings.stream()
                    .filter(m -> m.getSkill() != null
                            && openGaps.stream().anyMatch(g ->
                                    g.getSkill().getSkillId().equals(m.getSkill().getSkillId())))
                    .count();

            long trainingEnrollments = enrollmentRows.stream()
                    .filter(x -> x.getTraining().getTrainingId().equals(training.getTrainingId()))
                    .count();
            long trainingCompleted = enrollmentRows.stream()
                    .filter(x -> x.getTraining().getTrainingId().equals(training.getTrainingId())
                            && x.getStatus() == EmployeeTraining.Status.COMPLETED)
                    .count();
            double trainingProgress = enrollmentRows.stream()
                    .filter(x -> x.getTraining().getTrainingId().equals(training.getTrainingId()))
                    .mapToDouble(EmployeeTraining::getProgressPercentage)
                    .average().orElse(0.0);

            Map<String,Object> m = new LinkedHashMap<>();
            m.put("trainingId", training.getTrainingId());
            m.put("trainingName", training.getTrainingName());
            m.put("provider", training.getProvider());
            m.put("duration", training.getDuration());
            m.put("level", training.getLevel());
            m.put("description", training.getDescription());
            m.put("courseUrl", training.getCourseUrl());
            m.put("mappedSkills", mappings.stream()
                    .filter(ts -> ts.getSkill() != null)
                    .map(ts -> ts.getSkill().getSkillName())
                    .distinct().sorted().toList());
            m.put("matchedGapSkills", mappings.stream()
                    .filter(ts -> ts.getSkill() != null
                            && openGaps.stream().anyMatch(g ->
                                    g.getSkill().getSkillId().equals(ts.getSkill().getSkillId())))
                    .map(ts -> ts.getSkill().getSkillName())
                    .distinct().sorted().toList());
            m.put("matchedGapCount", matchedGaps);
            m.put("enrolled", trainingEnrollments);
            m.put("completed", trainingCompleted);
            m.put("averageProgress", round(trainingProgress));
            return m;
        }).sorted((a,b) -> Long.compare(
                ((Number)b.get("matchedGapCount")).longValue(),
                ((Number)a.get("matchedGapCount")).longValue()))
        .toList());

        response.put("enrollmentsData", enrollmentRows.stream().map(x -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("employeeId", x.getEmployee().getEmployeeId());
            m.put("employeeName", x.getEmployee().getFirstName()+" "+x.getEmployee().getLastName());
            m.put("trainingId", x.getTraining().getTrainingId());
            m.put("trainingName", x.getTraining().getTrainingName());
            m.put("status", x.getStatus().name());
            m.put("progressPercentage", x.getProgressPercentage());
            m.put("hoursSpent", x.getHoursSpent());
            return m;
        }).toList());

        response.put("individualProgress", team.stream().map(employee -> {
            List<EmployeeTraining> employeeRows = enrollmentRows.stream()
                    .filter(x -> x.getEmployee().getEmployeeId().equals(employee.getEmployeeId()))
                    .toList();
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("employeeId", employee.getEmployeeId());
            m.put("employeeName", employee.getFirstName()+" "+employee.getLastName());
            m.put("trainingCount", employeeRows.size());
            m.put("completedTraining", employeeRows.stream()
                    .filter(x -> x.getStatus() == EmployeeTraining.Status.COMPLETED).count());
            m.put("averageProgress", round(employeeRows.stream()
                    .mapToDouble(EmployeeTraining::getProgressPercentage).average().orElse(0.0)));
            m.put("hoursSpent", round(employeeRows.stream()
                    .mapToDouble(EmployeeTraining::getHoursSpent).sum()));
            return m;
        }).toList());

        return response;
    }

    @Override
    public Map<String,Object> getAssessmentAnalytics() {
        List<Long> ids = teamEmployees().stream().map(Employee::getEmployeeId).toList();
        List<AssessmentAttempt> attempts = assessmentAttemptRepository.findAll().stream()
                .filter(a -> a.getEmployee() != null && ids.contains(a.getEmployee().getEmployeeId()))
                .toList();

        long submitted = attempts.stream().filter(a -> a.getStatus() == AssessmentAttempt.Status.SUBMITTED).count();
        long inProgress = attempts.stream().filter(a -> a.getStatus() == AssessmentAttempt.Status.IN_PROGRESS).count();
        double avg = attempts.stream().filter(a -> a.getStatus() == AssessmentAttempt.Status.SUBMITTED && a.getPercentage() != null)
                .mapToDouble(AssessmentAttempt::getPercentage).average().orElse(0);

        Map<String,Object> response = new LinkedHashMap<>();
        response.put("teamSize", ids.size());
        response.put("attempts", attempts.size());
        response.put("submitted", submitted);
        response.put("inProgress", inProgress);
        response.put("averageScore", round(avg));
        response.put("self", attempts.stream().filter(a -> a.getAssessment().getAssessmentType() == com.okip.entity.assessment.Assessment.AssessmentType.SELF).count());
        response.put("peer", attempts.stream().filter(a -> a.getAssessment().getAssessmentType() == com.okip.entity.assessment.Assessment.AssessmentType.PEER).count());
        response.put("manager", attempts.stream().filter(a -> a.getAssessment().getAssessmentType() == com.okip.entity.assessment.Assessment.AssessmentType.MANAGER).count());
        response.put("rows", attempts.stream().map(a -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("attemptId", a.getAttemptId());
            m.put("employeeId", a.getEmployee().getEmployeeId());
            m.put("employeeName", a.getEmployee().getFirstName()+" "+a.getEmployee().getLastName());
            m.put("assessmentName", a.getAssessment().getAssessmentName());
            m.put("assessmentType", a.getAssessment().getAssessmentType().name());
            m.put("status", a.getStatus().name());
            m.put("score", a.getScore());
            m.put("percentage", a.getPercentage());
            m.put("submittedAt", a.getSubmittedAt());
            return m;
        }).toList());
        return response;
    }

    @Override
    public Map<String,Object> getReport() {
        Map<String,Object> response = new LinkedHashMap<>();
        response.put("team", getTeam());
        response.put("heatmap", getTeamHeatmap());
        response.put("departments", getTeamDepartments());
        response.put("departmentSkillCoverage", getDepartmentSkillCoverage());
        response.put("training", getTrainingAnalytics());
        response.put("assessments", getAssessmentAnalytics());
        response.put("generatedFor", currentManager().getOfficialEmail());
        return response;
    }

    /**
     * Calculates real skill coverage from active job-role competencies
     * and the employee_skills table for the manager's team.
     */
    private List<Map<String, Object>> getDepartmentSkillCoverage() {
        Map<String, List<Employee>> grouped = new LinkedHashMap<>();

        for (Employee employee : teamEmployees()) {
            if (employee.getDepartment() != null) {
                grouped.computeIfAbsent(
                        employee.getDepartment().getDepartmentName(),
                        k -> new ArrayList<>())
                        .add(employee);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        grouped.forEach((departmentName, employees) -> {
            int requiredSkills = 0;
            int coveredSkills = 0;

            for (Employee employee : employees) {
                List<EmployeeJobRole> roles =
                        employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);

                for (EmployeeJobRole role : roles) {
                    List<JobRoleCompetency> competencies =
                            jobRoleCompetencyRepository.findByJobRole(role.getJobRole());

                    for (JobRoleCompetency competency : competencies) {
                        if (competency.getSkill() == null
                                || competency.getRequiredProficiency() == null) {
                            continue;
                        }

                        requiredSkills++;

                        EmployeeSkill employeeSkill =
                                employeeSkillRepository
                                        .findByEmployeeAndSkill(
                                                employee, competency.getSkill())
                                        .orElse(null);

                        if (employeeSkill != null
                                && employeeSkill.getProficiencyLevel() != null
                                && employeeSkill.getProficiencyLevel().ordinal()
                                        >= competency.getRequiredProficiency().ordinal()) {
                            coveredSkills++;
                        }
                    }
                }
            }

            double coverage = requiredSkills == 0
                    ? 0.0
                    : coveredSkills * 100.0 / requiredSkills;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("departmentName", departmentName);
            row.put("employeeCount", employees.size());
            row.put("requiredSkills", requiredSkills);
            row.put("coveredSkills", coveredSkills);
            row.put("skillCoveragePercentage", round(coverage));
            result.add(row);
        });

        return result;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
