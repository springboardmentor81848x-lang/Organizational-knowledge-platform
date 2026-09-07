package com.okip.service.report.impl;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.okip.entity.master.Department;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.entity.transaction.SkillAssessment;
import com.okip.entity.transaction.TrainingEnrollment;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.*;
import com.okip.service.report.ReportService;

@Service
public class ReportServiceImpl implements ReportService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeJobRoleRepository employeeJobRoleRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final DepartmentRepository departmentRepository;
    private final TrainingEnrollmentRepository trainingEnrollmentRepository;
    private final SkillAssessmentRepository skillAssessmentRepository;

    public ReportServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            DepartmentRepository departmentRepository,
            TrainingEnrollmentRepository trainingEnrollmentRepository,
            SkillAssessmentRepository skillAssessmentRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.departmentRepository = departmentRepository;
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
        this.skillAssessmentRepository = skillAssessmentRepository;
    }

    @Override
    public String generateMySkillGapsCsv() {
        Employee employee = getLoggedInEmployee();
        return buildEmployeeGapsCsv(employee);
    }

    @Override
    public String generateEmployeeSkillGapsCsv(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
        return buildEmployeeGapsCsv(employee);
    }

    private String buildEmployeeGapsCsv(Employee employee) {
        StringBuilder sb = new StringBuilder();
        sb.append("Employee Code,Employee Name,Department,Job Role,Skill Name,Category,Required Proficiency,Current Proficiency,Required Experience,Current Experience,Gap Type,Gap Score,Gap Percentage,Status\n");

        List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);
        if (roles.isEmpty()) return sb.toString();

        List<KnowledgeGap> gaps = knowledgeGapRepository.findByEmployeeJobRoleIn(roles);
        for (KnowledgeGap g : gaps) {
            sb.append(escape(employee.getEmployeeCode())).append(",")
              .append(escape(employee.getFirstName() + " " + employee.getLastName())).append(",")
              .append(escape(employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : "N/A")).append(",")
              .append(escape(g.getEmployeeJobRole().getJobRole().getJobRoleName())).append(",")
              .append(escape(g.getSkill().getSkillName())).append(",")
              .append(escape(g.getSkill().getSkillCategory() != null ? g.getSkill().getSkillCategory().name() : "N/A")).append(",")
              .append(escape(g.getRequiredProficiency() != null ? g.getRequiredProficiency().name() : "N/A")).append(",")
              .append(escape(g.getCurrentProficiency() != null ? g.getCurrentProficiency().name() : "NONE")).append(",")
              .append(g.getRequiredExperience() != null ? g.getRequiredExperience() : 0.0).append(",")
              .append(g.getCurrentExperience() != null ? g.getCurrentExperience() : 0.0).append(",")
              .append(escape(g.getGapType() != null ? g.getGapType().name() : "N/A")).append(",")
              .append(g.getGapScore() != null ? g.getGapScore() : 0.0).append(",")
              .append(g.getGapPercentage() != null ? g.getGapPercentage() : 0.0).append(",")
              .append(escape(g.getStatus() != null ? g.getStatus().name() : "N/A")).append("\n");
        }
        return sb.toString();
    }

    @Override
    public String generateTeamSkillGapsCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("Employee Code,Employee Name,Department,Job Role,Skill Name,Required Proficiency,Current Proficiency,Gap Type,Gap Percentage,Status\n");

        List<KnowledgeGap> gaps = knowledgeGapRepository.findAll();
        for (KnowledgeGap g : gaps) {
            Employee emp = g.getEmployeeJobRole().getEmployee();
            sb.append(escape(emp.getEmployeeCode())).append(",")
              .append(escape(emp.getFirstName() + " " + emp.getLastName())).append(",")
              .append(escape(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "N/A")).append(",")
              .append(escape(g.getEmployeeJobRole().getJobRole().getJobRoleName())).append(",")
              .append(escape(g.getSkill().getSkillName())).append(",")
              .append(escape(g.getRequiredProficiency() != null ? g.getRequiredProficiency().name() : "N/A")).append(",")
              .append(escape(g.getCurrentProficiency() != null ? g.getCurrentProficiency().name() : "NONE")).append(",")
              .append(escape(g.getGapType() != null ? g.getGapType().name() : "N/A")).append(",")
              .append(g.getGapPercentage() != null ? g.getGapPercentage() : 0.0).append(",")
              .append(escape(g.getStatus() != null ? g.getStatus().name() : "N/A")).append("\n");
        }
        return sb.toString();
    }

    @Override
    public String generateDepartmentGapsCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("Department Name,Total Employees,Total Gaps,Average Readiness Percentage,Average Gap Percentage\n");

        List<Department> departments = departmentRepository.findAll();
        for (Department dept : departments) {
            List<Employee> emps = employeeRepository.findAll().stream()
                    .filter(e -> e.getDepartment() != null && e.getDepartment().getDepartmentId().equals(dept.getDepartmentId()))
                    .toList();

            double totalGap = 0.0;
            int gapCount = 0;
            for (Employee e : emps) {
                List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(e);
                if (!roles.isEmpty()) {
                    List<KnowledgeGap> gaps = knowledgeGapRepository.findByEmployeeJobRoleIn(roles);
                    gapCount += gaps.size();
                    for (KnowledgeGap g : gaps) {
                        totalGap += (g.getGapPercentage() != null ? g.getGapPercentage() : 0.0);
                    }
                }
            }

            double avgGap = gapCount > 0 ? (totalGap / gapCount) : 0.0;
            double avgReadiness = 100.0 - avgGap;

            sb.append(escape(dept.getDepartmentName())).append(",")
              .append(emps.size()).append(",")
              .append(gapCount).append(",")
              .append(Math.round(avgReadiness * 100.0) / 100.0).append(",")
              .append(Math.round(avgGap * 100.0) / 100.0).append("\n");
        }
        return sb.toString();
    }

    @Override
    public String generateTrainingReportCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("Enrollment ID,Employee Code,Employee Name,Department,Training Name,Provider,Level,Progress,Status,Enrollment Date,Start Date,Completion Date\n");

        List<TrainingEnrollment> enrollments = trainingEnrollmentRepository.findAll();
        for (TrainingEnrollment te : enrollments) {
            Employee emp = te.getEmployee();
            sb.append(te.getEnrollmentId()).append(",")
              .append(escape(emp.getEmployeeCode())).append(",")
              .append(escape(emp.getFirstName() + " " + emp.getLastName())).append(",")
              .append(escape(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "N/A")).append(",")
              .append(escape(te.getTraining().getTrainingName())).append(",")
              .append(escape(te.getTraining().getProvider())).append(",")
              .append(escape(te.getTraining().getLevel())).append(",")
              .append(te.getProgress()).append("%,")
              .append(escape(te.getStatus().name())).append(",")
              .append(te.getEnrollmentDate() != null ? te.getEnrollmentDate().toString() : "").append(",")
              .append(te.getStartDate() != null ? te.getStartDate().toString() : "").append(",")
              .append(te.getCompletionDate() != null ? te.getCompletionDate().toString() : "").append("\n");
        }
        return sb.toString();
    }

    @Override
    public String generateAssessmentReportCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("Assessment ID,Employee Code,Employee Name,Department,Evaluator Name,Skill Name,Assessment Type,Assessed Proficiency,Score,Status,Reviewer Name,Reviewed At,Date Submitted\n");

        List<SkillAssessment> assessments = skillAssessmentRepository.findAll();
        for (SkillAssessment a : assessments) {
            Employee emp = a.getEmployee();
            Employee eval = a.getEvaluator();
            Employee rev = a.getReviewer();
            sb.append(a.getAssessmentId()).append(",")
              .append(escape(emp.getEmployeeCode())).append(",")
              .append(escape(emp.getFirstName() + " " + emp.getLastName())).append(",")
              .append(escape(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "N/A")).append(",")
              .append(escape(eval != null ? (eval.getFirstName() + " " + eval.getLastName()) : "N/A")).append(",")
              .append(escape(a.getSkill().getSkillName())).append(",")
              .append(escape(a.getAssessmentType().name())).append(",")
              .append(escape(a.getAssessedProficiency().name())).append(",")
              .append(a.getScore() != null ? a.getScore() : "").append(",")
              .append(escape(a.getStatus().name())).append(",")
              .append(escape(rev != null ? (rev.getFirstName() + " " + rev.getLastName()) : "Pending")).append(",")
              .append(a.getReviewedAt() != null ? a.getReviewedAt().toString() : "").append(",")
              .append(a.getCreatedAt() != null ? a.getCreatedAt().toString() : "").append("\n");
        }
        return sb.toString();
    }

    private Employee getLoggedInEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return employeeRepository.findByOfficialEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found."));
    }

    private String escape(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
