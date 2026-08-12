package com.knowledgegap.service;

import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.Role;
import com.knowledgegap.repository.KnowledgeGapRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.knowledgegap.dto.HRKnowledgeGapResponse;
import com.knowledgegap.repository.EmployeeRepository;

import java.util.Comparator;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class KnowledgeGapService {

    private final KnowledgeGapRepository knowledgeGapRepository;
    private final EmployeeSkillService employeeSkillService;
    private final CompetencyService competencyService;
    private final EmployeeRepository employeeRepository;

    public KnowledgeGapService(
        KnowledgeGapRepository knowledgeGapRepository,
        EmployeeSkillService employeeSkillService,
        CompetencyService competencyService,
        EmployeeRepository employeeRepository) {

    this.knowledgeGapRepository = knowledgeGapRepository;
    this.employeeSkillService = employeeSkillService;
    this.competencyService = competencyService;
    this.employeeRepository = employeeRepository;
}

    public KnowledgeGap saveKnowledgeGap(KnowledgeGap knowledgeGap) {
        return knowledgeGapRepository.save(knowledgeGap);
    }

    // Get all KnowledgeGaps
    
    public List<KnowledgeGap> getAllKnowledgeGaps() {
        return knowledgeGapRepository.findAll();
    }

    // Get KnowledgeGap by ID
    public Optional<KnowledgeGap> getKnowledgeGapById(Long id) {
        return knowledgeGapRepository.findById(id);
    }

    public List<KnowledgeGap> getKnowledgeGapsByEmployee(Employee employee) {
        return knowledgeGapRepository.findByEmployee(employee);
    }
    @Transactional
    public List<KnowledgeGap> detectAndSaveGaps(Employee employee) {

    if (employee == null || employee.getDesignation() == null || employee.getDesignation().isBlank()) {
        return List.of();
    }

    List<EmployeeSkill> currentSkills =
            employeeSkillService.getSkillsByEmployee(employee);

    List<Competency> requiredCompetencies =
            competencyService.getCompetenciesByDesignation(employee.getDesignation());

    // Create a map of employee skills for quick lookup
    Map<Long, EmployeeSkill> skillMap = new HashMap<>();

    for (EmployeeSkill current : currentSkills) {
        if (current.getSkill() != null && current.getSkill().getId() != null) {
            skillMap.put(current.getSkill().getId(), current);
        }
    }

    knowledgeGapRepository.deleteByEmployee(employee);

    List<KnowledgeGap> gapResults = new ArrayList<>();

    for (Competency competency : requiredCompetencies) {

        if (competency.getSkill() == null) {
            continue;
        }

        int requiredLevel = competency.getRequiredLevel() != null
                ? competency.getRequiredLevel()
                : 0;

        EmployeeSkill currentSkill =
                skillMap.get(competency.getSkill().getId());

        int currentLevel = currentSkill != null && currentSkill.getCurrentLevel() != null
                ? currentSkill.getCurrentLevel()
                : 0;

        int gap = Math.max(0, requiredLevel - currentLevel);

        if (gap > 0) {
            KnowledgeGap knowledgeGap = new KnowledgeGap();
            knowledgeGap.setEmployee(employee);
            knowledgeGap.setSkill(competency.getSkill());
            knowledgeGap.setCurrentLevel(currentLevel);
            knowledgeGap.setRequiredLevel(requiredLevel);
            knowledgeGap.setGap(gap);

            gapResults.add(knowledgeGapRepository.save(knowledgeGap));
        }
    }

    return gapResults;
}
private String getGapStatus(double averageGap) {

    if (averageGap == 0) {
        return "No Gap";
    } else if (averageGap <= 1) {
        return "Low";
    } else if (averageGap <= 2) {
        return "Medium";
    } else if (averageGap <= 3) {
        return "High";
    } else {
        return "Critical";
    }
}


    // Delete KnowledgeGap by ID
    public void deleteKnowledgeGap(Long id) {
        knowledgeGapRepository.deleteById(id);
    }

public HRKnowledgeGapResponse getHRKnowledgeGapAnalysis() {

    // ==========================================
    // 1. Get only regular employees
    // ==========================================

    List<Employee> employees =
            employeeRepository.findByRoleRoleName("EMPLOYEE");


    // ==========================================
    // 2. Get all knowledge gaps
    // ==========================================

    List<KnowledgeGap> allGaps =
            knowledgeGapRepository.findAll()
                    .stream()
                    .filter(gap ->
                            gap.getEmployee() != null &&
                            employees.contains(gap.getEmployee()))
                    .toList();


    // ==========================================
    // 3. Basic statistics
    // ==========================================

    long totalEmployees = employees.size();

    long employeesWithGaps =
            allGaps.stream()
                    .map(gap -> gap.getEmployee().getId())
                    .distinct()
                    .count();

    long totalKnowledgeGaps = allGaps.size();

    double averageGap =
            allGaps.stream()
                    .mapToInt(KnowledgeGap::getGap)
                    .average()
                    .orElse(0.0);


    // ==========================================
    // 4. Gap distribution
    // ==========================================

    HRKnowledgeGapResponse.GapDistribution distribution =
            new HRKnowledgeGapResponse.GapDistribution();

    for (KnowledgeGap gap : allGaps) {

        int value = gap.getGap() != null
                ? gap.getGap()
                : 0;

        if (value == 1) {
            distribution.setLow(
                    distribution.getLow() + 1
            );

        } else if (value == 2) {
            distribution.setMedium(
                    distribution.getMedium() + 1
            );

        } else if (value == 3) {
            distribution.setHigh(
                    distribution.getHigh() + 1
            );

        } else if (value >= 4) {
            distribution.setCritical(
                    distribution.getCritical() + 1
            );
        }
    }


    // ==========================================
    // 5. Top skills with gaps
    // ==========================================

    Map<String, List<KnowledgeGap>> skillGroups =
            allGaps.stream()
                    .filter(gap ->
                            gap.getSkill() != null)
                    .collect(Collectors.groupingBy(
                            gap -> gap.getSkill().getSkillName()
                    ));

    List<HRKnowledgeGapResponse.TopSkillGap> topSkills =
            skillGroups.entrySet()
                    .stream()
                    .map(entry -> {

                        String skillName =
                                entry.getKey();

                        List<KnowledgeGap> gaps =
                                entry.getValue();

                        long affectedEmployees =
                                gaps.stream()
                                        .map(gap ->
                                                gap.getEmployee().getId())
                                        .distinct()
                                        .count();

                        double avgGap =
                                gaps.stream()
                                        .mapToInt(
                                                KnowledgeGap::getGap)
                                        .average()
                                        .orElse(0.0);

                        return new HRKnowledgeGapResponse.TopSkillGap(
                                skillName,
                                affectedEmployees,
                                Math.round(avgGap * 100.0) / 100.0
                        );
                    })
                    .sorted(
                            Comparator.comparingLong(
                                    HRKnowledgeGapResponse.TopSkillGap
                                            ::getEmployeesAffected
                            ).reversed()
                    )
                    .limit(5)
                    .toList();


    // ==========================================
    // 6. Employee performance
    // ==========================================

    List<HRKnowledgeGapResponse.EmployeeGapAnalysis>
            employeePerformance =
            employees.stream()
                    .map(employee -> {

                        List<EmployeeSkill> skills =
                                employeeSkillService
                                        .getSkillsByEmployee(employee);

                        double averageSkillLevel =
                                skills.stream()
                                        .filter(skill ->
                                                skill.getCurrentLevel() != null)
                                        .mapToInt(
                                                EmployeeSkill::getCurrentLevel)
                                        .average()
                                        .orElse(0.0);

                        List<KnowledgeGap> employeeGaps =
                                allGaps.stream()
                                        .filter(gap ->
                                                gap.getEmployee()
                                                        .getId()
                                                        .equals(employee.getId()))
                                        .toList();

                        double employeeAverageGap =
                                employeeGaps.stream()
                                        .mapToInt(
                                                KnowledgeGap::getGap)
                                        .average()
                                        .orElse(0.0);

                        String status =
                                getGapStatus(employeeAverageGap);

                        String name =
                                employee.getFirstName()
                                + " "
                                + employee.getLastName();

                        return new HRKnowledgeGapResponse.EmployeeGapAnalysis(
                                employee.getEmployeeId(),
                                name,
                                employee.getDesignation(),
                                Math.round(
                                        averageSkillLevel * 100.0
                                ) / 100.0,
                                Math.round(
                                        employeeAverageGap * 100.0
                                ) / 100.0,
                                status
                        );
                    })
                    .toList();


    // ==========================================
    // 7. Critical gaps
    // ==========================================

    long criticalGaps =
            allGaps.stream()
                    .filter(gap ->
                            gap.getGap() != null &&
                            gap.getGap() >= 4)
                    .count();


    // ==========================================
    // 8. Build response
    // ==========================================

    HRKnowledgeGapResponse response =
            new HRKnowledgeGapResponse();

    response.setTotalEmployees(totalEmployees);
    response.setEmployeesWithGaps(employeesWithGaps);
    response.setTotalKnowledgeGaps(totalKnowledgeGaps);
    response.setAverageGap(
            Math.round(averageGap * 100.0) / 100.0
    );
    response.setCriticalGaps(criticalGaps);
    response.setGapDistribution(distribution);
    response.setTopSkills(topSkills);
    response.setEmployeePerformance(employeePerformance);

    return response;
}
}