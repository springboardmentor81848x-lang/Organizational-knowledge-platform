package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.entity.SelfAssessment;

public interface SelfAssessmentRepository
        extends JpaRepository<SelfAssessment, Long> {

    List<SelfAssessment> findByEmployeeOrderByAssessedAtDesc(
            Employee employee
    );

    Optional<SelfAssessment> findByEmployeeAndSkill(
            Employee employee,
            Skill skill
    );
}