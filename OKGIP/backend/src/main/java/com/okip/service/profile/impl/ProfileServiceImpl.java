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

    public ProfileServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeProfileRepository profileRepository) {

        this.employeeRepository = employeeRepository;
        this.profileRepository = profileRepository;
    }

    // =========================================================
    // CREATE PROFILE
    // =========================================================

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

        profile = profileRepository.save(profile);

        return buildResponse(employee, profile);
    }

    // =========================================================
    // GET LOGGED-IN PROFILE
    // =========================================================

    @Override
    public EmployeeProfileResponseDTO getMyProfile() {

        Employee employee = getLoggedInEmployee();

        Optional<EmployeeProfile> optionalProfile =
                profileRepository.findByEmployee(employee);

        /*
         * IMPORTANT:
         *
         * A Manager/Employee account can exist without an
         * EmployeeProfile record.
         *
         * The frontend still needs the employeeId in order
         * to continue authentication and load the dashboard.
         *
         * Therefore, when the profile does not exist, return
         * the employee information with empty profile fields
         * instead of returning HTTP 404.
         */

        if (optionalProfile.isEmpty()) {

            System.out.println(
                    "PROFILE: No profile found for employee "
                    + employee.getEmployeeCode()
                    + ". Returning employee information."
            );

            return buildResponse(employee, null);
        }

        return buildResponse(
                employee,
                optionalProfile.get());
    }

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    @Override
    public EmployeeProfileResponseDTO updateProfile(
            EmployeeProfileRequestDTO request) {

        Employee employee = getLoggedInEmployee();

        // PUT is idempotent for the logged-in employee. If a profile
        // does not exist yet, create it instead of forcing the frontend
        // to decide between POST and PUT. This also handles accounts
        // created before employee_profiles was populated.
        EmployeeProfile profile =
                profileRepository.findByEmployee(employee)
                .orElseGet(() -> {
                    EmployeeProfile created = new EmployeeProfile();
                    created.setEmployee(employee);
                    return created;
                });

        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setCountry(request.getCountry());
        profile.setPincode(request.getPincode());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());

        profile = profileRepository.save(profile);

        return buildResponse(employee, profile);
    }

    // =========================================================
    // GET LOGGED-IN EMPLOYEE
    // =========================================================

    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()) {

            throw new ResourceNotFoundException(
                    "Authenticated employee not found.");
        }

        String email = authentication.getName();

        return employeeRepository
                .findByOfficialEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."));
    }

    // =========================================================
    // BUILD RESPONSE
    // =========================================================

    private EmployeeProfileResponseDTO buildResponse(
            Employee employee,
            EmployeeProfile profile) {

        EmployeeProfileResponseDTO response =
                new EmployeeProfileResponseDTO();

        // -----------------------------------------------------
        // Employee information always comes from Employee table
        // -----------------------------------------------------

        response.setEmployeeId(
                employee.getEmployeeId());

        response.setEmployeeCode(
                employee.getEmployeeCode());

        String firstName =
                employee.getFirstName() == null
                        ? ""
                        : employee.getFirstName();

        String lastName =
                employee.getLastName() == null
                        ? ""
                        : employee.getLastName();

        response.setEmployeeName(
                (firstName + " " + lastName).trim());

        // -----------------------------------------------------
        // Profile information
        //
        // Profile may not exist yet.
        // In that case return null values instead of failing.
        // -----------------------------------------------------

        if (profile != null) {

            response.setPhoneNumber(
                    profile.getPhoneNumber());

            response.setAddress(
                    profile.getAddress());

            response.setCity(
                    profile.getCity());

            response.setState(
                    profile.getState());

            response.setCountry(
                    profile.getCountry());

            response.setPincode(
                    profile.getPincode());

            response.setDateOfBirth(
                    profile.getDateOfBirth());

            response.setGender(
                    profile.getGender());

        } else {

            response.setPhoneNumber(null);
            response.setAddress(null);
            response.setCity(null);
            response.setState(null);
            response.setCountry(null);
            response.setPincode(null);
            response.setDateOfBirth(null);
            response.setGender(null);
        }

        return response;
    }
}