package com.okip.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Skill;

public interface SkillRepository
        extends JpaRepository<Skill, Long> {

    Optional<Skill> findBySkillName(String skillName);
    
    Optional<Skill> findBySkillNameIgnoreCase(
            String skillName);
    

}
