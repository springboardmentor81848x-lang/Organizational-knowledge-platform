package com.okip.service.education;

import java.util.List;

import com.okip.dto.education.AddEducationRequestDTO;
import com.okip.dto.education.EducationResponseDTO;

public interface EducationService {

    EducationResponseDTO addEducation(
            AddEducationRequestDTO request);

    List<EducationResponseDTO> getMyEducation();

    EducationResponseDTO updateEducation(
            Long educationId,
            AddEducationRequestDTO request);

    void deleteEducation(
            Long educationId);

}