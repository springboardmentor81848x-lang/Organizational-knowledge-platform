package com.okip.service.experience.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.okip.dto.experience.AddExperienceRequestDTO;
import com.okip.dto.experience.ExperienceResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.Experience;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.ExperienceRepository;
import com.okip.service.experience.ExperienceService;

@Service
public class ExperienceServiceImpl
        implements ExperienceService {

    private final EmployeeRepository employeeRepository;
    private final ExperienceRepository experienceRepository;

    public ExperienceServiceImpl(
            EmployeeRepository employeeRepository,
            ExperienceRepository experienceRepository) {

        this.employeeRepository = employeeRepository;
        this.experienceRepository = experienceRepository;
    }

    @Override
    public ExperienceResponseDTO addExperience(
            AddExperienceRequestDTO request) {

        Employee employee = getLoggedInEmployee();

        Experience experience = new Experience();

        experience.setEmployee(employee);
        experience.setCompanyName(request.getCompanyName());
        experience.setDesignation(request.getDesignation());
        experience.setEmploymentType(request.getEmploymentType());
        experience.setStartDate(request.getStartDate());
        experience.setEndDate(request.getEndDate());
        experience.setCurrentlyWorking(request.getCurrentlyWorking());
        experience.setYearsOfExperience(request.getYearsOfExperience());
        experience.setJobDescription(request.getJobDescription());

        experience = experienceRepository.save(experience);

        return buildResponse(experience);
    }

    @Override
    public List<ExperienceResponseDTO> getMyExperiences() {

        Employee employee = getLoggedInEmployee();

        List<Experience> experiences =
                experienceRepository.findByEmployee(employee);

        List<ExperienceResponseDTO> response =
                new ArrayList<>();

        for (Experience experience : experiences) {

            response.add(buildResponse(experience));
        }

        return response;
    }

    @Override
    public ExperienceResponseDTO updateExperience(
            Long experienceId,
            AddExperienceRequestDTO request) {

        Employee employee = getLoggedInEmployee();

        Experience experience =
                experienceRepository.findById(experienceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Experience not found."));

        if (!experience.getEmployee()
                .getEmployeeId()
                .equals(employee.getEmployeeId())) {

            throw new ResourceNotFoundException(
                    "Experience not found.");
        }

        experience.setCompanyName(request.getCompanyName());
        experience.setDesignation(request.getDesignation());
        experience.setEmploymentType(request.getEmploymentType());
        experience.setStartDate(request.getStartDate());
        experience.setEndDate(request.getEndDate());
        experience.setCurrentlyWorking(request.getCurrentlyWorking());
        experience.setYearsOfExperience(request.getYearsOfExperience());
        experience.setJobDescription(request.getJobDescription());

        experience = experienceRepository.save(experience);

        return buildResponse(experience);
    }

    @Override
    public void deleteExperience(
            Long experienceId) {

        Employee employee = getLoggedInEmployee();

        Experience experience =
                experienceRepository.findById(experienceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Experience not found."));

        if (!experience.getEmployee()
                .getEmployeeId()
                .equals(employee.getEmployeeId())) {

            throw new ResourceNotFoundException(
                    "Experience not found.");
        }

        experienceRepository.delete(experience);
    }

    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        return employeeRepository
                .findByOfficialEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."));
    }

    private ExperienceResponseDTO buildResponse(
            Experience experience) {

        ExperienceResponseDTO response =
                new ExperienceResponseDTO();

        response.setExperienceId(
                experience.getExperienceId());

        response.setEmployeeCode(
                experience.getEmployee()
                        .getEmployeeCode());

        response.setCompanyName(
                experience.getCompanyName());

        response.setDesignation(
                experience.getDesignation());

        response.setEmploymentType(
                experience.getEmploymentType());

        response.setStartDate(
                experience.getStartDate());

        response.setEndDate(
                experience.getEndDate());

        response.setCurrentlyWorking(
                experience.getCurrentlyWorking());

        response.setYearsOfExperience(
                experience.getYearsOfExperience());

        response.setJobDescription(
                experience.getJobDescription());

        return response;
    }
}