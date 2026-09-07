package com.okip.service.education.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.okip.dto.education.AddEducationRequestDTO;
import com.okip.dto.education.EducationResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.Education;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EducationRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.service.education.EducationService;

@Service
public class EducationServiceImpl implements EducationService {

    private final EmployeeRepository employeeRepository;
    private final EducationRepository educationRepository;

    public EducationServiceImpl(
            EmployeeRepository employeeRepository,
            EducationRepository educationRepository) {

        this.employeeRepository = employeeRepository;
        this.educationRepository = educationRepository;
    }

    @Override
    public EducationResponseDTO addEducation(
            AddEducationRequestDTO request) {

        Employee employee = getLoggedInEmployee();

        Education education = new Education();

        education.setEmployee(employee);
        education.setDegree(request.getDegree());
        education.setSpecialization(request.getSpecialization());
        education.setInstitution(request.getInstitution());
        education.setUniversity(request.getUniversity());
        education.setCgpaOrPercentage(request.getCgpaOrPercentage());
        education.setStartYear(request.getStartYear());
        education.setEndYear(request.getEndYear());

        education = educationRepository.save(education);

        return buildResponse(education);
    }

    @Override
    public List<EducationResponseDTO> getMyEducation() {

        Employee employee = getLoggedInEmployee();

        List<Education> educations =
                educationRepository.findByEmployee(employee);

        List<EducationResponseDTO> response =
                new ArrayList<>();

        for (Education education : educations) {

            response.add(buildResponse(education));
        }

        return response;
    }

    @Override
    public EducationResponseDTO updateEducation(
            Long educationId,
            AddEducationRequestDTO request) {

        Employee employee = getLoggedInEmployee();

        Education education =
                educationRepository.findById(educationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Education not found."));

        if (!education.getEmployee()
                .getEmployeeId()
                .equals(employee.getEmployeeId())) {

            throw new ResourceNotFoundException(
                    "Education not found.");
        }

        education.setDegree(request.getDegree());
        education.setSpecialization(request.getSpecialization());
        education.setInstitution(request.getInstitution());
        education.setUniversity(request.getUniversity());
        education.setCgpaOrPercentage(request.getCgpaOrPercentage());
        education.setStartYear(request.getStartYear());
        education.setEndYear(request.getEndYear());

        education = educationRepository.save(education);

        return buildResponse(education);
    }

    @Override
    public void deleteEducation(Long educationId) {

        Employee employee = getLoggedInEmployee();

        Education education =
                educationRepository.findById(educationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Education not found."));

        if (!education.getEmployee()
                .getEmployeeId()
                .equals(employee.getEmployeeId())) {

            throw new ResourceNotFoundException(
                    "Education not found.");
        }

        educationRepository.delete(education);
    }

  

    private EducationResponseDTO buildResponse(
            Education education) {

        EducationResponseDTO response =
                new EducationResponseDTO();

        response.setEducationId(
                education.getEducationId());

        response.setEmployeeCode(
                education.getEmployee()
                .getEmployeeCode());

        response.setDegree(
                education.getDegree());

        response.setSpecialization(
                education.getSpecialization());

        response.setInstitution(
                education.getInstitution());

        response.setUniversity(
                education.getUniversity());

        response.setCgpaOrPercentage(
                education.getCgpaOrPercentage());

        response.setStartYear(
                education.getStartYear());

        response.setEndYear(
                education.getEndYear());

        return response;
    }

    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                .getAuthentication();

        String email = authentication.getName();

        return employeeRepository
                .findByOfficialEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."));
    }

}