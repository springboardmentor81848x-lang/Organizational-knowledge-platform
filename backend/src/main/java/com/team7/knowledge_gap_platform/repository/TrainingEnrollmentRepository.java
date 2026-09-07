package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.TrainingEnrollment;

@Repository
public interface TrainingEnrollmentRepository extends JpaRepository<TrainingEnrollment, Long> {
    List<TrainingEnrollment> findByEmployeeId(Long employeeId);
}
