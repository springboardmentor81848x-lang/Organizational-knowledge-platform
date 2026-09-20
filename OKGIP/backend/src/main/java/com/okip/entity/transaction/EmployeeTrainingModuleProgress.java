package com.okip.entity.transaction;

import java.time.LocalDateTime;
import com.okip.entity.master.TrainingModule;
import jakarta.persistence.*;

@Entity
@Table(name = "employee_training_module_progress", uniqueConstraints = @UniqueConstraint(columnNames = {"employee_training_id", "module_id"}))
public class EmployeeTrainingModuleProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "module_progress_id")
    private Long moduleProgressId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_training_id", nullable = false)
    private EmployeeTraining employeeTraining;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private TrainingModule module;

    @Column(name = "completed", nullable = false)
    private boolean completed;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public Long getModuleProgressId() { return moduleProgressId; }
    public void setModuleProgressId(Long moduleProgressId) { this.moduleProgressId = moduleProgressId; }
    public EmployeeTraining getEmployeeTraining() { return employeeTraining; }
    public void setEmployeeTraining(EmployeeTraining employeeTraining) { this.employeeTraining = employeeTraining; }
    public TrainingModule getModule() { return module; }
    public void setModule(TrainingModule module) { this.module = module; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
