package com.okip.service.enrollment.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.okip.dto.enrollment.TrainingEnrollmentRequestDTO;
import com.okip.dto.enrollment.TrainingEnrollmentResponseDTO;
import com.okip.dto.enrollment.TrainingProgressRequestDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Training;
import com.okip.entity.transaction.TrainingEnrollment;
import com.okip.enums.NotificationType;
import com.okip.enums.TrainingStatus;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.TrainingEnrollmentRepository;
import com.okip.repository.TrainingRepository;
import com.okip.service.enrollment.TrainingEnrollmentService;
import com.okip.service.notification.NotificationService;

@Service
public class TrainingEnrollmentServiceImpl
        implements TrainingEnrollmentService {

    private final TrainingEnrollmentRepository enrollmentRepository;
    private final EmployeeRepository employeeRepository;
    private final TrainingRepository trainingRepository;
    private final NotificationService notificationService;

    public TrainingEnrollmentServiceImpl(
            TrainingEnrollmentRepository enrollmentRepository,
            EmployeeRepository employeeRepository,
            TrainingRepository trainingRepository,
            NotificationService notificationService) {

        this.enrollmentRepository = enrollmentRepository;
        this.employeeRepository = employeeRepository;
        this.trainingRepository = trainingRepository;
        this.notificationService = notificationService;
    }

    @Override
    public TrainingEnrollmentResponseDTO enroll(
            TrainingEnrollmentRequestDTO request) {

        Employee employee = getLoggedInEmployee();

        Training training =
                trainingRepository.findById(
                        request.getTrainingId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Training not found."));

        if (enrollmentRepository
                .existsByEmployeeAndTraining(
                        employee,
                        training)) {

            throw new ResourceAlreadyExistsException(
                    "Employee is already enrolled in this training.");
        }

        TrainingEnrollment enrollment =
                new TrainingEnrollment();

        enrollment.setEmployee(employee);
        enrollment.setTraining(training);
        enrollment.setEnrollmentDate(LocalDate.now());
        enrollment.setProgress(0);
        enrollment.setStatus(
                TrainingStatus.NOT_STARTED);

        TrainingEnrollment saved =
                enrollmentRepository.save(enrollment);

        notificationService.createNotification(
                employee,
                "Enrolled in Training",
                "You have successfully enrolled in " + training.getTrainingName(),
                NotificationType.TRAINING,
                training.getTrainingId()
        );

        return convertToResponse(saved);
    }

    @Override
    public List<TrainingEnrollmentResponseDTO>
            getMyEnrollments() {

        Employee employee = getLoggedInEmployee();

        return enrollmentRepository
                .findByEmployee(employee)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TrainingEnrollmentResponseDTO updateProgress(
            Long enrollmentId,
            TrainingProgressRequestDTO request) {

        Employee employee = getLoggedInEmployee();

        TrainingEnrollment enrollment =
                enrollmentRepository
                        .findByEnrollmentIdAndEmployee(
                                enrollmentId,
                                employee)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Training enrollment not found."));

        Integer progress = request.getProgress();
        if (progress > 100) progress = 100;
        if (progress < 0) progress = 0;

        enrollment.setProgress(progress);

        if (progress == 0) {
            enrollment.setStatus(
                    TrainingStatus.NOT_STARTED);

        } else if (progress < 100) {
            enrollment.setStatus(
                    TrainingStatus.IN_PROGRESS);

            if (enrollment.getStartDate() == null) {
                enrollment.setStartDate(
                        LocalDate.now());
            }

        } else {
            enrollment.setStatus(
                    TrainingStatus.COMPLETED);

            if (enrollment.getStartDate() == null) {
                enrollment.setStartDate(
                        LocalDate.now());
            }

            enrollment.setCompletionDate(
                    LocalDate.now());

            notificationService.createNotification(
                    employee,
                    "Training Completed! 🎓",
                    "Congratulations! You completed the training: " + enrollment.getTraining().getTrainingName(),
                    NotificationType.TRAINING,
                    enrollment.getTraining().getTrainingId()
            );
        }

        TrainingEnrollment updated =
                enrollmentRepository.save(enrollment);

        return convertToResponse(updated);
    }

    @Override
    public List<TrainingEnrollmentResponseDTO> getAllEnrollments() {
        return enrollmentRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrainingEnrollmentResponseDTO> getEmployeeEnrollments(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
        return enrollmentRepository.findByEmployee(employee)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrainingEnrollmentResponseDTO> getTeamEnrollments() {
        Employee loggedIn = getLoggedInEmployee();
        if (loggedIn.getDepartment() == null) {
            return getAllEnrollments();
        }
        return enrollmentRepository.findAll().stream()
                .filter(te -> te.getEmployee().getDepartment() != null &&
                              te.getEmployee().getDepartment().getDepartmentId().equals(loggedIn.getDepartment().getDepartmentId()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                authentication.getName();

        return employeeRepository
                .findByOfficialEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Logged-in employee not found."));
    }

    private TrainingEnrollmentResponseDTO
            convertToResponse(
                    TrainingEnrollment enrollment) {

        TrainingEnrollmentResponseDTO response =
                new TrainingEnrollmentResponseDTO();

        response.setEnrollmentId(
                enrollment.getEnrollmentId());

        response.setEmployeeId(
                enrollment.getEmployee()
                        .getEmployeeId());

        response.setTrainingId(
                enrollment.getTraining()
                        .getTrainingId());

        response.setTrainingName(
                enrollment.getTraining()
                        .getTrainingName());

        response.setProvider(
                enrollment.getTraining()
                        .getProvider());

        response.setDuration(
                enrollment.getTraining()
                        .getDuration());

        response.setLevel(
                enrollment.getTraining()
                        .getLevel());

        response.setCourseUrl(
                enrollment.getTraining()
                        .getCourseUrl());

        response.setEnrollmentDate(
                enrollment.getEnrollmentDate());

        response.setStartDate(
                enrollment.getStartDate());

        response.setCompletionDate(
                enrollment.getCompletionDate());

        response.setExpectedCompletionDate(
                enrollment.getExpectedCompletionDate());

        response.setProgress(
                enrollment.getProgress());

        response.setStatus(
                enrollment.getStatus()
                        .name());

        return response;
    }
}
