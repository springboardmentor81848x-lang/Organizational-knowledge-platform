package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.repository.EmployeeSkillRepository;

@Service
public class SkillForecastService {

    private final EmployeeSkillRepository employeeSkillRepository;

    public SkillForecastService(EmployeeSkillRepository employeeSkillRepository) {
        this.employeeSkillRepository = employeeSkillRepository;
    }

    public Map<String, Object> getSummary() {
        List<EmployeeSkill> allSkills = employeeSkillRepository.findAll();

        Map<String, List<Integer>> skillLevels = new LinkedHashMap<>();
        for (EmployeeSkill employeeSkill : allSkills) {
            if (employeeSkill.getSkill() == null || employeeSkill.getSkill().getSkillName() == null) {
                continue;
            }
            String skillName = employeeSkill.getSkill().getSkillName();
            skillLevels.computeIfAbsent(skillName, key -> new ArrayList<>()).add(
                    employeeSkill.getCurrentLevel() != null ? employeeSkill.getCurrentLevel() : 0
            );
        }

        int highDemandSkills = 0;
        int skillsAtRisk = 0;
        int projectedSkillGaps = 0;
        int employeesRequiringUpskilling = 0;
        int recruitmentRequirements = 0;

        for (Map.Entry<String, List<Integer>> entry : skillLevels.entrySet()) {
            double avg = entry.getValue().stream().mapToInt(Integer::intValue).average().orElse(0.0);
            int employeeCount = entry.getValue().size();
            if (employeeCount > 0 && avg < 3) {
                skillsAtRisk++;
            }
            if (employeeCount > 0 && avg >= 3) {
                highDemandSkills++;
            }
            if (employeeCount > 0 && avg < 3.5) {
                projectedSkillGaps++;
                recruitmentRequirements += Math.max(0, (int) Math.ceil((3.5 - avg) * 2));
            }
        }

        for (EmployeeSkill employeeSkill : allSkills) {
            if (employeeSkill.getCurrentLevel() != null && employeeSkill.getCurrentLevel() < 3) {
                employeesRequiringUpskilling++;
            }
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("forecastAvailable", false);
        summary.put("message", "Insufficient historical data to generate a reliable forecast.");
        summary.put("highDemandSkills", highDemandSkills);
        summary.put("skillsAtRisk", skillsAtRisk);
        summary.put("projectedSkillGaps", projectedSkillGaps);
        summary.put("employeesRequiringUpskilling", employeesRequiringUpskilling);
        summary.put("recruitmentRequirements", recruitmentRequirements);
        return summary;
    }

    public List<Map<String, Object>> getSkillForecast() {
        List<EmployeeSkill> allSkills = employeeSkillRepository.findAll();
        Map<String, List<Integer>> skillLevels = new LinkedHashMap<>();

        for (EmployeeSkill employeeSkill : allSkills) {
            if (employeeSkill.getSkill() == null || employeeSkill.getSkill().getSkillName() == null) {
                continue;
            }
            String skillName = employeeSkill.getSkill().getSkillName();
            skillLevels.computeIfAbsent(skillName, key -> new ArrayList<>()).add(
                    employeeSkill.getCurrentLevel() != null ? employeeSkill.getCurrentLevel() : 0
            );
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map.Entry<String, List<Integer>> entry : skillLevels.entrySet()) {
            double avg = entry.getValue().stream().mapToInt(Integer::intValue).average().orElse(0.0);
            int currentWorkforce = entry.getValue().size();
            int currentDemand = entry.getValue().size();
            int projectedGap = currentWorkforce > 0 && avg < 3 ? (int) Math.ceil((3 - avg) * 2) : 0;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("skill", entry.getKey());
            row.put("currentWorkforce", currentWorkforce);
            row.put("currentDemand", currentDemand);
            row.put("projectedFutureDemand", currentDemand);
            row.put("currentCoverage", round((avg / 5.0) * 100));
            row.put("projectedGap", projectedGap);
            row.put("riskLevel", projectedGap <= 0 ? "Low" : projectedGap <= 2 ? "Medium" : projectedGap <= 4 ? "High" : "Critical");
            row.put("recommendedAction", projectedGap <= 0 ? "Monitor" : projectedGap <= 2 ? "Cross-Train" : projectedGap <= 4 ? "Upskill" : "Recruit");
            rows.add(row);
        }

        return rows;
    }

    public List<Map<String, Object>> getAtRiskSkills() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map<String, Object> row : getSkillForecast()) {
            int projectedGap = (int) row.getOrDefault("projectedGap", 0);
            if (projectedGap > 0) {
                row.put("currentCapability", row.get("currentCoverage"));
                row.put("futureDemand", row.get("projectedFutureDemand"));
                row.put("projectedShortage", row.get("projectedGap"));
                row.put("employeesAvailableForUpskilling", row.get("currentWorkforce"));
                row.put("recruitmentRequirement", row.get("projectedGap"));
                rows.add(row);
            }
        }
        return rows;
    }

    public List<Map<String, Object>> getUpskillVsHire() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map<String, Object> row : getSkillForecast()) {
            int futureRequirement = (int) row.getOrDefault("projectedFutureDemand", 0);
            int currentQualifiedEmployees = (int) row.getOrDefault("currentWorkforce", 0);
            int projectedGap = (int) row.getOrDefault("projectedGap", 0);
            int suitableForUpskilling = Math.max(0, Math.min(currentQualifiedEmployees, projectedGap));
            int remainingShortage = Math.max(0, projectedGap - suitableForUpskilling);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("skill", row.get("skill"));
            item.put("futureRequirement", futureRequirement);
            item.put("currentQualifiedEmployees", currentQualifiedEmployees);
            item.put("employeesSuitableForUpskilling", suitableForUpskilling);
            item.put("remainingShortage", remainingShortage);
            item.put("suggestedHiringRequirement", remainingShortage);
            rows.add(item);
        }
        return rows;
    }

    public List<Map<String, Object>> getDepartmentForecasts() {
        return new ArrayList<>();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
