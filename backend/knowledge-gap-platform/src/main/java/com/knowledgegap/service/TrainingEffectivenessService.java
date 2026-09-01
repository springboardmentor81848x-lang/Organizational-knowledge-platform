package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.entity.TrainingStatus;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;
import com.knowledgegap.repository.TrainingEnrollmentRepository;

@Service
public class TrainingEffectivenessService {

    private final EmployeeRepository employeeRepository;
    private final TrainingEnrollmentRepository trainingEnrollmentRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;

    public TrainingEffectivenessService(
            EmployeeRepository employeeRepository,
            TrainingEnrollmentRepository trainingEnrollmentRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            KnowledgeGapRepository knowledgeGapRepository) {

        this.employeeRepository = employeeRepository;
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
    }

    public Map<String, Object> getSummary() {
        List<TrainingEnrollment> enrollments =
                trainingEnrollmentRepository.findAll();

        long totalTrainings = enrollments.stream()
                .map(enrollment -> enrollment.getCourse())
                .filter(course -> course != null && course.getId() != null)
                .mapToLong(course -> course.getId())
                .distinct()
                .count();

        long totalEmployeesEnrolled = enrollments.stream()
                .map(TrainingEnrollment::getEmployee)
                .filter(employee -> employee != null && employee.getId() != null)
                .map(Employee::getId)
                .distinct()
                .count();

        long completedEnrollments = enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == TrainingStatus.COMPLETED
                        || enrollment.getStatus() == TrainingStatus.CERTIFIED)
                .count();

        double trainingCompletionRate = enrollments.isEmpty() ? 0 :
                (completedEnrollments * 100.0) / enrollments.size();

        double averageSkillImprovement = getAverageSkillImprovement();
        double knowledgeGapReduction = getKnowledgeGapReduction();
        double overallTrainingEffectiveness =
                ((trainingCompletionRate + averageSkillImprovement + knowledgeGapReduction) / 3.0);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalTrainings", totalTrainings);
        summary.put("totalEmployeesEnrolled", totalEmployeesEnrolled);
        summary.put("trainingCompletionRate", round(trainingCompletionRate));
        summary.put("averageSkillImprovement", round(averageSkillImprovement));
        summary.put("knowledgeGapReduction", round(knowledgeGapReduction));
        summary.put("overallTrainingEffectiveness", round(overallTrainingEffectiveness));

        return summary;
    }

    public List<Map<String, Object>> getTrainingPerformance() {
        Map<Long, Map<String, Object>> byCourse = new LinkedHashMap<>();

        for (TrainingEnrollment enrollment : trainingEnrollmentRepository.findAll()) {
            if (enrollment.getCourse() == null) {
                continue;
            }

            Long courseId = enrollment.getCourse().getId();
            String courseName = enrollment.getCourse().getTitle() != null
                    ? enrollment.getCourse().getTitle()
                    : "Unknown Course";
            String category = enrollment.getCourse().getSkill() != null
                    && enrollment.getCourse().getSkill().getCategory() != null
                    ? enrollment.getCourse().getSkill().getCategory()
                    : "General";

            Map<String, Object> row = byCourse.computeIfAbsent(courseId, key -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("courseId", courseId);
                item.put("courseName", courseName);
                item.put("category", category);
                item.put("employeesEnrolled", 0);
                item.put("completed", 0);
                item.put("completionRate", 0.0);
                item.put("averageSkillImprovement", 0.0);
                item.put("knowledgeGapReduction", 0.0);
                item.put("effectiveness", 0.0);
                item.put("status", "Needs Attention");
                return item;
            });

            int enrolledCount = (int) row.getOrDefault("employeesEnrolled", 0);
            row.put("employeesEnrolled", enrolledCount + 1);

            if (enrollment.getStatus() == TrainingStatus.COMPLETED
                    || enrollment.getStatus() == TrainingStatus.CERTIFIED) {
                int completedCount = (int) row.getOrDefault("completed", 0);
                row.put("completed", completedCount + 1);
            }
        }

        for (Map<String, Object> row : byCourse.values()) {
            int employeesEnrolled = (int) row.get("employeesEnrolled");
            int completed = (int) row.get("completed");
            double completionRate = employeesEnrolled == 0 ? 0 : (completed * 100.0) / employeesEnrolled;
            double avgImprovement = getAverageEmployeeSkillImprovementForCourse((Long) row.get("courseId"));
            double gapReduction = getKnowledgeGapReductionForCourse((Long) row.get("courseId"));
            double effectiveness = (completionRate + avgImprovement + gapReduction) / 3.0;

            row.put("completionRate", round(completionRate));
            row.put("averageSkillImprovement", round(avgImprovement));
            row.put("knowledgeGapReduction", round(gapReduction));
            row.put("effectiveness", round(effectiveness));
            row.put("status", determineStatus(effectiveness, completionRate));
        }

        return new ArrayList<>(byCourse.values());
    }

    public Map<String, Object> getSkillImprovement() {
        Map<String, Object> data = new LinkedHashMap<>();
        List<Map<String, Object>> items = new ArrayList<>();

        List<Employee> employees = employeeRepository.findAll();
        for (Employee employee : employees) {
            List<AssessmentAttempt> attempts = assessmentAttemptRepository
                    .findByEmployeeOrderByCompletedAtAsc(employee);

            if (attempts.size() >= 2) {
                double before = attempts.get(0).getOverallScore() != null ? attempts.get(0).getOverallScore() : 0;
                double after = attempts.get(attempts.size() - 1).getOverallScore() != null
                        ? attempts.get(attempts.size() - 1).getOverallScore()
                        : 0;

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("employee", employee.getFirstName() + " " + employee.getLastName());
                item.put("department", employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : "Unassigned");
                item.put("before", round(before));
                item.put("after", round(after));
                item.put("improvement", round(after - before));
                items.add(item);
            }
        }

        data.put("items", items);
        data.put("averageImprovement", round(items.stream()
                .mapToDouble(item -> (double) item.getOrDefault("improvement", 0.0))
                .average()
                .orElse(0.0)));
        return data;
    }

    public Map<String, Object> getGapReduction() {
        Map<String, Object> data = new LinkedHashMap<>();
        double before = 0;
        double after = 0;

        for (Employee employee : employeeRepository.findAll()) {
            var gaps = knowledgeGapRepository.findByEmployee(employee);
            if (!gaps.isEmpty()) {
                before += gaps.stream().filter(g -> g.getGap() != null).mapToInt(g -> g.getGap()).sum();
                after += gaps.stream().filter(g -> g.getGap() != null).mapToInt(g -> g.getGap()).sum();
            }
        }

        double resolved = Math.max(0, before - after);
        double reductionPercent = before == 0 ? 0 : (resolved / before) * 100;

        data.put("gapsBeforeTraining", round(before));
        data.put("gapsAfterTraining", round(after));
        data.put("resolvedGaps", round(resolved));
        data.put("remainingGaps", round(Math.max(0, after)));
        data.put("reductionPercent", round(reductionPercent));
        return data;
    }

    public List<Map<String, Object>> getAttentionList() {
        List<Map<String, Object>> trainings = getTrainingPerformance();
        return trainings.stream()
                .filter(item -> {
                    double completion = (double) item.getOrDefault("completionRate", 0.0);
                    double improvement = (double) item.getOrDefault("averageSkillImprovement", 0.0);
                    double gapReduction = (double) item.getOrDefault("knowledgeGapReduction", 0.0);
                    return completion < 70 || improvement < 10 || gapReduction < 10;
                })
                .map(item -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("trainingName", item.get("courseName"));
                    row.put("completionRate", item.get("completionRate"));
                    row.put("skillImprovement", item.get("averageSkillImprovement"));
                    row.put("remainingGaps", Math.max(0, 100 - (double) item.getOrDefault("knowledgeGapReduction", 0.0)));
                    row.put("suggestedAction", suggestAction((double) item.getOrDefault("completionRate", 0.0),
                            (double) item.getOrDefault("averageSkillImprovement", 0.0),
                            (double) item.getOrDefault("knowledgeGapReduction", 0.0)));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private double getAverageSkillImprovement() {
        List<Employee> employees = employeeRepository.findAll();
        List<Double> values = new ArrayList<>();

        for (Employee employee : employees) {
            List<AssessmentAttempt> attempts = assessmentAttemptRepository.findByEmployeeOrderByCompletedAtAsc(employee);
            if (attempts.size() >= 2) {
                double first = attempts.get(0).getOverallScore() != null ? attempts.get(0).getOverallScore() : 0;
                double latest = attempts.get(attempts.size() - 1).getOverallScore() != null
                        ? attempts.get(attempts.size() - 1).getOverallScore()
                        : 0;
                values.add(latest - first);
            }
        }

        return values.isEmpty() ? 0 : values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    private double getKnowledgeGapReduction() {
        return 0.0;
    }

    private double getAverageEmployeeSkillImprovementForCourse(Long courseId) {
        return 0.0;
    }

    private double getKnowledgeGapReductionForCourse(Long courseId) {
        return 0.0;
    }

    private String determineStatus(double effectiveness, double completionRate) {
        if (effectiveness >= 75 || completionRate >= 80) return "Excellent";
        if (effectiveness >= 55 || completionRate >= 60) return "Good";
        return "Needs Attention";
    }

    private String suggestAction(double completionRate, double skillImprovement, double gapReduction) {
        if (completionRate < 60) return "Review Course";
        if (skillImprovement < 10) return "Improve Training Content";
        if (gapReduction < 10) return "Provide Refresher Training";
        return "Assign Mentor";
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
