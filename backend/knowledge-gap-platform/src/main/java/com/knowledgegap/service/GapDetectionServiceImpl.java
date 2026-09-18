package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.KnowledgeGapResponse;
import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.exception.CompetencyNotFoundException;
import com.knowledgegap.exception.EmployeeNotFoundException;
import com.knowledgegap.repository.KnowledgeGapRepository;

@Service
public class GapDetectionServiceImpl implements GapDetectionService {

    private final EmployeeService employeeService;
    private final EmployeeSkillService employeeSkillService;
    private final CompetencyService competencyService;
    private final KnowledgeGapRepository knowledgeGapRepository;

    public GapDetectionServiceImpl(
            EmployeeService employeeService,
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

        // --------------------------------------------------
        // 1. FIND EMPLOYEE
        // --------------------------------------------------

        Employee employee = employeeService
                .getEmployeeById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found for id: " + employeeId
                        )
                );

        // --------------------------------------------------
        // 2. GET EMPLOYEE DESIGNATION
        // --------------------------------------------------

        String designation = employee.getDesignation();

        if (designation == null || designation.isBlank()) {

            throw new CompetencyNotFoundException(
                    "Employee designation is not defined for employee id: "
                            + employeeId
            );
        }

        designation = designation.trim();

        System.out.println(
                "Employee: " + employee.getEmployeeId()
        );

        System.out.println(
                "Designation: " + designation
        );

        // --------------------------------------------------
        // 3. GET REQUIRED COMPETENCIES
        // --------------------------------------------------

        List<Competency> competencies =
                competencyService
                        .getCompetenciesByDesignation(designation);

        if (competencies.isEmpty()) {

            throw new CompetencyNotFoundException(
                    "No competencies found for designation: "
                            + designation
            );
        }

        // --------------------------------------------------
        // 4. GET EMPLOYEE CURRENT SKILLS
        // --------------------------------------------------

        List<EmployeeSkill> employeeSkills =
                employeeSkillService
                        .getSkillsByEmployee(employee);

        System.out.println(
                "Employee skill count: "
                        + employeeSkills.size()
        );

        // --------------------------------------------------
        // 5. CREATE MAP
        //
        // skill ID -> EmployeeSkill
        // --------------------------------------------------

        Map<Long, EmployeeSkill> skillMap =
                employeeSkills.stream()

                        .filter(es ->
                                es.getSkill() != null &&
                                es.getSkill().getId() != null
                        )

                        .collect(Collectors.toMap(
                                es -> es.getSkill().getId(),
                                es -> es
                        ));

        // --------------------------------------------------
        // 6. DELETE OLD KNOWLEDGE GAPS
        // --------------------------------------------------

        knowledgeGapRepository.deleteByEmployee(employee);

        knowledgeGapRepository.flush();

        // --------------------------------------------------
        // 7. CALCULATE NEW KNOWLEDGE GAPS
        // --------------------------------------------------

        for (Competency competency : competencies) {

            if (competency.getSkill() == null) {
                continue;
            }

            Long skillId =
                    competency.getSkill().getId();

            String skillName =
                    competency.getSkill().getSkillName();

            int requiredLevel =
                    competency.getRequiredLevel() == null
                            ? 0
                            : competency.getRequiredLevel();

            // ----------------------------------------------
            // FIND EMPLOYEE SKILL
            // ----------------------------------------------

            EmployeeSkill employeeSkill =
                    skillMap.get(skillId);

            int currentLevel = 0;

            if (employeeSkill != null &&
                    employeeSkill.getCurrentLevel() != null) {

                currentLevel =
                        employeeSkill.getCurrentLevel();
            }

            // ----------------------------------------------
            // CALCULATE GAP
            // ----------------------------------------------

            int gap =
                    requiredLevel - currentLevel;

            System.out.println(
                    "Skill: " + skillName
                            + " | Required: " + requiredLevel
                            + " | Current: " + currentLevel
                            + " | Gap: " + gap
            );

            // ----------------------------------------------
            // ONLY STORE ACTUAL GAPS
            // ----------------------------------------------

            if (gap <= 0) {
                continue;
            }

            KnowledgeGap knowledgeGap =
                    new KnowledgeGap();

            knowledgeGap.setEmployee(employee);

            knowledgeGap.setSkill(
                    competency.getSkill()
            );

            knowledgeGap.setCurrentLevel(
                    currentLevel
            );

            knowledgeGap.setRequiredLevel(
                    requiredLevel
            );

            knowledgeGap.setGap(gap);

            knowledgeGap.setGeneratedDate(
                    LocalDateTime.now()
            );

            knowledgeGapRepository.save(
                    knowledgeGap
            );
        }

        knowledgeGapRepository.flush();

        // --------------------------------------------------
        // 8. GET SAVED GAPS
        // --------------------------------------------------

        List<KnowledgeGap> savedGaps =
                knowledgeGapRepository
                        .findByEmployee(employee);

        // --------------------------------------------------
        // 9. CONVERT TO RESPONSE
        // --------------------------------------------------

        return savedGaps.stream()

                .map(gap ->
                        new KnowledgeGapResponse(
                                gap.getSkill().getSkillName(),
                                gap.getCurrentLevel(),
                                gap.getRequiredLevel(),
                                gap.getGap()
                        )
                )

                .collect(Collectors.toList());
    }

    @Override
    public List<KnowledgeGap> getStoredGapsForEmployee(
            Long employeeId) {

        Employee employee =
                employeeService
                        .getEmployeeById(employeeId)
                        .orElseThrow(() ->
                                new EmployeeNotFoundException(
                                        "Employee not found for id: "
                                                + employeeId
                                )
                        );

        return knowledgeGapRepository
                .findByEmployee(employee);
    }
}