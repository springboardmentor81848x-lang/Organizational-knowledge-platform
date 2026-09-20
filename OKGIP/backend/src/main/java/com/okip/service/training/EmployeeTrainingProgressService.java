package com.okip.service.training;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.training.EmployeeTrainingProgressDTO;
import com.okip.dto.training.TrainingModuleResponseDTO;
import com.okip.dto.training.TrainingResourceResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Training;
import com.okip.entity.master.TrainingModule;
import com.okip.entity.master.TrainingResource;
import com.okip.entity.transaction.EmployeeTraining;
import com.okip.entity.transaction.EmployeeTrainingModuleProgress;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeTrainingModuleProgressRepository;
import com.okip.repository.EmployeeTrainingRepository;
import com.okip.repository.TrainingModuleRepository;
import com.okip.repository.TrainingRepository;
import com.okip.repository.TrainingResourceRepository;
import com.okip.service.notification.NotificationService;

@Service
@Transactional
public class EmployeeTrainingProgressService {

    private final EmployeeTrainingRepository employeeTrainingRepository;
    private final EmployeeTrainingModuleProgressRepository moduleProgressRepository;
    private final EmployeeRepository employeeRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingModuleRepository moduleRepository;
    private final TrainingResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public EmployeeTrainingProgressService(
            EmployeeTrainingRepository employeeTrainingRepository,
            EmployeeTrainingModuleProgressRepository moduleProgressRepository,
            EmployeeRepository employeeRepository,
            TrainingRepository trainingRepository,
            TrainingModuleRepository moduleRepository,
            TrainingResourceRepository resourceRepository,
            NotificationService notificationService) {
        this.employeeTrainingRepository = employeeTrainingRepository;
        this.moduleProgressRepository = moduleProgressRepository;
        this.employeeRepository = employeeRepository;
        this.trainingRepository = trainingRepository;
        this.moduleRepository = moduleRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<EmployeeTrainingProgressDTO> getMyProgress() {
        Employee employee = getLoggedInEmployee();
        return employeeTrainingRepository
                .findByEmployeeEmployeeIdOrderByEnrolledAtDesc(employee.getEmployeeId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public EmployeeTrainingProgressDTO enroll(Long trainingId) {
        Employee employee = getLoggedInEmployee();
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found."));

        if (employeeTrainingRepository.findByEmployeeEmployeeIdAndTrainingTrainingId(
                employee.getEmployeeId(), trainingId).isPresent()) {
            throw new ResourceAlreadyExistsException("Employee is already enrolled in this training.");
        }

        EmployeeTraining value = new EmployeeTraining();
        value.setEmployee(employee);
        value.setTraining(training);
        value.setStatus(EmployeeTraining.Status.NOT_STARTED);
        value.setProgressPercentage(0.0);
        value.setHoursSpent(0.0);
        value.setEnrolledAt(LocalDateTime.now());
        EmployeeTraining saved = employeeTrainingRepository.save(value);
        notificationService.notifyEmployee(employee.getEmployeeId(), "TRAINING_ASSIGNED", "Training Assigned", training.getTrainingName() + " has been assigned to you.", "/employee/training");
        return toDto(saved);
    }

    /** Starts the training and automatically enrolls the employee if necessary. */
    public EmployeeTrainingProgressDTO start(Long trainingId) {
        Employee employee = getLoggedInEmployee();
        EmployeeTraining value = employeeTrainingRepository
                .findByEmployeeEmployeeIdAndTrainingTrainingId(employee.getEmployeeId(), trainingId)
                .orElseGet(() -> createEnrollment(employee, trainingId));

        if (value.getStatus() == EmployeeTraining.Status.COMPLETED) return toDto(value);

        LocalDateTime now = LocalDateTime.now();
        if (value.getStartedAt() == null) value.setStartedAt(now);
        value.setLastActivityAt(now);
        value.setStatus(EmployeeTraining.Status.IN_PROGRESS);
        recalculate(value);
        return toDto(employeeTrainingRepository.save(value));
    }

    public EmployeeTrainingProgressDTO heartbeat(Long trainingId) {
        Employee employee = getLoggedInEmployee();
        EmployeeTraining value = employeeTrainingRepository
                .findByEmployeeEmployeeIdAndTrainingTrainingId(employee.getEmployeeId(), trainingId)
                .orElseThrow(() -> new ResourceNotFoundException("You are not enrolled in this training."));

        if (value.getStatus() == EmployeeTraining.Status.COMPLETED) return toDto(value);

        LocalDateTime now = LocalDateTime.now();
        if (value.getStartedAt() == null) value.setStartedAt(now);

        if (value.getLastActivityAt() != null) {
            long seconds = Duration.between(value.getLastActivityAt(), now).getSeconds();
            if (seconds > 0 && seconds <= 120) {
                value.setHoursSpent(value.getHoursSpent() + (seconds / 3600.0));
            }
        }
        value.setLastActivityAt(now);
        value.setStatus(EmployeeTraining.Status.IN_PROGRESS);
        recalculate(value);
        return toDto(employeeTrainingRepository.save(value));
    }

    @Transactional(readOnly = true)
    public List<TrainingModuleResponseDTO> getTrainingContent(Long trainingId) {
        Employee employee = getLoggedInEmployee();
        EmployeeTraining enrollment = employeeTrainingRepository
                .findByEmployeeEmployeeIdAndTrainingTrainingId(employee.getEmployeeId(), trainingId)
                .orElse(null);

        return moduleRepository.findByTrainingTrainingIdOrderByModuleOrderAsc(trainingId)
                .stream().map(module -> toModuleDto(module, enrollment)).collect(Collectors.toList());
    }

    public EmployeeTrainingProgressDTO completeModule(Long trainingId, Long moduleId) {
        Employee employee = getLoggedInEmployee();
        EmployeeTraining enrollment = employeeTrainingRepository
                .findByEmployeeEmployeeIdAndTrainingTrainingId(employee.getEmployeeId(), trainingId)
                .orElseThrow(() -> new ResourceNotFoundException("Start this training before completing a module."));

        TrainingModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Training module not found."));

        if (!module.getTraining().getTrainingId().equals(trainingId)) {
            throw new ResourceNotFoundException("Training module does not belong to this training.");
        }

        EmployeeTrainingModuleProgress progress = moduleProgressRepository
                .findByEmployeeTrainingEmployeeTrainingIdAndModuleModuleId(
                        enrollment.getEmployeeTrainingId(), moduleId)
                .orElseGet(() -> {
                    EmployeeTrainingModuleProgress p = new EmployeeTrainingModuleProgress();
                    p.setEmployeeTraining(enrollment);
                    p.setModule(module);
                    return p;
                });

        if (!progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            moduleProgressRepository.save(progress);
        }

        recalculate(enrollment);
        return toDto(employeeTrainingRepository.save(enrollment));
    }

    private EmployeeTraining createEnrollment(Employee employee, Long trainingId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResourceNotFoundException("Training not found."));
        EmployeeTraining value = new EmployeeTraining();
        value.setEmployee(employee);
        value.setTraining(training);
        value.setStatus(EmployeeTraining.Status.NOT_STARTED);
        value.setProgressPercentage(0.0);
        value.setHoursSpent(0.0);
        value.setEnrolledAt(LocalDateTime.now());
        return employeeTrainingRepository.save(value);
    }

    private void recalculate(EmployeeTraining value) {
        long total = moduleRepository.findByTrainingTrainingIdOrderByModuleOrderAsc(
                value.getTraining().getTrainingId()).size();
        long completed = moduleProgressRepository.findByEmployeeTrainingEmployeeTrainingId(
                value.getEmployeeTrainingId()).stream().filter(EmployeeTrainingModuleProgress::isCompleted).count();

        double progress = total == 0 ? 0.0 : Math.min(100.0, (completed * 100.0) / total);
        value.setProgressPercentage(Math.round(progress * 100.0) / 100.0);

        if (total > 0 && completed == total) {
            value.setProgressPercentage(100.0);
            value.setStatus(EmployeeTraining.Status.COMPLETED);
            if (value.getCompletedAt() == null) value.setCompletedAt(LocalDateTime.now());
        } else if (value.getStartedAt() != null) {
            value.setStatus(EmployeeTraining.Status.IN_PROGRESS);
            value.setCompletedAt(null);
        } else {
            value.setStatus(EmployeeTraining.Status.NOT_STARTED);
        }
    }

    private Employee getLoggedInEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResourceNotFoundException("Authenticated employee not found.");
        }
        return employeeRepository.findByOfficialEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
    }

    private TrainingModuleResponseDTO toModuleDto(TrainingModule module, EmployeeTraining enrollment) {
        TrainingModuleResponseDTO dto = new TrainingModuleResponseDTO();
        dto.setModuleId(module.getModuleId());
        dto.setTrainingId(module.getTraining().getTrainingId());
        dto.setModuleTitle(module.getModuleTitle());
        dto.setDescription(module.getDescription());
        dto.setModuleOrder(module.getModuleOrder());
        dto.setEstimatedMinutes(module.getEstimatedMinutes());
        dto.setResources(resourceRepository.findByModuleModuleIdOrderByResourceOrderAsc(module.getModuleId())
                .stream().map(this::toResourceDto).collect(Collectors.toList()));

        if (enrollment != null) {
            moduleProgressRepository.findByEmployeeTrainingEmployeeTrainingIdAndModuleModuleId(
                    enrollment.getEmployeeTrainingId(), module.getModuleId()).ifPresent(p -> {
                        dto.setCompleted(p.isCompleted());
                        dto.setCompletedAt(p.getCompletedAt());
                    });
        }
        return dto;
    }

    private TrainingResourceResponseDTO toResourceDto(TrainingResource resource) {
        TrainingResourceResponseDTO dto = new TrainingResourceResponseDTO();
        dto.setResourceId(resource.getResourceId());
        dto.setTitle(resource.getTitle());
        dto.setResourceType(resource.getResourceType().name());
        dto.setResourceUrl(resource.getResourceUrl());
        dto.setDescription(resource.getDescription());
        dto.setResourceOrder(resource.getResourceOrder());
        return dto;
    }

    private EmployeeTrainingProgressDTO toDto(EmployeeTraining value) {
        EmployeeTrainingProgressDTO dto = new EmployeeTrainingProgressDTO();
        dto.setEmployeeTrainingId(value.getEmployeeTrainingId());
        dto.setTrainingId(value.getTraining().getTrainingId());
        dto.setTrainingName(value.getTraining().getTrainingName());
        dto.setProvider(value.getTraining().getProvider());
        dto.setDuration(value.getTraining().getDuration());
        dto.setCourseUrl(value.getTraining().getCourseUrl());
        dto.setStatus(value.getStatus().name());
        dto.setProgressPercentage(value.getProgressPercentage());
        dto.setHoursSpent(value.getHoursSpent());
        dto.setEnrolledAt(toString(value.getEnrolledAt()));
        dto.setStartedAt(toString(value.getStartedAt()));
        dto.setLastActivityAt(toString(value.getLastActivityAt()));
        dto.setCompletedAt(toString(value.getCompletedAt()));
        return dto;
    }

    private String toString(LocalDateTime value) { return value == null ? null : value.toString(); }
}
