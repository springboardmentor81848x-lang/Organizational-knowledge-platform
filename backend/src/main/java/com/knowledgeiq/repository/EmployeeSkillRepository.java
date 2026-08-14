package com.knowledgeiq.repository;

import com.knowledgeiq.model.EmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, UUID> {
    List<EmployeeSkill> findByUserId(UUID userId);
    Optional<EmployeeSkill> findByUserIdAndSkillId(UUID userId, UUID skillId);
}
