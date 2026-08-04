package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.Skill;
import com.infosys.knowledgeplatform.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "http://localhost:5173")
public class SkillController {

    @Autowired
    private SkillRepository skillRepository;

    @GetMapping
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    @GetMapping("/{id}")
    public Skill getSkillById(@PathVariable Long id) {
        return skillRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Skill createSkill(@RequestBody Skill skill) {
        return skillRepository.save(skill);
    }

    @PutMapping("/{id}")
    public Skill updateSkill(@PathVariable Long id, @RequestBody Skill skillDetails) {
        Skill skill = skillRepository.findById(id).orElse(null);
        if (skill != null) {
            skill.setName(skillDetails.getName());
            skill.setCategory(skillDetails.getCategory());
            skill.setDescription(skillDetails.getDescription());
            return skillRepository.save(skill);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteSkill(@PathVariable Long id) {
        skillRepository.deleteById(id);
    }
}
