package com.okip.service.skillmaster.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.okip.dto.skillmaster.CreateSkillRequestDTO;
import com.okip.dto.skillmaster.SkillMasterResponseDTO;
import com.okip.entity.master.Skill;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.SkillRepository;
import com.okip.service.skillmaster.SkillMasterService;

@Service
public class SkillMasterServiceImpl implements SkillMasterService {

    private final SkillRepository skillRepository;

    public SkillMasterServiceImpl(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Override
    public SkillMasterResponseDTO createSkill(
            CreateSkillRequestDTO request) {

        if (skillRepository.findBySkillNameIgnoreCase(
                request.getSkillName()).isPresent()) {

            throw new ResourceAlreadyExistsException(
                    "Skill already exists.");
        }

        Skill skill = new Skill();

        skill.setSkillName(request.getSkillName());
        skill.setSkillCategory(request.getSkillCategory());
        skill.setDescription(request.getDescription());

        skill = skillRepository.save(skill);

        return buildResponse(skill);
    }

    @Override
    public List<SkillMasterResponseDTO> getAllSkills() {

        List<Skill> skills =
                skillRepository.findAll();

        List<SkillMasterResponseDTO> response =
                new ArrayList<>();

        for (Skill skill : skills) {

            response.add(buildResponse(skill));
        }

        return response;
    }

    @Override
    public SkillMasterResponseDTO getSkillById(
            Long skillId) {

        Skill skill =
                skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Skill not found."));

        return buildResponse(skill);
    }

    @Override
    public SkillMasterResponseDTO updateSkill(
            Long skillId,
            CreateSkillRequestDTO request) {

        Skill skill =
                skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Skill not found."));

        skill.setSkillName(request.getSkillName());
        skill.setSkillCategory(request.getSkillCategory());
        skill.setDescription(request.getDescription());

        skill = skillRepository.save(skill);

        return buildResponse(skill);
    }

    @Override
    public void deleteSkill(Long skillId) {

        Skill skill =
                skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Skill not found."));

        skillRepository.delete(skill);
    }

    private SkillMasterResponseDTO buildResponse(
            Skill skill) {

        SkillMasterResponseDTO response =
                new SkillMasterResponseDTO();

        response.setSkillId(skill.getSkillId());
        response.setSkillName(skill.getSkillName());
        response.setSkillCategory(skill.getSkillCategory());
        response.setDescription(skill.getDescription());

        return response;
    }
}