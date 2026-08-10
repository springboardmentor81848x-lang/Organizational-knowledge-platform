package com.okip.service.trainingmapping;

import java.util.List;

import com.okip.dto.trainingmapping.TrainingSkillRequestDTO;
import com.okip.dto.trainingmapping.TrainingSkillResponseDTO;

public interface TrainingSkillService {

    TrainingSkillResponseDTO createMapping(
            TrainingSkillRequestDTO request);

    List<TrainingSkillResponseDTO> getMappingsByTraining(
            Long trainingId);

    List<TrainingSkillResponseDTO> getMappingsBySkill(
            Long skillId);

    void deleteMapping(Long trainingSkillId);
}