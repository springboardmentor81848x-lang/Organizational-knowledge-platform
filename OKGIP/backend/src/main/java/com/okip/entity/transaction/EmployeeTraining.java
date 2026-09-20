package com.okip.entity.transaction;

import java.time.LocalDateTime;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Training;
import jakarta.persistence.*;

@Entity
@Table(name = "employee_trainings", uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "training_id"}))
public class EmployeeTraining {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_training_id") private Long employeeTrainingId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "employee_id", nullable = false) private Employee employee;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) @JoinColumn(name = "training_id", nullable = false) private Training training;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status = Status.NOT_STARTED;
    @Column(name = "progress_percentage", nullable = false) private double progressPercentage = 0.0;
    @Column(name = "hours_spent", nullable = false) private double hoursSpent = 0.0;
    @Column(name = "enrolled_at", nullable = false) private LocalDateTime enrolledAt;
    @Column(name = "started_at") private LocalDateTime startedAt;
    @Column(name = "last_activity_at") private LocalDateTime lastActivityAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    public enum Status { NOT_STARTED, IN_PROGRESS, COMPLETED }
    public Long getEmployeeTrainingId(){return employeeTrainingId;} public void setEmployeeTrainingId(Long v){employeeTrainingId=v;}
    public Employee getEmployee(){return employee;} public void setEmployee(Employee v){employee=v;}
    public Training getTraining(){return training;} public void setTraining(Training v){training=v;}
    public Status getStatus(){return status;} public void setStatus(Status v){status=v;}
    public double getProgressPercentage(){return progressPercentage;} public void setProgressPercentage(double v){progressPercentage=v;}
    public double getHoursSpent(){return hoursSpent;} public void setHoursSpent(double v){hoursSpent=v;}
    public LocalDateTime getEnrolledAt(){return enrolledAt;} public void setEnrolledAt(LocalDateTime v){enrolledAt=v;}
    public LocalDateTime getStartedAt(){return startedAt;} public void setStartedAt(LocalDateTime v){startedAt=v;}
    public LocalDateTime getLastActivityAt(){return lastActivityAt;} public void setLastActivityAt(LocalDateTime v){lastActivityAt=v;}
    public LocalDateTime getCompletedAt(){return completedAt;} public void setCompletedAt(LocalDateTime v){completedAt=v;}
}
