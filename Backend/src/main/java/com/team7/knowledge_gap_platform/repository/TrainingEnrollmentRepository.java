package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.TrainingEnrollment;

public interface TrainingEnrollmentRepository
        extends JpaRepository<TrainingEnrollment, Long> {

    List<TrainingEnrollment> findByEmployeeId(Long employeeId);

    List<TrainingEnrollment> findByTrainingId(Long trainingId);

    List<TrainingEnrollment> findByEmployeeIdAndStatus(
            Long employeeId,
            String status);
}