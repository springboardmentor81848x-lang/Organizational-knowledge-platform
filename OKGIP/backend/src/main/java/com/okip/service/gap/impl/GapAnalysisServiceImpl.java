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
import com.okip.service.notification.NotificationService;

@Service
public class GapAnalysisServiceImpl implements GapAnalysisService {

    private final EmployeeRepository employeeRepository;

    private final EmployeeJobRoleRepository employeeJobRoleRepository;

    private final EmployeeSkillRepository employeeSkillRepository;

    private final JobRoleCompetencyRepository competencyRepository;

    private final KnowledgeGapRepository knowledgeGapRepository;
    private final NotificationService notificationService;

    public GapAnalysisServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            EmployeeSkillRepository employeeSkillRepository,
            JobRoleCompetencyRepository competencyRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            NotificationService notificationService) {

        this.employeeRepository = employeeRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.competencyRepository = competencyRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // RUN GAP ANALYSIS FOR EMPLOYEE
    // =========================================================

    @Override
    @Transactional
    public synchronized GapAnalysisResponseDTO runGapAnalysis(
            Long employeeId) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found."));

        List<EmployeeJobRole> assignedRoles =
                employeeJobRoleRepository
                        .findByEmployeeAndActiveTrue(employee);

        if (assignedRoles.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No active job role assigned.");
        }

        List<KnowledgeGap> allKnowledgeGaps =
                new ArrayList<>();

        /*
         * Gap analysis is driven by the job-role competency matrix.
         * Therefore every required competency is evaluated, including
         * skills that are not yet present in the employee profile.
         */
        for (EmployeeJobRole employeeJobRole : assignedRoles) {

            knowledgeGapRepository
                    .deleteByEmployeeJobRole(employeeJobRole);

            List<JobRoleCompetency> competencies =
                    competencyRepository
                            .findByJobRole(employeeJobRole.getJobRole());

            for (JobRoleCompetency competency : competencies) {

                if (competency == null || competency.getSkill() == null) {
                    continue;
                }

                KnowledgeGap gap =
                        buildKnowledgeGap(
                                employee,
                                employeeJobRole,
                                competency);

                knowledgeGapRepository.save(gap);
                allKnowledgeGaps.add(gap);
            }
        }

        notificationService.notifyEmployee(
                employee.getEmployeeId(),
                "SKILL_GAP_UPDATED",
                "Skill Gap Analysis Updated",
                "Your skill-gap analysis has been updated.",
                "/employee/skill-gaps");

        return buildGapAnalysisResponse(
                employee,
                assignedRoles,
                allKnowledgeGaps);
    }


    // =========================================================
    // BUILD REQUIRED SKILL KNOWLEDGE GAP
    // =========================================================

    private KnowledgeGap buildKnowledgeGap(
            Employee employee,
            EmployeeJobRole employeeJobRole,
            JobRoleCompetency competency) {

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
        EmployeeSkill employeeSkill =
                employeeSkillRepository
                        .findByEmployeeAndSkill(
                                employee,
                                competency.getSkill())
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
    // CALCULATE GAP
    // =========================================================

    private void calculateGap(
            KnowledgeGap gap) {

        double proficiencyGap = calculateProficiencyGap(gap);
        double experienceGap = calculateExperienceGap(gap);

        double score =
                Math.min(
                        100.0,
                        (proficiencyGap * 0.80)
                                + (experienceGap * 0.20));

        GapType gapType = GapType.COMPLETE;

        boolean proficiencyBelow =
                getProficiencyValue(gap.getCurrentProficiency())
                        < getProficiencyValue(gap.getRequiredProficiency());

        double currentExperience =
                gap.getCurrentExperience() == null
                        ? 0.0
                        : gap.getCurrentExperience();

        double requiredExperience =
                gap.getRequiredExperience() == null
                        ? 0.0
                        : gap.getRequiredExperience();

        if (proficiencyBelow) {
            gapType = GapType.LOW_PROFICIENCY;
        } else if (currentExperience < requiredExperience) {
            gapType = GapType.LOW_EXPERIENCE;
        }

        if (score <= 0.0) {
            score = 0.0;
            gapType = GapType.COMPLETE;
            gap.setStatus(GapStatus.CLOSED);
        } else {
            gap.setStatus(GapStatus.OPEN);
        }

        gap.setGapType(gapType);
        gap.setGapScore(score);
        gap.setGapPercentage(score);
    }

    // =========================================================
    // CALCULATE PROFICIENCY GAP
    // =========================================================

    private double calculateProficiencyGap(
            KnowledgeGap gap) {

        int required =
                getProficiencyPercentage(
                        gap.getRequiredProficiency());

        int current =
                getProficiencyPercentage(
                        gap.getCurrentProficiency());

        if (current >= required) {
            return 0.0;
        }

        if (required <= 0) {
            return 0.0;
        }

        return ((double) (required - current) / required) * 100.0;
    }

    // =========================================================
    // CALCULATE EXPERIENCE GAP
    // =========================================================

    private double calculateExperienceGap(
            KnowledgeGap gap) {

        if (gap.getRequiredExperience() == null
                || gap.getRequiredExperience() <= 0) {
            return 0.0;
        }

        double currentExperience =
                gap.getCurrentExperience() == null
                        ? 0.0
                        : gap.getCurrentExperience();

        double requiredExperience =
                gap.getRequiredExperience();

        if (currentExperience >= requiredExperience) {
            return 0.0;
        }

        return Math.min(
                100.0,
                ((requiredExperience - currentExperience)
                        / requiredExperience) * 100.0);
    }

    // =========================================================
    // PROFICIENCY VALUE
    // =========================================================

    private int getProficiencyPercentage(
            ProficiencyLevel level) {

        if (level == null) {
            return 0;
        }

        switch (level) {
            case BEGINNER:
                return 25;
            case INTERMEDIATE:
                return 50;
            case ADVANCED:
                return 75;
            case EXPERT:
                return 100;
            default:
                return 0;
        }
    }

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