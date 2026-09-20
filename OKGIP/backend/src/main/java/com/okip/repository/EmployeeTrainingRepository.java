package com.okip.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.transaction.EmployeeTraining;

public interface EmployeeTrainingRepository extends JpaRepository<EmployeeTraining, Long> {

    Optional<EmployeeTraining> findByEmployeeEmployeeIdAndTrainingTrainingId(
            Long employeeId,
            Long trainingId);

    List<EmployeeTraining> findByEmployeeEmployeeIdOrderByEnrolledAtDesc(
            Long employeeId);
}
