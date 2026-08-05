package com.knowledgegap.service;

import com.knowledgegap.dto.KnowledgeGapResponse;
import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.Role;
import com.knowledgegap.exception.CompetencyNotFoundException;
import com.knowledgegap.exception.EmployeeNotFoundException;
import com.knowledgegap.exception.EmployeeSkillNotFoundException;
import com.knowledgegap.repository.KnowledgeGapRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GapDetectionServiceImpl implements GapDetectionService {

    private final EmployeeService employeeService;
    private final EmployeeSkillService employeeSkillService;
    private final CompetencyService competencyService;
    private final KnowledgeGapRepository knowledgeGapRepository;

    public GapDetectionServiceImpl(EmployeeService employeeService,
                                   EmployeeSkillService employeeSkillService,
                                   CompetencyService competencyService,
                                   KnowledgeGapRepository knowledgeGapRepository) {
        this.employeeService = employeeService;
        this.employeeSkillService = employeeSkillService;
        this.competencyService = competencyService;
        this.knowledgeGapRepository = knowledgeGapRepository;
    }

    @Override
    @Transactional
    public List<KnowledgeGapResponse> detectKnowledgeGap(Long employeeId) {
        Employee employee = employeeService.getEmployeeById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found for id: " + employeeId));

        Role role = employee.getRole();
        if (role == null) {
            throw new CompetencyNotFoundException("Employee role is not defined for employee id: " + employeeId);
        }

        List<Competency> competencies = competencyService.getCompetenciesByRole(role);
        if (competencies.isEmpty()) {
            throw new CompetencyNotFoundException("No competency data found for role: " + role.getRoleName());
        }

        List<EmployeeSkill> employeeSkills = employeeSkillService.getSkillsByEmployee(employee);

        Map<Long, EmployeeSkill> skillMap = employeeSkills.stream()
                .filter(es -> es.getSkill() != null && es.getSkill().getId() != null)
                .collect(Collectors.toMap(es -> es.getSkill().getId(), es -> es));

        knowledgeGapRepository.deleteByEmployee(employee);

        List<KnowledgeGap> savedGaps = competencies.stream()
                .filter(competency -> competency.getSkill() != null)
                .map(competency -> {
                    int requiredLevel = Optional.ofNullable(competency.getRequiredLevel()).orElse(0);
                    EmployeeSkill employeeSkill = skillMap.get(competency.getSkill().getId());
                    int currentLevel = Optional.ofNullable(employeeSkill)
                            .map(EmployeeSkill::getCurrentLevel)
                            .orElse(0);
                    int gapValue = requiredLevel - currentLevel;

                    if (gapValue <= 0) {
                        return null;
                    }

                    KnowledgeGap knowledgeGap = new KnowledgeGap();
                    knowledgeGap.setEmployee(employee);
                    knowledgeGap.setSkill(competency.getSkill());
                    knowledgeGap.setCurrentLevel(currentLevel);
                    knowledgeGap.setRequiredLevel(requiredLevel);
                    knowledgeGap.setGap(gapValue);
                    knowledgeGap.setGeneratedDate(LocalDateTime.now());
                    return knowledgeGapRepository.save(knowledgeGap);
                })
                .filter(gap -> gap != null)
                .collect(Collectors.toList());

        return savedGaps.stream()
                .map(gap -> new KnowledgeGapResponse(
                        gap.getSkill().getSkillName(),
                        gap.getCurrentLevel(),
                        gap.getRequiredLevel(),
                        gap.getGap()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<KnowledgeGap> getStoredGapsForEmployee(Long employeeId) {
        Employee employee = employeeService.getEmployeeById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found for id: " + employeeId));

        return knowledgeGapRepository.findByEmployee(employee);
    }
}
