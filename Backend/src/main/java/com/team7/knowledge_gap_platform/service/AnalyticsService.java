package com.team7.knowledge_gap_platform.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.dto.AnalyticsResponse;
import com.team7.knowledge_gap_platform.entity.Employee;
import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.entity.TrainingEnrollment;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;
import com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.team7.knowledge_gap_platform.repository.SkillGapRepository;
import com.team7.knowledge_gap_platform.repository.TrainingEnrollmentRepository;

@Service
public class AnalyticsService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillGapRepository skillGapRepository;
    private final TrainingEnrollmentRepository trainingEnrollmentRepository;

    public AnalyticsService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            SkillGapRepository skillGapRepository,
            TrainingEnrollmentRepository trainingEnrollmentRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillGapRepository = skillGapRepository;
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
    }

    // =========================================================
    // EMPLOYEE ANALYTICS
    // =========================================================

    public AnalyticsResponse getEmployeeAnalytics(
            Long employeeId) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"));

        List<EmployeeSkill> skills =
                employeeSkillRepository
                        .findByEmployeeId(employeeId);

        List<SkillGap> gaps =
                skillGapRepository
                        .findByEmployeeId(employeeId);

        List<TrainingEnrollment> trainings =
                trainingEnrollmentRepository
                        .findByEmployeeId(employeeId);

        AnalyticsResponse response =
                new AnalyticsResponse();

        response.setEmployeeId(employee.getId());

        response.setEmployeeName(
                employee.getFirstName()
                        + " "
                        + employee.getLastName());

        response.setDepartment(
                employee.getDepartment());

        response.setTotalSkills(
                skills.size());

        response.setTotalSkillGaps(
                gaps.size());

        int high = 0;
        int medium = 0;
        int low = 0;

        for (SkillGap gap : gaps) {

            if (gap.getGapLevel() == null) {
                continue;
            }

            switch (gap.getGapLevel().toUpperCase()) {

                case "HIGH" ->
                        high++;

                case "MEDIUM" ->
                        medium++;

                case "LOW" ->
                        low++;
            }
        }

        response.setHighGaps(high);
        response.setMediumGaps(medium);
        response.setLowGaps(low);

        response.setTotalTrainings(
                trainings.size());

        int completed = 0;
        int inProgress = 0;

        for (TrainingEnrollment training : trainings) {

            if (training.getStatus() == null) {
                continue;
            }

            if ("COMPLETED"
                    .equalsIgnoreCase(
                            training.getStatus())) {

                completed++;
            }

            if ("IN_PROGRESS"
                    .equalsIgnoreCase(
                            training.getStatus())) {

                inProgress++;
            }
        }

        response.setCompletedTrainings(
                completed);

        response.setInProgressTrainings(
                inProgress);

        double totalScore = 0.0;
        int scoreCount = 0;

        for (EmployeeSkill skill : skills) {

            if (skill.getProficiencyScore()
                    != null) {

                totalScore +=
                        skill.getProficiencyScore();

                scoreCount++;
            }
        }

        double averageScore =
                scoreCount == 0
                        ? 0.0
                        : totalScore / scoreCount;

        response.setAverageSkillScore(
                averageScore);

        return response;
    }

    // =========================================================
    // DEPARTMENT ANALYTICS
    // =========================================================

    public List<AnalyticsResponse>
    getDepartmentAnalytics(
            String departmentName) {

        List<Employee> employees =
                employeeRepository
                        .findByDepartment(
                                departmentName);

        List<AnalyticsResponse> response =
                new ArrayList<>();

        for (Employee employee : employees) {

            response.add(
                    getEmployeeAnalytics(
                            employee.getId()));
        }

        return response;
    }

    // =========================================================
    // ORGANIZATION ANALYTICS
    // =========================================================

    public List<AnalyticsResponse>
    getOrganizationAnalytics() {

        List<Employee> employees =
                employeeRepository.findAll();

        List<AnalyticsResponse> response =
                new ArrayList<>();

        for (Employee employee : employees) {

            response.add(
                    getEmployeeAnalytics(
                            employee.getId()));
        }

        return response;
    }
}