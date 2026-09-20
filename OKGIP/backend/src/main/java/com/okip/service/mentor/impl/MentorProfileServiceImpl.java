package com.okip.service.mentor.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.entity.master.Employee;
import com.okip.entity.master.MentorProfile;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.MentorProfileRepository;
import com.okip.service.mentor.MentorProfileService;

@Service
@Transactional
public class MentorProfileServiceImpl implements MentorProfileService {

    private final MentorProfileRepository mentorProfileRepository;
    private final EmployeeRepository employeeRepository;

    public MentorProfileServiceImpl(
            MentorProfileRepository mentorProfileRepository,
            EmployeeRepository employeeRepository) {

        this.mentorProfileRepository = mentorProfileRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public MentorProfile assignMentor(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."
                        ));

        if (mentorProfileRepository
                .existsByEmployeeEmployeeIdAndActiveTrue(employeeId)) {

            throw new ResourceAlreadyExistsException(
                    "Employee is already assigned as a mentor."
            );
        }

        MentorProfile mentorProfile =
                mentorProfileRepository
                        .findByEmployeeEmployeeId(employeeId)
                        .orElseGet(MentorProfile::new);

        mentorProfile.setEmployee(employee);
        mentorProfile.setActive(true);

        return mentorProfileRepository.save(mentorProfile);
    }

    @Override
    public MentorProfile unassignMentor(Long employeeId) {

        MentorProfile mentorProfile =
                mentorProfileRepository
                        .findByEmployeeEmployeeId(employeeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Mentor profile not found."
                                ));

        mentorProfile.setActive(false);

        return mentorProfileRepository.save(mentorProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorProfile getMentorProfile(Long employeeId) {

        return mentorProfileRepository
                .findByEmployeeEmployeeId(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Mentor profile not found."
                        ));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isActiveMentor(Long employeeId) {

        return mentorProfileRepository
                .existsByEmployeeEmployeeIdAndActiveTrue(employeeId);
    }
}