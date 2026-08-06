package com.okip.service.skill;

import java.util.List;

import com.okip.dto.skill.SkillRequestDTO;
import com.okip.dto.skill.SkillResponseDTO;

public interface SkillService {

    SkillResponseDTO addSkill(
            SkillRequestDTO request);

    List<SkillResponseDTO> getMySkills();

    SkillResponseDTO updateSkill(
            Long employeeSkillId,
            SkillRequestDTO request);

    void deleteSkill(
            Long employeeSkillId);

}