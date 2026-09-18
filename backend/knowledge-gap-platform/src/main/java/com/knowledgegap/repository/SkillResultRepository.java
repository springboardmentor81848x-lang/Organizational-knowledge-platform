package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.SkillResult;

public interface SkillResultRepository
        extends JpaRepository<SkillResult, Long> {

    List<SkillResult> findByAttemptId(Long attemptId);
}