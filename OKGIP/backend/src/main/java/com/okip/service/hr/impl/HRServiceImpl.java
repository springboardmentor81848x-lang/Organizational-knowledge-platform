package com.okip.service.hr.impl;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.hr.AssessmentSummaryDTO;
import com.okip.dto.hr.DepartmentSummaryDTO;
import com.okip.dto.hr.EmployeeApprovalResponseDTO;
import com.okip.dto.hr.GrowthPointDTO;
import com.okip.dto.hr.HRDashboardDTO;
import com.okip.dto.hr.PendingEmployeeDTO;
import com.okip.dto.hr.SkillGapSummaryDTO;
import com.okip.dto.hr.TrainingStatusDTO;
import com.okip.entity.assessment.Assessment;
import com.okip.entity.assessment.AssessmentAttempt;
import com.okip.entity.master.Department;
import com.okip.entity.master.Employee;
import com.okip.entity.master.JobRole;
import com.okip.entity.master.Skill;
import com.okip.entity.master.Training;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.JobRoleCompetency;
import com.okip.entity.transaction.TrainingSkill;
import com.okip.entity.transaction.EmployeeTraining;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.entity.transaction.MentorshipRequest;
import com.okip.enums.AccountStatus;
import com.okip.enums.GapStatus;
import com.okip.enums.GapType;
import com.okip.enums.ProficiencyLevel;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.DepartmentRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.JobRoleCompetencyRepository;
import com.okip.repository.EmployeeTrainingRepository;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.repository.MentorshipRequestRepository;
import com.okip.repository.JobRoleRepository;
import com.okip.repository.SkillRepository;
import com.okip.repository.TrainingRepository;
import com.okip.repository.TrainingSkillRepository;
import com.okip.repository.assessment.AssessmentAttemptRepository;
import com.okip.repository.assessment.AssessmentRepository;
import com.okip.service.hr.HRService;

@Service
public class HRServiceImpl implements HRService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeTrainingRepository employeeTrainingRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final DepartmentRepository departmentRepository;
    private final JobRoleRepository jobRoleRepository;
    private final SkillRepository skillRepository;
    private final JobRoleCompetencyRepository jobRoleCompetencyRepository;
    private final EmployeeJobRoleRepository employeeJobRoleRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingSkillRepository trainingSkillRepository;
    private final AssessmentRepository assessmentRepository;

    public HRServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            EmployeeTrainingRepository employeeTrainingRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            MentorshipRequestRepository mentorshipRequestRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            DepartmentRepository departmentRepository,
            JobRoleRepository jobRoleRepository,
            SkillRepository skillRepository,
            JobRoleCompetencyRepository jobRoleCompetencyRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            TrainingRepository trainingRepository,
            TrainingSkillRepository trainingSkillRepository,
            AssessmentRepository assessmentRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.employeeTrainingRepository = employeeTrainingRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.departmentRepository = departmentRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.skillRepository = skillRepository;
        this.jobRoleCompetencyRepository = jobRoleCompetencyRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
        this.trainingRepository = trainingRepository;
        this.trainingSkillRepository = trainingSkillRepository;
        this.assessmentRepository = assessmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public HRDashboardDTO getDashboard() {

        List<Employee> approvedEmployees =
                employeeRepository.findByStatus(AccountStatus.APPROVED);

        Set<Long> approvedEmployeeIds = approvedEmployees.stream()
                .map(Employee::getEmployeeId)
                .collect(Collectors.toSet());

        HRDashboardDTO dto = new HRDashboardDTO();

        // Workforce
        dto.setTotalEmployees(approvedEmployees.size());
        dto.setPendingApprovals(
                employeeRepository.findByStatus(AccountStatus.PENDING).size());

        // Workforce skill inventory
        List<EmployeeSkill> allEmployeeSkills =
                employeeSkillRepository.findAll();

        List<EmployeeSkill> approvedSkills = allEmployeeSkills.stream()
                .filter(es -> es.getEmployee() != null
                        && approvedEmployeeIds.contains(es.getEmployee().getEmployeeId()))
                .toList();

        dto.setTotalSkillAssignments(approvedSkills.size());
        dto.setTotalSkills((int) approvedSkills.stream()
                .filter(es -> es.getSkill() != null)
                .map(es -> es.getSkill().getSkillId())
                .filter(id -> id != null)
                .distinct()
                .count());

        // Organization-wide open gaps
        List<KnowledgeGap> openGaps = knowledgeGapRepository.findAll().stream()
                .filter(gap -> gap.getStatus() == GapStatus.OPEN)
                .filter(gap -> gap.getEmployeeJobRole() != null
                        && gap.getEmployeeJobRole().getEmployee() != null)
                .filter(gap -> approvedEmployeeIds.contains(
                        gap.getEmployeeJobRole().getEmployee().getEmployeeId()))
                .toList();

        dto.setEmployeesWithSkillGaps((int) openGaps.stream()
                .map(g -> g.getEmployeeJobRole().getEmployee().getEmployeeId())
                .distinct()
                .count());

        // The data model does not contain a separate severity column.
        // MISSING_SKILL is the explicit 100% gap type; percentage thresholds
        // are presentation-level signals only.
        dto.setCriticalSkillGaps((int) openGaps.stream()
                .filter(g -> g.getGapType() == GapType.MISSING_SKILL
                        || safe(g.getGapPercentage()) >= 70.0)
                .count());

        dto.setTopSkillGaps(buildSkillGapSummaries(openGaps));

        // Training analytics
        List<EmployeeTraining> enrollments =
                employeeTrainingRepository.findAll().stream()
                        .filter(et -> et.getEmployee() != null
                                && approvedEmployeeIds.contains(
                                        et.getEmployee().getEmployeeId()))
                        .toList();

        Set<Long> inTrainingEmployees = enrollments.stream()
                .filter(et -> et.getStatus() == EmployeeTraining.Status.IN_PROGRESS)
                .map(et -> et.getEmployee().getEmployeeId())
                .collect(Collectors.toSet());

        dto.setEmployeesInTraining(inTrainingEmployees.size());

        double averageProgress = enrollments.stream()
                .mapToDouble(EmployeeTraining::getProgressPercentage)
                .average()
                .orElse(0.0);
        dto.setAverageLearningProgress(round(averageProgress));

        long completed = enrollments.stream()
                .filter(et -> et.getStatus() == EmployeeTraining.Status.COMPLETED)
                .count();

        double completionRate = enrollments.isEmpty()
                ? 0.0
                : (completed * 100.0 / enrollments.size());

        dto.setTrainingCompletionRate(round(completionRate));
        dto.setTrainingStatus(buildTrainingStatus(enrollments));

        // Assessment analytics
        List<AssessmentAttempt> submittedAttempts =
                assessmentAttemptRepository.findAll().stream()
                        .filter(a -> a.getEmployee() != null
                                && approvedEmployeeIds.contains(
                                        a.getEmployee().getEmployeeId()))
                        .filter(a -> a.getStatus() == AssessmentAttempt.Status.SUBMITTED)
                        .toList();

        dto.setAverageAssessmentScore(round(
                submittedAttempts.stream()
                        .mapToDouble(AssessmentAttempt::getPercentage)
                        .average()
                        .orElse(0.0)));
        dto.setAverageSkillImprovement(calculateAverageAssessmentImprovement(approvedEmployeeIds));

        dto.setAssessmentSummary(buildAssessmentSummary(submittedAttempts));

        // Mentorship analytics.
        // The current entity uses ACCEPTED rather than ACTIVE as its active state.
        int activeMentorships = (int) mentorshipRequestRepository.findAll().stream()
                .filter(m -> m.getStatus() == MentorshipRequest.Status.ACCEPTED)
                .filter(m -> (m.getMentee() != null
                        && approvedEmployeeIds.contains(m.getMentee().getEmployeeId()))
                        || (m.getMentor() != null
                        && approvedEmployeeIds.contains(m.getMentor().getEmployeeId())))
                .count();

        dto.setActiveMentorships(activeMentorships);

        dto.setDepartmentSummaries(
                buildDepartmentSummaries(approvedEmployees, approvedSkills, openGaps));

        dto.setEmployeeGrowth(buildEmployeeGrowth(approvedEmployees));

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        List<EmployeeSkill> skills = employeeSkillRepository.findAll();
        List<KnowledgeGap> gaps = knowledgeGapRepository.findAll();
        List<EmployeeTraining> trainings = employeeTrainingRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Employee e : employees) {
            Map<String, Object> row = new LinkedHashMap<>();
            long id = e.getEmployeeId();
            row.put("employeeId", id);
            row.put("employeeCode", e.getEmployeeCode());
            row.put("name", e.getFirstName() + " " + e.getLastName());
            row.put("email", e.getOfficialEmail());
            row.put("status", e.getStatus() == null ? null : e.getStatus().name());
            row.put("department", e.getDepartment() == null ? null : e.getDepartment().getDepartmentName());
            row.put("role", e.getRole() == null ? null : e.getRole().getRoleName());
            row.put("createdAt", e.getCreatedAt());
            row.put("skillCount", skills.stream().filter(x -> x.getEmployee()!=null && id == x.getEmployee().getEmployeeId()).count());
            row.put("gapCount", gaps.stream().filter(x -> x.getEmployeeJobRole()!=null && x.getEmployeeJobRole().getEmployee()!=null && id == x.getEmployeeJobRole().getEmployee().getEmployeeId() && x.getStatus()==GapStatus.OPEN).count());
            List<EmployeeTraining> et = trainings.stream().filter(x -> x.getEmployee()!=null && id == x.getEmployee().getEmployeeId()).toList();
            row.put("trainingCount", et.size());
            row.put("learningProgress", round(et.stream().mapToDouble(EmployeeTraining::getProgressPercentage).average().orElse(0.0)));
            result.add(row);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDepartments() {
        List<Employee> approved = employeeRepository.findByStatus(AccountStatus.APPROVED);
        List<EmployeeSkill> skills = employeeSkillRepository.findAll();
        List<KnowledgeGap> gaps = knowledgeGapRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Department d : departmentRepository.findAll()) {
            List<Employee> emps = approved.stream().filter(e -> e.getDepartment()!=null && d.getDepartmentId().equals(e.getDepartment().getDepartmentId())).toList();
            Set<Long> ids = emps.stream().map(Employee::getEmployeeId).collect(Collectors.toSet());
            List<EmployeeSkill> ds = skills.stream().filter(x -> x.getEmployee()!=null && ids.contains(x.getEmployee().getEmployeeId())).toList();
            List<KnowledgeGap> dg = gaps.stream().filter(x -> x.getEmployeeJobRole()!=null && x.getEmployeeJobRole().getEmployee()!=null && ids.contains(x.getEmployeeJobRole().getEmployee().getEmployeeId()) && x.getStatus()==GapStatus.OPEN).toList();
            Map<String,Object> row = new LinkedHashMap<>();
            row.put("departmentId", d.getDepartmentId()); row.put("departmentName", d.getDepartmentName()); row.put("description", d.getDescription());
            row.put("employeeCount", emps.size()); row.put("skillAssignments", ds.size()); row.put("uniqueSkills", ds.stream().filter(x->x.getSkill()!=null).map(x->x.getSkill().getSkillId()).distinct().count());
            row.put("averageProficiency", round(ds.stream().filter(x->x.getProficiencyLevel()!=null).mapToDouble(x->proficiencyPercent(x.getProficiencyLevel())).average().orElse(0.0)));
            row.put("averageGapPercentage", round(dg.stream().mapToDouble(x->safe(x.getGapPercentage())).average().orElse(0.0))); row.put("openGaps", dg.size());
            result.add(row);
        }
        result.sort(Comparator.comparing((Map<String,Object> m)->((Number)m.get("employeeCount")).intValue()).reversed());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getJobRoles() {
        List<EmployeeJobRole> assignments = employeeJobRoleRepository.findAll();
        List<JobRoleCompetency> competencies = jobRoleCompetencyRepository.findAll();
        return jobRoleRepository.findAll().stream().map(r -> {
            Map<String,Object> row = new LinkedHashMap<>();
            row.put("jobRoleId", r.getJobRoleId()); row.put("jobRoleName", r.getJobRoleName()); row.put("description", r.getDescription());
            row.put("assignedEmployees", assignments.stream().filter(a->a.getJobRole()!=null && r.getJobRoleId().equals(a.getJobRole().getJobRoleId()) && Boolean.TRUE.equals(a.getActive())).count());
            row.put("competencyCount", competencies.stream().filter(c->c.getJobRole()!=null && r.getJobRoleId().equals(c.getJobRole().getJobRoleId())).count());
            return row;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWorkforceSkills() {
        List<Employee> approved = employeeRepository.findByStatus(AccountStatus.APPROVED);
        Set<Long> ids = approved.stream().map(Employee::getEmployeeId).collect(Collectors.toSet());
        List<EmployeeSkill> skills = employeeSkillRepository.findAll().stream().filter(x->x.getEmployee()!=null && ids.contains(x.getEmployee().getEmployeeId())).toList();
        return skillRepository.findAll().stream().map(skill -> {
            List<EmployeeSkill> rows = skills.stream().filter(x->x.getSkill()!=null && skill.getSkillId().equals(x.getSkill().getSkillId())).toList();
            Map<String,Object> row = new LinkedHashMap<>(); row.put("skillId",skill.getSkillId()); row.put("skillName",skill.getSkillName()); row.put("category",skill.getSkillCategory()==null?null:skill.getSkillCategory().name()); row.put("description",skill.getDescription());
            row.put("employeeCount",rows.size()); row.put("averageProficiency",round(rows.stream().filter(x->x.getProficiencyLevel()!=null).mapToDouble(x->proficiencyPercent(x.getProficiencyLevel())).average().orElse(0.0)));
            Map<String,Long> distribution = new LinkedHashMap<>(); for(ProficiencyLevel level: ProficiencyLevel.values()) distribution.put(level.name(), rows.stream().filter(x->x.getProficiencyLevel()==level).count()); row.put("distribution",distribution);
            return row;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCompetencies() {
        return jobRoleCompetencyRepository.findAll().stream().map(c -> {
            Map<String,Object> row = new LinkedHashMap<>(); row.put("id",c.getJobRoleCompetencyId()); row.put("jobRoleId",c.getJobRole()==null?null:c.getJobRole().getJobRoleId()); row.put("jobRoleName",c.getJobRole()==null?null:c.getJobRole().getJobRoleName()); row.put("skillId",c.getSkill()==null?null:c.getSkill().getSkillId()); row.put("skillName",c.getSkill()==null?null:c.getSkill().getSkillName()); row.put("requiredProficiency",c.getRequiredProficiency()==null?null:c.getRequiredProficiency().name()); row.put("minimumExperience",c.getMinimumExperience()); row.put("mandatory",c.getMandatory()); return row;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getKnowledgeGaps() {
        return knowledgeGapRepository.findAll().stream().filter(g->g.getStatus()==GapStatus.OPEN && g.getEmployeeJobRole()!=null && g.getEmployeeJobRole().getEmployee()!=null).map(g -> {
            Map<String,Object> row = new LinkedHashMap<>(); Employee e=g.getEmployeeJobRole().getEmployee();
            row.put("knowledgeGapId",g.getKnowledgeGapId()); row.put("employeeId",e.getEmployeeId()); row.put("employeeCode",e.getEmployeeCode()); row.put("employeeName",e.getFirstName()+" "+e.getLastName()); row.put("department",e.getDepartment()==null?null:e.getDepartment().getDepartmentName()); row.put("jobRole",g.getEmployeeJobRole().getJobRole()==null?null:g.getEmployeeJobRole().getJobRole().getJobRoleName()); row.put("skillName",g.getSkill()==null?null:g.getSkill().getSkillName()); row.put("currentProficiency",g.getCurrentProficiency()==null?null:g.getCurrentProficiency().name()); row.put("requiredProficiency",g.getRequiredProficiency()==null?null:g.getRequiredProficiency().name()); row.put("gapType",g.getGapType()==null?null:g.getGapType().name()); row.put("gapPercentage",round(safe(g.getGapPercentage()))); row.put("gapScore",round(safe(g.getGapScore()))); row.put("severity",severity(safe(g.getGapPercentage()))); row.put("analyzedAt",g.getAnalyzedAt()); return row;
        }).sorted(Comparator.comparingDouble((Map<String,Object> m)->((Number)m.get("gapPercentage")).doubleValue()).reversed()).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getTrainingAnalytics() {
        List<Employee> approved=employeeRepository.findByStatus(AccountStatus.APPROVED); Set<Long> ids=approved.stream().map(Employee::getEmployeeId).collect(Collectors.toSet());
        List<EmployeeTraining> enrollments=employeeTrainingRepository.findAll().stream().filter(x->x.getEmployee()!=null && ids.contains(x.getEmployee().getEmployeeId())).toList();
        List<Map<String,Object>> catalog=trainingRepository.findAll().stream().map(t->{ List<EmployeeTraining> et=enrollments.stream().filter(x->x.getTraining()!=null && t.getTrainingId().equals(x.getTraining().getTrainingId())).toList(); Map<String,Object> row=new LinkedHashMap<>(); row.put("trainingId",t.getTrainingId()); row.put("trainingName",t.getTrainingName()); row.put("provider",t.getProvider()); row.put("duration",t.getDuration()); row.put("level",t.getLevel()); row.put("description",t.getDescription()); row.put("courseUrl",t.getCourseUrl()); row.put("enrolled",et.size()); row.put("completed",et.stream().filter(x->x.getStatus()==EmployeeTraining.Status.COMPLETED).count()); row.put("inProgress",et.stream().filter(x->x.getStatus()==EmployeeTraining.Status.IN_PROGRESS).count()); row.put("averageProgress",round(et.stream().mapToDouble(EmployeeTraining::getProgressPercentage).average().orElse(0.0))); row.put("mappedSkills",trainingSkillRepository.findByTrainingWithSkill(t).stream().filter(x->x.getSkill()!=null).map(x->x.getSkill().getSkillName()).toList()); return row; }).toList();
        Map<String,Long> status=new LinkedHashMap<>(); for(EmployeeTraining.Status st:EmployeeTraining.Status.values()) status.put(st.name(),enrollments.stream().filter(x->x.getStatus()==st).count());
        double avgSkillImprovement = calculateAverageAssessmentImprovement(ids);
        Map<String,Object> result=new LinkedHashMap<>(); result.put("totalTrainings",trainingRepository.count()); result.put("totalEnrollments",enrollments.size()); result.put("employeesInTraining",enrollments.stream().filter(x->x.getStatus()==EmployeeTraining.Status.IN_PROGRESS).map(x->x.getEmployee().getEmployeeId()).distinct().count()); result.put("completionRate",enrollments.isEmpty()?0.0:round(enrollments.stream().filter(x->x.getStatus()==EmployeeTraining.Status.COMPLETED).count()*100.0/enrollments.size())); result.put("averageProgress",round(enrollments.stream().mapToDouble(EmployeeTraining::getProgressPercentage).average().orElse(0.0))); result.put("averageSkillImprovement",avgSkillImprovement); result.put("status",status); result.put("catalog",catalog); return result;
    }

    private double calculateAverageAssessmentImprovement(Set<Long> employeeIds) {
        Map<String, List<AssessmentAttempt>> grouped = assessmentAttemptRepository.findAll().stream()
                .filter(a -> a.getEmployee()!=null && employeeIds.contains(a.getEmployee().getEmployeeId()))
                .filter(a -> a.getStatus()==AssessmentAttempt.Status.SUBMITTED)
                .filter(a -> a.getAssessment()!=null && a.getAssessment().getSkill()!=null)
                .collect(Collectors.groupingBy(a -> a.getEmployee().getEmployeeId()+":"+a.getAssessment().getSkill().getSkillId()));
        List<Double> improvements = new ArrayList<>();
        for (List<AssessmentAttempt> list : grouped.values()) {
            list.sort(Comparator.comparing(AssessmentAttempt::getSubmittedAt, Comparator.nullsLast(Comparator.naturalOrder())));
            if (list.size() >= 2) {
                AssessmentAttempt previous=list.get(list.size()-2), current=list.get(list.size()-1);
                improvements.add(safe(current.getPercentage())-safe(previous.getPercentage()));
            }
        }
        return round(improvements.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAssessments() {
        List<AssessmentAttempt> attempts=assessmentAttemptRepository.findAll();
        return attempts.stream().map(a->{ Map<String,Object> row=new LinkedHashMap<>(); Employee e=a.getEmployee(); Assessment assessment=a.getAssessment(); row.put("attemptId",a.getAttemptId()); row.put("employeeId",e==null?null:e.getEmployeeId()); row.put("employeeName",e==null?null:e.getFirstName()+" "+e.getLastName()); row.put("employeeCode",e==null?null:e.getEmployeeCode()); row.put("department",e==null||e.getDepartment()==null?null:e.getDepartment().getDepartmentName()); row.put("skillName",assessment==null||assessment.getSkill()==null?null:assessment.getSkill().getSkillName()); row.put("assessmentName",assessment==null?null:assessment.getAssessmentName()); row.put("type",assessment==null||assessment.getAssessmentType()==null?null:assessment.getAssessmentType().name()); row.put("status",a.getStatus()==null?null:a.getStatus().name()); row.put("score",a.getScore()); row.put("percentage",round(safe(a.getPercentage()))); row.put("submittedAt",a.getSubmittedAt()); return row; }).sorted(Comparator.comparing((Map<String,Object> m)->String.valueOf(m.get("submittedAt")),Comparator.reverseOrder())).toList();
    }

    private List<SkillGapSummaryDTO> buildSkillGapSummaries(
            List<KnowledgeGap> gaps) {

        Map<Long, List<KnowledgeGap>> bySkill = new HashMap<>();

        for (KnowledgeGap gap : gaps) {
            if (gap.getSkill() == null || gap.getSkill().getSkillId() == null) {
                continue;
            }
            bySkill.computeIfAbsent(
                    gap.getSkill().getSkillId(), ignored -> new ArrayList<>())
                    .add(gap);
        }

        return bySkill.values().stream()
                .map(list -> {
                    KnowledgeGap first = list.get(0);
                    double avg = list.stream()
                            .mapToDouble(g -> safe(g.getGapPercentage()))
                            .average()
                            .orElse(0.0);

                    SkillGapSummaryDTO item = new SkillGapSummaryDTO();
                    item.setSkillName(first.getSkill().getSkillName());
                    item.setAffectedEmployees((int) list.stream()
                            .map(g -> g.getEmployeeJobRole().getEmployee().getEmployeeId())
                            .distinct()
                            .count());
                    item.setAverageGapPercentage(round(avg));
                    item.setSeverity(severity(avg));
                    return item;
                })
                .sorted(Comparator.comparingDouble(
                        SkillGapSummaryDTO::getAverageGapPercentage).reversed())
                .limit(8)
                .toList();
    }

    private List<TrainingStatusDTO> buildTrainingStatus(
            List<EmployeeTraining> enrollments) {

        int total = enrollments.size();
        List<TrainingStatusDTO> result = new ArrayList<>();

        for (EmployeeTraining.Status status : EmployeeTraining.Status.values()) {
            int count = (int) enrollments.stream()
                    .filter(e -> e.getStatus() == status)
                    .count();

            double percentage = total == 0 ? 0.0 : count * 100.0 / total;
            result.add(new TrainingStatusDTO(
                    status.name(), count, round(percentage)));
        }

        return result;
    }

    private List<AssessmentSummaryDTO> buildAssessmentSummary(
            List<AssessmentAttempt> attempts) {

        Map<String, List<AssessmentAttempt>> grouped = new LinkedHashMap<>();

        for (AssessmentAttempt attempt : attempts) {
            if (attempt.getAssessment() == null
                    || attempt.getAssessment().getAssessmentType() == null) {
                continue;
            }

            String type = attempt.getAssessment().getAssessmentType().name();
            grouped.computeIfAbsent(type, ignored -> new ArrayList<>())
                    .add(attempt);
        }

        return grouped.entrySet().stream()
                .map(entry -> new AssessmentSummaryDTO(
                        entry.getKey(),
                        entry.getValue().size(),
                        round(entry.getValue().stream()
                                .mapToDouble(AssessmentAttempt::getPercentage)
                                .average()
                                .orElse(0.0))))
                .toList();
    }

    private List<DepartmentSummaryDTO> buildDepartmentSummaries(
            List<Employee> employees,
            List<EmployeeSkill> skills,
            List<KnowledgeGap> gaps) {

        Map<String, List<Employee>> employeesByDepartment =
                employees.stream()
                        .filter(e -> e.getDepartment() != null)
                        .collect(Collectors.groupingBy(
                                e -> e.getDepartment().getDepartmentName(),
                                LinkedHashMap::new,
                                Collectors.toList()));

        List<DepartmentSummaryDTO> result = new ArrayList<>();

        for (Map.Entry<String, List<Employee>> entry : employeesByDepartment.entrySet()) {

            Set<Long> ids = entry.getValue().stream()
                    .map(Employee::getEmployeeId)
                    .collect(Collectors.toSet());

            List<EmployeeSkill> departmentSkills = skills.stream()
                    .filter(es -> es.getEmployee() != null
                            && ids.contains(es.getEmployee().getEmployeeId()))
                    .toList();

            double avgProficiency = departmentSkills.stream()
                    .filter(es -> es.getProficiencyLevel() != null)
                    .mapToDouble(es -> proficiencyPercent(es.getProficiencyLevel()))
                    .average()
                    .orElse(0.0);

            List<KnowledgeGap> departmentGaps = gaps.stream()
                    .filter(g -> ids.contains(
                            g.getEmployeeJobRole().getEmployee().getEmployeeId()))
                    .toList();

            double avgGap = departmentGaps.stream()
                    .mapToDouble(g -> safe(g.getGapPercentage()))
                    .average()
                    .orElse(0.0);

            DepartmentSummaryDTO item = new DepartmentSummaryDTO();
            item.setDepartmentName(entry.getKey());
            item.setEmployeeCount(entry.getValue().size());
            item.setAverageProficiency(round(avgProficiency));
            item.setAverageGapPercentage(round(avgGap));
            result.add(item);
        }

        return result.stream()
                .sorted(Comparator.comparingInt(
                        DepartmentSummaryDTO::getEmployeeCount).reversed())
                .toList();
    }

    private List<GrowthPointDTO> buildEmployeeGrowth(
            List<Employee> employees) {

        YearMonth current = YearMonth.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");

        List<GrowthPointDTO> result = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);

            int count = (int) employees.stream()
                    .filter(e -> e.getCreatedAt() != null)
                    .filter(e -> YearMonth.from(e.getCreatedAt()).equals(month))
                    .count();

            result.add(new GrowthPointDTO(
                    month.format(formatter), count));
        }

        return result;
    }

    private String severity(double gap) {
        if (gap >= 70.0) return "CRITICAL";
        if (gap >= 40.0) return "HIGH";
        if (gap > 0.0) return "MEDIUM";
        return "LOW";
    }

    private double proficiencyPercent(ProficiencyLevel level) {
        return switch (level) {
            case BEGINNER -> 25.0;
            case INTERMEDIATE -> 50.0;
            case ADVANCED -> 75.0;
            case EXPERT -> 100.0;
        };
    }

    private double safe(Double value) {
        return value == null ? 0.0 : value;
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    @Override
    public EmployeeApprovalResponseDTO approveEmployee(Long employeeId) {
        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found."));

        employee.setStatus(AccountStatus.APPROVED);
        employee = employeeRepository.save(employee);

        EmployeeApprovalResponseDTO response = new EmployeeApprovalResponseDTO();
        response.setEmployeeId(employee.getEmployeeId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setEmployeeName(
                employee.getFirstName() + " " + employee.getLastName());
        response.setStatus(employee.getStatus().name());
        response.setMessage("Employee approved successfully.");
        return response;
    }

    @Override
    public EmployeeApprovalResponseDTO rejectEmployee(Long employeeId) {
        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found."));

        employee.setStatus(AccountStatus.REJECTED);
        employeeRepository.save(employee);

        EmployeeApprovalResponseDTO response = new EmployeeApprovalResponseDTO();
        response.setEmployeeId(employee.getEmployeeId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setMessage("Employee rejected successfully.");
        return response;
    }

    @Override
    public List<PendingEmployeeDTO> getPendingEmployees() {
        List<Employee> employees =
                employeeRepository.findByStatus(AccountStatus.PENDING);

        List<PendingEmployeeDTO> response = new ArrayList<>();

        for (Employee employee : employees) {
            PendingEmployeeDTO dto = new PendingEmployeeDTO();
            dto.setEmployeeId(employee.getEmployeeId());
            dto.setEmployeeCode(employee.getEmployeeCode());
            dto.setFirstName(employee.getFirstName());
            dto.setLastName(employee.getLastName());
            dto.setOfficialEmail(employee.getOfficialEmail());
            response.add(dto);
        }

        return response;
    }
}
