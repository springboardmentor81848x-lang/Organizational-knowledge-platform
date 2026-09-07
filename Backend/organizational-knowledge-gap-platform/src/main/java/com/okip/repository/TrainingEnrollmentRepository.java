package com.okip.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Employee;
import com.okip.entity.master.Training;
import com.okip.entity.transaction.TrainingEnrollment;

public interface TrainingEnrollmentRepository
        extends JpaRepository<TrainingEnrollment, Long> {

    boolean existsByEmployeeAndTraining(
            Employee employee,
            Training training);

    List<TrainingEnrollment> findByEmployee(
            Employee employee);

    Optional<TrainingEnrollment> findByEnrollmentIdAndEmployee(
            Long enrollmentId,
            Employee employee);
}