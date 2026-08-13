package com.knowledgegap.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Assessment;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    Optional<Assessment> findFirstByActiveTrueOrderByIdDesc();
}
