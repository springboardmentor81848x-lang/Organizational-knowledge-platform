package com.knowledgegap.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.knowledgegap.dto.RoleSkillResponse;
import com.knowledgegap.entity.RoleSkill;
import com.knowledgegap.repository.RoleSkillRepository;

@Service
public class RoleSkillService {

    private final RoleSkillRepository roleSkillRepository;

    public RoleSkillService(
            RoleSkillRepository roleSkillRepository) {

        this.roleSkillRepository = roleSkillRepository;
    }

    public List<RoleSkillResponse> getSkillsForRole(
            Long roleId) {

        List<RoleSkill> roleSkills =
                roleSkillRepository.findByRoleId(roleId);

        return roleSkills.stream()
                .map(roleSkill -> {

                    var skill = roleSkill.getSkill();

                    return new RoleSkillResponse(
                            skill.getId(),
                            skill.getSkillName(),
                            skill.getCategory(),
                            skill.getDescription(),
                            roleSkill.getRequiredLevel()
                    );
                })
                .collect(Collectors.toList());
    }
}