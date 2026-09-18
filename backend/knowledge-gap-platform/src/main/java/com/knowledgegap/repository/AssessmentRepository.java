package com.knowledgegap.repository;

import com.knowledgegap.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository
        extends JpaRepository<Assessment, Long> {

    List<Assessment> findByActiveTrue();

    Optional<Assessment> findByAssessmentRoleIdAndActiveTrue(
            Long assessmentRoleId
    );
}