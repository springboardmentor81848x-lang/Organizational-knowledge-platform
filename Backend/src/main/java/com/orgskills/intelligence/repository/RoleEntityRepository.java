package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleEntityRepository extends JpaRepository<RoleEntity, Long> {
    Optional<RoleEntity> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
