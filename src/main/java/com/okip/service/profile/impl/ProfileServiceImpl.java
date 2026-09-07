package com.okip.service.profile.impl;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.okip.dto.profile.EmployeeProfileRequestDTO;
import com.okip.dto.profile.EmployeeProfileResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.EmployeeProfile;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeProfileRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.service.profile.ProfileService;

@Service
public class ProfileServiceImpl implements ProfileService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeProfileRepository profileRepository;

    public ProfileServiceImpl(EmployeeRepository employeeRepository,
                              EmployeeProfileRepository profileRepository) {

        this.employeeRepository = employeeRepository;
        this.profileRepository = profileRepository;
    }

    @Override
    public EmployeeProfileResponseDTO createProfile(
            EmployeeProfileRequestDTO request) {

        Employee employee = getLoggedInEmployee();

        Optional<EmployeeProfile> optionalProfile =
                profileRepository.findByEmployee(employee);

        if (optionalProfile.isPresent()) {

            throw new ResourceAlreadyExistsException(
                    "Profile already exists.");
        }

        EmployeeProfile profile = new EmployeeProfile();

        profile.setEmployee(employee);

        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setCountry(request.getCountry());
        profile.setPincode(request.getPincode());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getAvailableAsMentor() != null) profile.setAvailableAsMentor(request.getAvailableAsMentor());

        profile = profileRepository.save(profile);

        return buildResponse(employee, profile);
    }

    @Override
    public EmployeeProfileResponseDTO getMyProfile() {

        Employee employee = getLoggedInEmployee();

        EmployeeProfile profile =
                profileRepository.findByEmployee(employee)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Profile not found."));

        return buildResponse(employee, profile);
    }

    @Override
    public EmployeeProfileResponseDTO updateProfile(
            EmployeeProfileRequestDTO request) {

        Employee employee = getLoggedInEmployee();

        EmployeeProfile profile =
                profileRepository.findByEmployee(employee)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Profile not found."));

        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setCountry(request.getCountry());
        profile.setPincode(request.getPincode());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getAvailableAsMentor() != null) profile.setAvailableAsMentor(request.getAvailableAsMentor());

        profile = profileRepository.save(profile);

        return buildResponse(employee, profile);
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

    private EmployeeProfileResponseDTO buildResponse(
            Employee employee,
            EmployeeProfile profile) {

        EmployeeProfileResponseDTO response =
                new EmployeeProfileResponseDTO();

        response.setEmployeeId(employee.getEmployeeId());
        response.setEmployeeCode(employee.getEmployeeCode());

        response.setEmployeeName(
                employee.getFirstName() + " " +
                employee.getLastName());

        response.setPhoneNumber(profile.getPhoneNumber());
        response.setAddress(profile.getAddress());
        response.setCity(profile.getCity());
        response.setState(profile.getState());
        response.setCountry(profile.getCountry());
        response.setPincode(profile.getPincode());
        response.setDateOfBirth(profile.getDateOfBirth());
        response.setGender(profile.getGender());
        response.setBio(profile.getBio());
        response.setAvailableAsMentor(profile.getAvailableAsMentor() != null ? profile.getAvailableAsMentor() : true);

        return response;
    }
}