package com.okip.service.competency;

import java.util.List;

import com.okip.dto.competency.JobRoleCompetencyRequestDTO;
import com.okip.dto.competency.JobRoleCompetencyResponseDTO;

public interface JobRoleCompetencyService {

    JobRoleCompetencyResponseDTO createCompetency(
            JobRoleCompetencyRequestDTO request);

    List<JobRoleCompetencyResponseDTO> getCompetenciesByJobRole(
            Long jobRoleId);

    JobRoleCompetencyResponseDTO updateCompetency(
            Long competencyId,
            JobRoleCompetencyRequestDTO request);

    void deleteCompetency(
            Long competencyId);

}