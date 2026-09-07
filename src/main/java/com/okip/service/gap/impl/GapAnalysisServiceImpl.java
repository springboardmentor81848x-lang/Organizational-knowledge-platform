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

	public GapAnalysisServiceImpl(EmployeeRepository employeeRepository,
			EmployeeJobRoleRepository employeeJobRoleRepository, EmployeeSkillRepository employeeSkillRepository,
			JobRoleCompetencyRepository competencyRepository, KnowledgeGapRepository knowledgeGapRepository) {

		this.employeeRepository = employeeRepository;
		this.employeeJobRoleRepository = employeeJobRoleRepository;
		this.employeeSkillRepository = employeeSkillRepository;
		this.competencyRepository = competencyRepository;
		this.knowledgeGapRepository = knowledgeGapRepository;
	}

	
	@Override
	@Transactional
	public GapAnalysisResponseDTO runGapAnalysis(Long employeeId) {

		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found."));

		List<EmployeeJobRole> assignedRoles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);

		if (assignedRoles.isEmpty()) {

			throw new ResourceNotFoundException("No active job role assigned.");
		}

		List<KnowledgeGap> allKnowledgeGaps = new ArrayList<>();

		for (EmployeeJobRole employeeJobRole : assignedRoles) {

			knowledgeGapRepository.deleteByEmployeeJobRole(employeeJobRole);

			List<JobRoleCompetency> competencies = competencyRepository.findByJobRole(employeeJobRole.getJobRole());

			for (JobRoleCompetency competency : competencies) {

				KnowledgeGap gap = buildKnowledgeGap(employee, employeeJobRole, competency);

				knowledgeGapRepository.save(gap);

				allKnowledgeGaps.add(gap);
			}
		}

		return buildGapAnalysisResponse(employee, assignedRoles, allKnowledgeGaps);
	}

	private KnowledgeGap buildKnowledgeGap(Employee employee, EmployeeJobRole employeeJobRole,
			JobRoleCompetency competency) {

		KnowledgeGap gap = new KnowledgeGap();

		gap.setEmployeeJobRole(employeeJobRole);

		gap.setSkill(competency.getSkill());

		gap.setRequiredProficiency(competency.getRequiredProficiency());

		gap.setRequiredExperience(competency.getMinimumExperience());

		gap.setAnalyzedAt(LocalDateTime.now());

		gap.setStatus(GapStatus.OPEN);

		EmployeeSkill employeeSkill = employeeSkillRepository.findByEmployeeAndSkill(employee, competency.getSkill())
				.orElse(null);

		if (employeeSkill == null) {

			gap.setCurrentProficiency(null);

			gap.setCurrentExperience(0.0);

			gap.setGapType(GapType.MISSING_SKILL);

			gap.setGapScore(100.0);

			gap.setGapPercentage(100.0);

			return gap;
		}

		gap.setCurrentProficiency(employeeSkill.getProficiencyLevel());

		gap.setCurrentExperience(employeeSkill.getYearsOfExperience());

		calculateGap(gap);

		return gap;
	}

	private void calculateGap(KnowledgeGap gap) {

		double score = 0;

		GapType gapType = GapType.COMPLETE;

		score += calculateProficiencyGap(gap);

		score += calculateExperienceGap(gap);

		if (gap.getCurrentProficiency() != gap.getRequiredProficiency()) {

			gapType = GapType.LOW_PROFICIENCY;
		}

		if (gap.getCurrentExperience() < gap.getRequiredExperience()) {

			gapType = GapType.LOW_EXPERIENCE;
		}

		if (score == 0) {

			gapType = GapType.COMPLETE;

			gap.setStatus(GapStatus.CLOSED);
		}

		gap.setGapType(gapType);

		gap.setGapScore(score);

		gap.setGapPercentage(score);
	}

	private double calculateProficiencyGap(KnowledgeGap gap) {

		int required = getProficiencyValue(gap.getRequiredProficiency());

		int current = getProficiencyValue(gap.getCurrentProficiency());

		if (current >= required) {

			return 0;
		}

		double difference = required - current;

		return (difference / 3.0) * 40.0;
	}

	private double calculateExperienceGap(KnowledgeGap gap) {

		if (gap.getCurrentExperience() >= gap.getRequiredExperience()) {

			return 0;
		}

		double difference = gap.getRequiredExperience() - gap.getCurrentExperience();

		return (difference / gap.getRequiredExperience()) * 20.0;
	}

	private int getProficiencyValue(ProficiencyLevel level) {

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

	@Override
	@Transactional(readOnly = true)
	public GapAnalysisResponseDTO getEmployeeGapAnalysis(Long employeeId) {

	    Employee employee = employeeRepository.findById(employeeId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "Employee not found."));

	    List<EmployeeJobRole> assignedRoles =
	            employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);

	    if (assignedRoles.isEmpty()) {

	        throw new ResourceNotFoundException(
	                "No active job role assigned.");
	    }

	    List<KnowledgeGap> gaps =
	            knowledgeGapRepository.findByEmployeeJobRoleIn(
	                    assignedRoles);

	    return buildGapAnalysisResponse(
	            employee,
	            assignedRoles,
	            gaps);
	}

	@Override
	@Transactional(readOnly = true)
	public GapAnalysisResponseDTO getMyGapAnalysis() {

	    Authentication authentication =
	            SecurityContextHolder.getContext().getAuthentication();

	    String email = authentication.getName();

	    Employee employee =
	            employeeRepository.findByOfficialEmail(email)
	                    .orElseThrow(() ->
	                            new ResourceNotFoundException(
	                                    "Employee not found."));

	    return getEmployeeGapAnalysis(
	            employee.getEmployeeId());
	}

	private GapAnalysisResponseDTO buildGapAnalysisResponse(Employee employee, List<EmployeeJobRole> assignedRoles,
			List<KnowledgeGap> gaps) {

		GapAnalysisResponseDTO response =
		        new GapAnalysisResponseDTO();

		response.setEmployeeCode(employee.getEmployeeCode());

		response.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());

		response.setJobRoleName(assignedRoles.get(0).getJobRole().getJobRoleName());

		response.setTotalSkills(gaps.size());

		int completed = 0;

		double totalGap = 0;

		for (KnowledgeGap gap : gaps) {

			if (gap.getGapType() == GapType.COMPLETE) {

				completed++;
			}

			totalGap += gap.getGapPercentage();
		}

		response.setCompletedSkills(completed);

		response.setGapSkills(gaps.size() - completed);

		if (!gaps.isEmpty()) {

			double averageGap = totalGap / gaps.size();

			response.setOverallGapPercentage(averageGap);

			response.setReadinessPercentage(100 - averageGap);
		} else {

			response.setOverallGapPercentage(null);

			response.setReadinessPercentage(null);
		}

		List<KnowledgeGapResponseDTO> gapResponses = new ArrayList<>();

		for (KnowledgeGap gap : gaps) {

			gapResponses.add(buildKnowledgeGapResponse(gap));
		}

		response.setKnowledgeGaps(gapResponses);

		return response;
	}

	private KnowledgeGapResponseDTO buildKnowledgeGapResponse(KnowledgeGap gap) {

		KnowledgeGapResponseDTO response = new KnowledgeGapResponseDTO();

		response.setKnowledgeGapId(gap.getKnowledgeGapId());

		response.setEmployeeCode(gap.getEmployeeJobRole().getEmployee().getEmployeeCode());

		response.setEmployeeName(gap.getEmployeeJobRole().getEmployee().getFirstName() + " "
				+ gap.getEmployeeJobRole().getEmployee().getLastName());

		response.setJobRoleName(gap.getEmployeeJobRole().getJobRole().getJobRoleName());

		response.setSkillName(gap.getSkill().getSkillName());

		response.setCurrentProficiency(gap.getCurrentProficiency());

		response.setRequiredProficiency(gap.getRequiredProficiency());

		response.setCurrentExperience(gap.getCurrentExperience());

		response.setRequiredExperience(gap.getRequiredExperience());

		response.setGapType(gap.getGapType());

		response.setGapScore(gap.getGapScore());

		response.setGapPercentage(gap.getGapPercentage());

		response.setStatus(gap.getStatus());

		return response;
	}
}