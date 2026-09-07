package com.okip.service.experience;

import java.util.List;

import com.okip.dto.experience.AddExperienceRequestDTO;
import com.okip.dto.experience.ExperienceResponseDTO;

public interface ExperienceService {

    ExperienceResponseDTO addExperience(
            AddExperienceRequestDTO request);

    List<ExperienceResponseDTO> getMyExperiences();

    ExperienceResponseDTO updateExperience(
            Long experienceId,
            AddExperienceRequestDTO request);

    void deleteExperience(
            Long experienceId);

}