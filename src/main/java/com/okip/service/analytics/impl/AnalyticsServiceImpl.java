package com.okip.service.analytics.impl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.okip.dto.analytics.DepartmentAnalyticsDTO;
import com.okip.dto.analytics.EmployeeAnalyticsDTO;
import com.okip.dto.analytics.ProficiencyAnalyticsDTO;
import com.okip.dto.analytics.SkillGapAnalyticsDTO;
import com.okip.dto.analytics.TeamAnalyticsDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.service.analytics.AnalyticsService;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

	private final EmployeeRepository employeeRepository;

	private final EmployeeJobRoleRepository employeeJobRoleRepository;

	private final EmployeeSkillRepository employeeSkillRepository;

	private final KnowledgeGapRepository knowledgeGapRepository;

	public AnalyticsServiceImpl(EmployeeRepository employeeRepository,
			EmployeeJobRoleRepository employeeJobRoleRepository, EmployeeSkillRepository employeeSkillRepository,
			KnowledgeGapRepository knowledgeGapRepository) {

		this.employeeRepository = employeeRepository;
		this.employeeJobRoleRepository = employeeJobRoleRepository;
		this.employeeSkillRepository = employeeSkillRepository;
		this.knowledgeGapRepository = knowledgeGapRepository;
	}

	@Override
	public EmployeeAnalyticsDTO getEmployeeAnalytics(Long employeeId) {

		Employee employee = getEmployee(employeeId);

		List<KnowledgeGap> gaps = getEmployeeGaps(employee);

		EmployeeAnalyticsDTO response = new EmployeeAnalyticsDTO();

		response.setEmployeeId(employee.getEmployeeId());

		response.setEmployeeCode(employee.getEmployeeCode());

		response.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());

		List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);

		if (!roles.isEmpty()) {

			response.setJobRoleName(roles.get(0).getJobRole().getJobRoleName());
		}

		response.setTotalSkills(gaps.size());

		int completedSkills = 0;

		double totalGap = 0.0;

		for (KnowledgeGap gap : gaps) {

			if ("COMPLETE".equals(gap.getGapType().name())) {

				completedSkills++;
			}

			if (gap.getGapPercentage() != null) {

				totalGap += gap.getGapPercentage();
			}
		}

		response.setCompletedSkills(completedSkills);

		response.setGapSkills(gaps.size() - completedSkills);

		if (!gaps.isEmpty()) {

			double averageGap = totalGap / gaps.size();

			response.setOverallGapPercentage(round(averageGap));

			response.setReadinessPercentage(round(100.0 - averageGap));

		} else {

			response.setOverallGapPercentage(0.0);

			response.setReadinessPercentage(100.0);
		}

		return response;
	}

	@Override
	public List<SkillGapAnalyticsDTO> getEmployeeSkillGaps(Long employeeId) {

		Employee employee = getEmployee(employeeId);

		List<KnowledgeGap> gaps = getEmployeeGaps(employee);

		List<SkillGapAnalyticsDTO> response = new ArrayList<>();

		for (KnowledgeGap gap : gaps) {

			SkillGapAnalyticsDTO dto = new SkillGapAnalyticsDTO();

			dto.setSkillName(gap.getSkill().getSkillName());

			dto.setGapType(gap.getGapType().name());

			dto.setGapPercentage(round(gap.getGapPercentage()));

			dto.setGapScore(round(gap.getGapScore()));

			response.add(dto);
		}

		return response;
	}

	@Override
	public List<ProficiencyAnalyticsDTO> getEmployeeProficiency(Long employeeId) {

		Employee employee = getEmployee(employeeId);

		List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);

		if (roles.isEmpty()) {

			throw new ResourceNotFoundException("No active job role assigned.");
		}

		List<KnowledgeGap> gaps = knowledgeGapRepository.findByEmployeeJobRoleIn(roles);

		List<ProficiencyAnalyticsDTO> response = new ArrayList<>();

		for (KnowledgeGap gap : gaps) {

			ProficiencyAnalyticsDTO dto = new ProficiencyAnalyticsDTO();

			dto.setSkillName(gap.getSkill().getSkillName());

			dto.setCurrentProficiency(gap.getCurrentProficiency() == null ? null : gap.getCurrentProficiency().name());

			dto.setRequiredProficiency(
					gap.getRequiredProficiency() == null ? null : gap.getRequiredProficiency().name());

			response.add(dto);
		}

		return response;
	}

	@Override
	public List<TeamAnalyticsDTO> getTeamAnalytics() {

		List<Employee> employees = employeeRepository.findAll();

		List<TeamAnalyticsDTO> response = new ArrayList<>();

		for (Employee employee : employees) {

			List<KnowledgeGap> gaps = getEmployeeGaps(employee);

			if (gaps.isEmpty()) {
				continue;
			}

			double totalGap = 0.0;

			for (KnowledgeGap gap : gaps) {

				if (gap.getGapPercentage() != null) {

					totalGap += gap.getGapPercentage();
				}
			}

			double averageGap = totalGap / gaps.size();

			TeamAnalyticsDTO dto = new TeamAnalyticsDTO();

			dto.setEmployeeId(employee.getEmployeeId());

			dto.setEmployeeCode(employee.getEmployeeCode());

			dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());

			List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);

			if (!roles.isEmpty()) {

				dto.setJobRoleName(roles.get(0).getJobRole().getJobRoleName());
			}

			dto.setGapPercentage(round(averageGap));

			dto.setReadinessPercentage(round(100.0 - averageGap));

			response.add(dto);
		}

		return response;
	}

	@Override
	public List<DepartmentAnalyticsDTO> getDepartmentAnalytics() {

		List<Employee> employees = employeeRepository.findAll();

		Map<String, List<Employee>> employeesByDepartment = new LinkedHashMap<>();

		for (Employee employee : employees) {

			if (employee.getDepartment() == null) {
				continue;
			}

			String departmentName = employee.getDepartment().getDepartmentName();

			employeesByDepartment.computeIfAbsent(departmentName, key -> new ArrayList<>()).add(employee);
		}

		List<DepartmentAnalyticsDTO> response = new ArrayList<>();

		for (Map.Entry<String, List<Employee>> entry : employeesByDepartment.entrySet()) {

			String departmentName = entry.getKey();

			List<Employee> departmentEmployees = entry.getValue();

			double totalGap = 0.0;

			int employeesWithGaps = 0;

			for (Employee employee : departmentEmployees) {

				List<KnowledgeGap> gaps = getEmployeeGaps(employee);

				if (gaps.isEmpty()) {
					continue;
				}

				double employeeGap = 0.0;

				for (KnowledgeGap gap : gaps) {

					if (gap.getGapPercentage() != null) {

						employeeGap += gap.getGapPercentage();
					}
				}

				totalGap += employeeGap / gaps.size();

				employeesWithGaps++;
			}

			if (employeesWithGaps == 0) {
				continue;
			}

			double averageGap = totalGap / employeesWithGaps;

			DepartmentAnalyticsDTO dto = new DepartmentAnalyticsDTO();

			dto.setDepartmentName(departmentName);

			dto.setEmployeeCount(departmentEmployees.size());

			dto.setAverageGapPercentage(round(averageGap));

			dto.setAverageReadinessPercentage(round(100.0 - averageGap));

			response.add(dto);
		}

		return response;
	}

	private Employee getEmployee(Long employeeId) {

		return employeeRepository.findById(employeeId)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
	}

	private List<KnowledgeGap> getEmployeeGaps(Employee employee) {

		List<EmployeeJobRole> roles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);

		if (roles.isEmpty()) {
			return new ArrayList<>();
		}

		return knowledgeGapRepository.findByEmployeeJobRoleIn(roles);
	}

	@Override
	public Long getEmployeeIdByEmail(String email) {

		Employee employee = employeeRepository.findByOfficialEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found."));

		return employee.getEmployeeId();
	}

	private double round(Double value) {

		if (value == null) {
			return 0.0;
		}

		return Math.round(value * 100.0) / 100.0;
	}
}