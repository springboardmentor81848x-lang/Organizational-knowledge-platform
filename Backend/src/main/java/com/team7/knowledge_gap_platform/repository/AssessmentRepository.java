package com.team7.knowledge_gap_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.Assessment;

public interface AssessmentRepository
        extends JpaRepository<Assessment, Long> {
}