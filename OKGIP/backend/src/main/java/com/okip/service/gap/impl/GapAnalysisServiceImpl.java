package com.okip.service.gap.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.gap.GapAnalysisResponseDTO;
import com.okip.dto.gap.KnowledgeGapResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.JobRoleCompetency;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.enums.GapStatus;
import com.okip.enums.GapType;
import com.okip.enums.ProficiencyLevel;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.JobRoleCompetencyRepository;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.service.gap.GapAnalysisService;

@Service
public class GapAnalysisServiceImpl implements GapAnalysisService {

    private final EmployeeRepository employeeRepository;

    private final EmployeeJobRoleRepository employeeJobRoleRepository;

    private final EmployeeSkillRepository employeeSkillRepository;

    private final JobRoleCompetencyRepository competencyRepository;

    private final KnowledgeGapRepository knowledgeGapRepository;

    public GapAnalysisServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            EmployeeSkillRepository employeeSkillRepository,
            JobRoleCompetencyRepository competencyRepository,
            KnowledgeGapRepository knowledgeGapRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.competencyRepository = competencyRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
    }

    // =========================================================
    // RUN GAP ANALYSIS FOR EMPLOYEE
    // =========================================================

    @Override
    @Transactional
    public synchronized GapAnalysisResponseDTO runGapAnalysis(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));

        List<EmployeeJobRole> assignedRoles =
                employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);

        if (assignedRoles.isEmpty()) {
            throw new ResourceNotFoundException("No active job role assigned.");
        }

        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findByEmployee(employee);
        List<KnowledgeGap> allKnowledgeGaps = new ArrayList<>();

        // The comparison MUST start from the skills required by the job role.
        // Starting from employee_skills misses skills the employee has never added.
        for (EmployeeJobRole employeeJobRole : assignedRoles) {
            knowledgeGapRepository.deleteByEmployeeJobRole(employeeJobRole);

            List<JobRoleCompetency> competencies =
                    competencyRepository.findByJobRole(employeeJobRole.getJobRole());

            for (JobRoleCompetency competency : competencies) {
                if (competency == null || competency.getSkill() == null) {
                    continue;
                }

                KnowledgeGap gap = buildKnowledgeGap(
                        employee, employeeJobRole, competency, employeeSkills);

                knowledgeGapRepository.save(gap);
                allKnowledgeGaps.add(gap);
            }
        }

        return buildGapAnalysisResponse(employee, assignedRoles, allKnowledgeGaps);
    }

    // =========================================================
    // BUILD REQUIRED SKILL KNOWLEDGE GAP
    // =========================================================

    private KnowledgeGap buildKnowledgeGap(
            Employee employee,
            EmployeeJobRole employeeJobRole,
            JobRoleCompetency competency,
            List<EmployeeSkill> employeeSkills) {

        KnowledgeGap gap = new KnowledgeGap();

        gap.setEmployeeJobRole(
                employeeJobRole);

        gap.setSkill(
                competency.getSkill());

        /*
         * Required proficiency comes from
         * JobRoleCompetency.
         */
        ProficiencyLevel requiredProficiency =
                competency.getRequiredProficiency();

        /*
         * Database column required_proficiency
         * is NOT NULL.
         */
        if (requiredProficiency == null) {

            throw new ResourceNotFoundException(
                    "Required proficiency is not configured for skill: "
                            + competency.getSkill().getSkillName());
        }

        gap.setRequiredProficiency(
                requiredProficiency);

        /*
         * Required experience comes from
         * JobRoleCompetency.
         */
        gap.setRequiredExperience(
                competency.getMinimumExperience());

        gap.setAnalyzedAt(
                LocalDateTime.now());

        gap.setStatus(
                GapStatus.OPEN);

        /*
         * Find employee skill.
         */
        EmployeeSkill employeeSkill = employeeSkills.stream()
                .filter(es -> es.getSkill() != null
                        && es.getSkill().getSkillId().equals(competency.getSkill().getSkillId()))
                .findFirst()
                .orElse(null);

        /*
         * Required skill is missing.
         */
        if (employeeSkill == null) {

            gap.setCurrentProficiency(
                    null);

            gap.setCurrentExperience(
                    0.0);

            gap.setGapType(
                    GapType.MISSING_SKILL);

            gap.setGapScore(
                    100.0);

            gap.setGapPercentage(
                    100.0);

            gap.setStatus(
                    GapStatus.OPEN);

            return gap;
        }

        /*
         * Employee has the required skill.
         */
        gap.setCurrentProficiency(
                employeeSkill.getProficiencyLevel());

        gap.setCurrentExperience(
                employeeSkill.getYearsOfExperience() == null
                        ? 0.0
                        : employeeSkill.getYearsOfExperience());

        calculateGap(gap);

        return gap;
    }

    // =========================================================
    // BUILD NON-REQUIRED SKILL GAP
    // =========================================================

    private KnowledgeGap buildNonRequiredSkillGap(
            Employee employee,
            EmployeeJobRole employeeJobRole,
            EmployeeSkill employeeSkill) {

        KnowledgeGap gap = new KnowledgeGap();

        gap.setEmployeeJobRole(
                employeeJobRole);

        gap.setSkill(
                employeeSkill.getSkill());

        ProficiencyLevel currentProficiency =
                employeeSkill.getProficiencyLevel();

        gap.setCurrentProficiency(
                currentProficiency);

        double currentExperience =
                employeeSkill.getYearsOfExperience() == null
                        ? 0.0
                        : employeeSkill.getYearsOfExperience();

        gap.setCurrentExperience(
                currentExperience);

        /*
         * The database requires required_proficiency.
         *
         * Since this skill is not required by the role,
         * use the current proficiency as the required
         * proficiency.
         *
         * Therefore:
         *
         * Current = Required
         * Gap = 0
         * COMPLETE
         * CLOSED
         */
        gap.setRequiredProficiency(
                currentProficiency);

        gap.setRequiredExperience(
                currentExperience);

        gap.setGapType(
                GapType.COMPLETE);

        gap.setGapScore(
                0.0);

        gap.setGapPercentage(
                0.0);

        gap.setStatus(
                GapStatus.CLOSED);

        gap.setAnalyzedAt(
                LocalDateTime.now());

        return gap;
    }

    // =========================================================
    // CALCULATE GAP
    // =========================================================

    private void calculateGap(KnowledgeGap gap) {
        double proficiencyGap = calculateProficiencyGap(gap);
        double experienceGap = calculateExperienceGap(gap);

        boolean hasExperienceRequirement = gap.getRequiredExperience() != null
                && gap.getRequiredExperience() > 0.0;

        double score = hasExperienceRequirement
                ? (proficiencyGap * 0.70) + (experienceGap * 0.30)
                : proficiencyGap;

        score = Math.max(0.0, Math.min(100.0, score));

        if (score <= 0.0001) {
            gap.setGapType(GapType.COMPLETE);
            gap.setStatus(GapStatus.CLOSED);
            gap.setGapScore(0.0);
            gap.setGapPercentage(0.0);
            return;
        }

        boolean proficiencyBelow = getProficiencyValue(gap.getCurrentProficiency())
                < getProficiencyValue(gap.getRequiredProficiency());
        boolean experienceBelow = hasExperienceRequirement
                && (gap.getCurrentExperience() == null
                    || gap.getCurrentExperience() < gap.getRequiredExperience());

        if (proficiencyBelow && experienceBelow) {
            gap.setGapType(GapType.LOW_PROFICIENCY);
        } else if (proficiencyBelow) {
            gap.setGapType(GapType.LOW_PROFICIENCY);
        } else {
            gap.setGapType(GapType.LOW_EXPERIENCE);
        }

        gap.setStatus(GapStatus.OPEN);
        gap.setGapScore(score);
        gap.setGapPercentage(score);
    }

    // =========================================================
    // CALCULATE PROFICIENCY GAP (0-100)
    // =========================================================

    private double calculateProficiencyGap(KnowledgeGap gap) {
        int required = getProficiencyValue(gap.getRequiredProficiency());
        int current = getProficiencyValue(gap.getCurrentProficiency());

        if (required <= 0 || current >= required) {
            return 0.0;
        }

        return Math.min(100.0, ((required - current) * 100.0) / required);
    }

    // =========================================================
    // CALCULATE EXPERIENCE GAP (0-100)
    // =========================================================

    private double calculateExperienceGap(KnowledgeGap gap) {
        double required = gap.getRequiredExperience() == null
                ? 0.0 : gap.getRequiredExperience();
        double current = gap.getCurrentExperience() == null
                ? 0.0 : gap.getCurrentExperience();

        if (required <= 0.0 || current >= required) {
            return 0.0;
        }

        return Math.min(100.0, ((required - current) * 100.0) / required);
    }

    // =========================================================
    // PROFICIENCY VALUE
    // =========================================================

    private int getProficiencyValue(
            ProficiencyLevel level) {

        if (level == null) {

            return 0;
        }

        switch (level) {

            case BEGINNER:
                return 1;

            case INTERMEDIATE:
                return 2;

            case ADVANCED:
                return 3;

            case EXPERT:
                return 4;

            default:
                return 0;
        }
    }

    // =========================================================
    // GET EMPLOYEE GAP ANALYSIS
    // =========================================================

    @Override
    public GapAnalysisResponseDTO getEmployeeGapAnalysis(
            Long employeeId) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found."));

        List<EmployeeJobRole> assignedRoles =
                employeeJobRoleRepository
                        .findByEmployeeAndActiveTrue(
                                employee);

        if (assignedRoles.isEmpty()) {

            throw new ResourceNotFoundException(
                    "No active job role assigned.");
        }

        List<KnowledgeGap> gaps =
                knowledgeGapRepository
                        .findByEmployeeJobRoleIn(
                                assignedRoles);

        return buildGapAnalysisResponse(
                employee,
                assignedRoles,
                gaps);
    }

    // =========================================================
    // GET MY GAP ANALYSIS
    // =========================================================

    @Override
    public GapAnalysisResponseDTO getMyGapAnalysis() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                authentication.getName();

        Employee employee =
                employeeRepository
                        .findByOfficialEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found."));

        return getEmployeeGapAnalysis(
                employee.getEmployeeId());
    }

    // =========================================================
    // RUN MY GAP ANALYSIS
    // =========================================================

    @Override
    @Transactional
    public GapAnalysisResponseDTO runMyGapAnalysis() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                authentication.getName();

        Employee employee =
                employeeRepository
                        .findByOfficialEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found."));

        /*
         * runGapAnalysis() is synchronized.
         *
         * Therefore concurrent requests for gap
         * regeneration are serialized.
         */
        return runGapAnalysis(
                employee.getEmployeeId());
    }

    // =========================================================
    // BUILD GAP ANALYSIS RESPONSE
    // =========================================================

    private GapAnalysisResponseDTO buildGapAnalysisResponse(
            Employee employee,
            List<EmployeeJobRole> assignedRoles,
            List<KnowledgeGap> gaps) {

        GapAnalysisResponseDTO response =
                new GapAnalysisResponseDTO();

        response.setEmployeeCode(
                employee.getEmployeeCode());

        response.setEmployeeName(
                employee.getFirstName()
                        + " "
                        + employee.getLastName());

        response.setJobRoleName(
                assignedRoles.get(0)
                        .getJobRole()
                        .getJobRoleName());

        response.setTotalSkills(
                gaps.size());

        int completed = 0;

        double totalGap = 0.0;

        for (KnowledgeGap gap : gaps) {

            if (gap.getGapType()
                    == GapType.COMPLETE) {

                completed++;
            }

            if (gap.getGapPercentage() != null) {

                totalGap +=
                        gap.getGapPercentage();
            }
        }

        response.setCompletedSkills(
                completed);

        response.setGapSkills(
                gaps.size() - completed);

        /*
         * Calculate average gap.
         */
        if (!gaps.isEmpty()) {

            double averageGap =
                    totalGap / gaps.size();

            response.setOverallGapPercentage(
                    averageGap);

            response.setReadinessPercentage(
                    Math.max(
                            0.0,
                            100.0 - averageGap));

        }
        else {

            response.setOverallGapPercentage(
                    0.0);

            response.setReadinessPercentage(
                    100.0);
        }

        /*
         * Convert KnowledgeGap entities
         * to response DTOs.
         */
        List<KnowledgeGapResponseDTO>
                gapResponses =
                        new ArrayList<>();

        for (KnowledgeGap gap : gaps) {

            gapResponses.add(
                    buildKnowledgeGapResponse(
                            gap));
        }

        response.setKnowledgeGaps(
                gapResponses);

        return response;
    }

    // =========================================================
    // BUILD KNOWLEDGE GAP RESPONSE
    // =========================================================

    private KnowledgeGapResponseDTO buildKnowledgeGapResponse(
            KnowledgeGap gap) {

        KnowledgeGapResponseDTO response =
                new KnowledgeGapResponseDTO();

        response.setKnowledgeGapId(
                gap.getKnowledgeGapId());

        response.setEmployeeCode(
                gap.getEmployeeJobRole()
                        .getEmployee()
                        .getEmployeeCode());

        response.setEmployeeName(
                gap.getEmployeeJobRole()
                        .getEmployee()
                        .getFirstName()
                        + " "
                        + gap.getEmployeeJobRole()
                                .getEmployee()
                                .getLastName());

        response.setJobRoleName(
                gap.getEmployeeJobRole()
                        .getJobRole()
                        .getJobRoleName());

        response.setSkillName(
                gap.getSkill()
                        .getSkillName());

        response.setCurrentProficiency(
                gap.getCurrentProficiency());

        response.setRequiredProficiency(
                gap.getRequiredProficiency());

        response.setCurrentExperience(
                gap.getCurrentExperience());

        response.setRequiredExperience(
                gap.getRequiredExperience());

        response.setGapType(
                gap.getGapType());

        response.setGapScore(
                gap.getGapScore());

        response.setGapPercentage(
                gap.getGapPercentage());

        response.setStatus(
                gap.getStatus());

        return response;
    }
}