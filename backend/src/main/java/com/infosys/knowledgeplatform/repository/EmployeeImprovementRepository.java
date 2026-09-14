package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.EmployeeImprovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeImprovementRepository extends JpaRepository<EmployeeImprovement, Long> {
    Optional<EmployeeImprovement> findByEmployeeEmail(String employeeEmail);
}