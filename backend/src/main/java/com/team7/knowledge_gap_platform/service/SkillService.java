package com.team7.knowledge_gap_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.Skill;
import com.team7.knowledge_gap_platform.repository.SkillRepository;

@Service
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    public Skill saveSkill(Skill skill) {
        return skillRepository.save(skill);
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public Optional<Skill> getSkillById(Long id) {
        return skillRepository.findById(id);
    }

    public Skill updateSkill(Long id, Skill skill) {
        Skill existingSkill = skillRepository.findById(id).orElseThrow();

        existingSkill.setSkillName(skill.getSkillName());
        existingSkill.setCategory(skill.getCategory());
        existingSkill.setLevel(skill.getLevel());
        existingSkill.setDescription(skill.getDescription());

        return skillRepository.save(existingSkill);
    }

    public void deleteSkill(Long id) {
        skillRepository.deleteById(id);
    }
}