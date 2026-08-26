package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.LearningProgressHistory;

public interface LearningProgressHistoryRepository
        extends JpaRepository<LearningProgressHistory, Long> {

    List<LearningProgressHistory>
    findByEmployee_EmployeeIdOrderByRecordedAtAsc(
            String employeeIdentifier
    );

    List<LearningProgressHistory>
    findByEnrollment_IdOrderByRecordedAtAsc(
            Long enrollmentId
    );
}