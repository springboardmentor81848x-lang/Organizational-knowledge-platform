package com.knowledgeiq.repository;

import com.knowledgeiq.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {
    List<Skill> findByCategoryId(UUID categoryId);
    Optional<Skill> findByName(String name);
    List<Skill> findAllByName(String name);
}
