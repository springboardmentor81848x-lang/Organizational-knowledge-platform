package com.okip.service.skill.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.okip.dto.skill.SkillRequestDTO;
import com.okip.dto.skill.SkillResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.service.skill.SkillService;
import com.okip.entity.master.Skill;
import com.okip.repository.SkillRepository;

@Service
public class SkillServiceImpl implements SkillService {

	private final EmployeeRepository employeeRepository;
	private final EmployeeSkillRepository skillRepository;
	private final SkillRepository skillRepositoryMaster;

	public SkillServiceImpl(EmployeeRepository employeeRepository, EmployeeSkillRepository skillRepository,
			SkillRepository skillRepositoryMaster) {

		this.employeeRepository = employeeRepository;
		this.skillRepository = skillRepository;
		this.skillRepositoryMaster = skillRepositoryMaster;
	}

	@Override
	public SkillResponseDTO addSkill(SkillRequestDTO request) {

	    Employee employee = getLoggedInEmployee();

	    Skill masterSkill = skillRepositoryMaster
	            .findById(request.getSkillId())
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Skill not found."));

	    if (skillRepository.findByEmployeeAndSkill(employee, masterSkill).isPresent()) {

	        throw new ResourceAlreadyExistsException(
	                "Skill already exists.");
	    }

	    EmployeeSkill skill = new EmployeeSkill();

	    skill.setEmployee(employee);
	    skill.setSkill(masterSkill);
	    skill.setProficiencyLevel(request.getProficiencyLevel());
	    skill.setYearsOfExperience(request.getYearsOfExperience());
	    skill.setLastUsed(request.getLastUsed());

	    skill = skillRepository.save(skill);

	    return buildResponse(skill);
	}

	@Override
	public List<SkillResponseDTO> getMySkills() {

		Employee employee = getLoggedInEmployee();

		List<EmployeeSkill> skills = skillRepository.findByEmployee(employee);

		List<SkillResponseDTO> response = new ArrayList<>();

		for (EmployeeSkill skill : skills) {

			response.add(buildResponse(skill));
		}

		return response;
	}

	@Override
	public SkillResponseDTO updateSkill(Long employeeSkillId, SkillRequestDTO request) {

		Employee employee = getLoggedInEmployee();

		EmployeeSkill skill = skillRepository.findById(employeeSkillId)
				.orElseThrow(() -> new ResourceNotFoundException("Skill not found."));

		if (!skill.getEmployee().getEmployeeId().equals(employee.getEmployeeId())) {

			throw new ResourceNotFoundException("Skill not found.");
		}

		Skill masterSkill = skillRepositoryMaster
		        .findById(request.getSkillId())
		        .orElseThrow(() ->
		                new ResourceNotFoundException("Skill not found."));

		skill.setSkill(masterSkill);

		skill.setProficiencyLevel(request.getProficiencyLevel());
		skill.setYearsOfExperience(request.getYearsOfExperience());
		skill.setLastUsed(request.getLastUsed());

		skill = skillRepository.save(skill);

		return buildResponse(skill);
		
	}

	@Override
	public void deleteSkill(Long employeeSkillId) {

		Employee employee = getLoggedInEmployee();

		EmployeeSkill skill = skillRepository.findById(employeeSkillId)
				.orElseThrow(() -> new ResourceNotFoundException("Skill not found."));

		if (!skill.getEmployee().getEmployeeId().equals(employee.getEmployeeId())) {

			throw new ResourceNotFoundException("Skill not found.");
		}

		skillRepository.delete(skill);
	}

	private Employee getLoggedInEmployee() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		String email = authentication.getName();

		return employeeRepository.findByOfficialEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
	}

	private SkillResponseDTO buildResponse(EmployeeSkill skill) {

	    SkillResponseDTO response = new SkillResponseDTO();

	    response.setEmployeeSkillId(
	            skill.getEmployeeSkillId());

	    response.setSkillId(
	            skill.getSkill().getSkillId());

	    response.setEmployeeCode(
	            skill.getEmployee().getEmployeeCode());

	    response.setSkillName(
	            skill.getSkill().getSkillName());

	    response.setSkillCategory(
	            skill.getSkill().getSkillCategory());

	    response.setProficiencyLevel(
	            skill.getProficiencyLevel());

	    response.setYearsOfExperience(
	            skill.getYearsOfExperience());

	    response.setLastUsed(
	            skill.getLastUsed());

	    response.setIsVerified(
	            skill.getIsVerified() != null ? skill.getIsVerified() : false);

	    return response;
	}
}