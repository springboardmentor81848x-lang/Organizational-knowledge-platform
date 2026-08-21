package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.Skill;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByName(String name);

    @Override
    @Cacheable("catalogs:skills")
    List<Skill> findAll();
}
