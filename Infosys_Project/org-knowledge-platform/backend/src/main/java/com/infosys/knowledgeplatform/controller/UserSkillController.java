package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.UserSkill;
import com.infosys.knowledgeplatform.repository.UserSkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-skills")
@CrossOrigin(origins = "http://localhost:5173")
public class UserSkillController {

    @Autowired
    private UserSkillRepository userSkillRepository;

    @GetMapping
    public List<UserSkill> getAllUserSkills() {
        return userSkillRepository.findAll();
    }

    @GetMapping("/{id}")
    public UserSkill getUserSkillById(@PathVariable Long id) {
        return userSkillRepository.findById(id).orElse(null);
    }

    @PostMapping
    public UserSkill createUserSkill(@RequestBody UserSkill userSkill) {
        return userSkillRepository.save(userSkill);
    }

    @PutMapping("/{id}")
    public UserSkill updateUserSkill(@PathVariable Long id, @RequestBody UserSkill userSkillDetails) {
        UserSkill userSkill = userSkillRepository.findById(id).orElse(null);
        if (userSkill != null) {
            userSkill.setProficiencyLevel(userSkillDetails.getProficiencyLevel());
            userSkill.setRequiredLevel(userSkillDetails.getRequiredLevel());
            if (userSkillDetails.getUser() != null) userSkill.setUser(userSkillDetails.getUser());
            if (userSkillDetails.getSkill() != null) userSkill.setSkill(userSkillDetails.getSkill());
            return userSkillRepository.save(userSkill);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteUserSkill(@PathVariable Long id) {
        userSkillRepository.deleteById(id);
    }
}
