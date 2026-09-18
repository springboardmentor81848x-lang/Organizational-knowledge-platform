package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByNameIgnoreCase(String name);

    List<Skill> findByCategoryIgnoreCase(String category);

    boolean existsByNameIgnoreCase(String name);
}
