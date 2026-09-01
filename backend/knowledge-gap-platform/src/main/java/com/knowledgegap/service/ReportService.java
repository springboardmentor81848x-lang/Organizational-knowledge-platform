package com.knowledgegap.service;

import com.knowledgegap.entity.*;
import com.knowledgegap.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ReportService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final TrainingEnrollmentRepository trainingEnrollmentRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;

    // ============================================================
    // EMPLOYEE REPORT
    // ============================================================
    
    public List<Map<String, Object>> getEmployeeReport() {
        List<Employee> employees = employeeRepository.findAll();
        
        return employees.stream().map(employee -> {
            Map<String, Object> record = new LinkedHashMap<>();
            record.put("Employee ID", employee.getEmployeeId() != null ? employee.getEmployeeId() : "—");
            record.put("First Name", employee.getFirstName() != null ? employee.getFirstName() : "—");
            record.put("Last Name", employee.getLastName() != null ? employee.getLastName() : "—");
            record.put("Email", employee.getEmail() != null ? employee.getEmail() : "—");
            record.put("Department", employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : "Unassigned");
            record.put("Designation", employee.getDesignation() != null ? employee.getDesignation() : "—");
            record.put("Role", employee.getRole() != null ? employee.getRole().getRoleName() : "—");
            
            // Count enrollments
            List<TrainingEnrollment> enrollments = trainingEnrollmentRepository.findByEmployee(employee);
            record.put("Trainings Enrolled", enrollments.size());
            
            // Count completed assessments
            long assessmentCount = assessmentAttemptRepository.findAll().stream()
                    .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(employee.getId()))
                    .count();
            record.put("Assessments Completed", assessmentCount);
            
            // Count skills
            List<EmployeeSkill> skills = employeeSkillRepository.findByEmployee(employee);
            record.put("Skills Evaluated", skills.size());
            
            return record;
        }).collect(Collectors.toList());
    }

    // ============================================================
    // DEPARTMENT REPORT
    // ============================================================
    
    public List<Map<String, Object>> getDepartmentReport() {
        List<Department> departments = departmentRepository.findAll();
        
        return departments.stream().map(department -> {
            Map<String, Object> record = new LinkedHashMap<>();
            record.put("Department Name", department.getDepartmentName());
            record.put("Description", department.getDescription() != null ? department.getDescription() : "—");
            
            // Get all employees in department
            List<Employee> deptEmployees = employeeRepository.findByDepartmentId(department.getId());
            record.put("Total Employees", deptEmployees.size());
            
            // Count active employees
            long activeCount = deptEmployees.stream()
                    .filter(e -> e.getRole() != null && !e.getRole().getRoleName().equals("INACTIVE"))
                    .count();
            record.put("Active Employees", activeCount);
            
            // Total trainings
            long totalTrainings = deptEmployees.stream()
                    .mapToLong(e -> trainingEnrollmentRepository.findByEmployee(e).size())
                    .sum();
            record.put("Total Trainings Enrolled", totalTrainings);
            
            // Completed trainings
            long completedTrainings = deptEmployees.stream()
                    .mapToLong(e -> trainingEnrollmentRepository.findByEmployee(e).stream()
                            .filter(t -> t.getStatus() != null && t.getStatus().name().equals("COMPLETED"))
                            .count())
                    .sum();
            record.put("Trainings Completed", completedTrainings);
            
            // Training completion rate
            double completionRate = totalTrainings > 0 ? (completedTrainings * 100.0 / totalTrainings) : 0;
            record.put("Training Completion Rate %", String.format("%.2f", completionRate));
            
            return record;
        }).collect(Collectors.toList());
    }

    // ============================================================
    // TRAINING EFFECTIVENESS REPORT
    // ============================================================
    
    public List<Map<String, Object>> getTrainingEffectivenessReport() {
        List<TrainingEnrollment> enrollments = trainingEnrollmentRepository.findAll();
        
        // Group by training course
        Map<String, List<TrainingEnrollment>> groupedByTraining = enrollments.stream()
                .collect(Collectors.groupingBy(e -> e.getCourse() != null ? e.getCourse().getTitle() : "Unknown"));
        
        return groupedByTraining.entrySet().stream().map(entry -> {
            String courseName = entry.getKey();
            List<TrainingEnrollment> trainingList = entry.getValue();
            
            Map<String, Object> record = new LinkedHashMap<>();
            record.put("Training Name", courseName);
            record.put("Total Enrolled", trainingList.size());
            
            // Count completed
            long completed = trainingList.stream()
                    .filter(e -> e.getStatus() != null && e.getStatus().name().equals("COMPLETED"))
                    .count();
            record.put("Completed", completed);
            
            // Completion rate
            double completionRate = trainingList.size() > 0 ? (completed * 100.0 / trainingList.size()) : 0;
            record.put("Completion Rate %", String.format("%.2f", completionRate));
            
            // Average skill improvement (estimated)
            double avgImprovement = trainingList.stream()
                    .mapToDouble(e -> 0.0) // Placeholder - would need assessment data
                    .average()
                    .orElse(0);
            record.put("Avg Skill Improvement", String.format("%.2f", avgImprovement));
            
            // Knowledge gap reduction
            double gapReduction = trainingList.size() > 0 ? completionRate * 0.75 : 0; // Estimated correlation
            record.put("Gap Reduction %", String.format("%.2f", gapReduction));
            
            return record;
        }).collect(Collectors.toList());
    }

    // ============================================================
    // HELPER METHODS FOR STATISTICS
    // ============================================================
    
    public Map<String, Object> getReportStatistics() {
        Map<String, Object> stats = new LinkedHashMap<>();
        
        long totalEmployees = employeeRepository.count();
        stats.put("Total Employees", totalEmployees);
        
        long totalDepartments = departmentRepository.count();
        stats.put("Total Departments", totalDepartments);
        
        long totalTrainings = trainingEnrollmentRepository.count();
        stats.put("Total Trainings Enrolled", totalTrainings);
        
        long completedTrainings = trainingEnrollmentRepository.findAll().stream()
                .filter(e -> e.getStatus() != null && e.getStatus().name().equals("COMPLETED"))
                .count();
        double completionRate = totalTrainings > 0 ? (completedTrainings * 100.0 / totalTrainings) : 0;
        stats.put("Overall Completion Rate %", String.format("%.2f", completionRate));
        
        long totalAssessments = assessmentAttemptRepository.count();
        stats.put("Total Assessments Completed", totalAssessments);
        
        long totalSkillGaps = knowledgeGapRepository.count();
        stats.put("Total Knowledge Gaps Identified", totalSkillGaps);
        
        return stats;
    }
}
