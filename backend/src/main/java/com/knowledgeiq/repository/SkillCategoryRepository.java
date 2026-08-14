package com.knowledgeiq.repository;

import com.knowledgeiq.model.SkillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillCategoryRepository extends JpaRepository<SkillCategory, UUID> {
    Optional<SkillCategory> findByName(String name);
}
