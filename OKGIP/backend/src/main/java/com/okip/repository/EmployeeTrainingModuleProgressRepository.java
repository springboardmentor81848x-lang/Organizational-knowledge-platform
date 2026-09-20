package com.okip.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.okip.entity.transaction.EmployeeTrainingModuleProgress;

public interface EmployeeTrainingModuleProgressRepository extends JpaRepository<EmployeeTrainingModuleProgress, Long> {
    List<EmployeeTrainingModuleProgress> findByEmployeeTrainingEmployeeTrainingId(Long employeeTrainingId);
    Optional<EmployeeTrainingModuleProgress> findByEmployeeTrainingEmployeeTrainingIdAndModuleModuleId(Long employeeTrainingId, Long moduleId);
}
