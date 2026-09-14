package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.EmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {
    List<EmployeeSkill> findByEmployeeEmail(String email);
}
