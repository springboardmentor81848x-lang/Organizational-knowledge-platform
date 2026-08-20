package com.okip.service.skillmaster;

import java.util.List;

import com.okip.dto.skillmaster.CreateSkillRequestDTO;
import com.okip.dto.skillmaster.SkillMasterResponseDTO;

public interface SkillMasterService {

    SkillMasterResponseDTO createSkill(
            CreateSkillRequestDTO request);

    List<SkillMasterResponseDTO> getAllSkills();

    SkillMasterResponseDTO getSkillById(
            Long skillId);

    SkillMasterResponseDTO updateSkill(
            Long skillId,
            CreateSkillRequestDTO request);

    void deleteSkill(
            Long skillId);

}