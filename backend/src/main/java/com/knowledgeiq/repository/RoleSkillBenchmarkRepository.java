package com.knowledgeiq.repository;

import com.knowledgeiq.model.RoleSkillBenchmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleSkillBenchmarkRepository extends JpaRepository<RoleSkillBenchmark, UUID> {
    @Query("SELECT b FROM RoleSkillBenchmark b JOIN FETCH b.skill WHERE b.role.id = :roleId")
    List<RoleSkillBenchmark> findByRoleId(@Param("roleId") UUID roleId);

    @Query("SELECT b FROM RoleSkillBenchmark b JOIN FETCH b.skill JOIN FETCH b.role r WHERE r.department.id = :deptId")
    List<RoleSkillBenchmark> findByDepartmentId(@Param("deptId") UUID deptId);

    Optional<RoleSkillBenchmark> findByRoleIdAndSkillId(UUID roleId, UUID skillId);
}

