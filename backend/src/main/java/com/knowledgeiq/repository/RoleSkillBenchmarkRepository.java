package com.knowledgeiq.repository;

import com.knowledgeiq.model.RoleSkillBenchmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleSkillBenchmarkRepository extends JpaRepository<RoleSkillBenchmark, UUID> {
    List<RoleSkillBenchmark> findByRoleId(UUID roleId);
    Optional<RoleSkillBenchmark> findByRoleIdAndSkillId(UUID roleId, UUID skillId);
}
