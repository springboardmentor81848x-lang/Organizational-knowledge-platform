package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
}
