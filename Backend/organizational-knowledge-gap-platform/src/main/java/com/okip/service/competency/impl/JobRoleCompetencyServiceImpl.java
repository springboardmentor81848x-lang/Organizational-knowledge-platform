package com.okip.service.competency.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.okip.dto.competency.JobRoleCompetencyRequestDTO;
import com.okip.dto.competency.JobRoleCompetencyResponseDTO;
import com.okip.entity.master.JobRole;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.JobRoleCompetency;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.JobRoleCompetencyRepository;
import com.okip.repository.JobRoleRepository;
import com.okip.repository.SkillRepository;
import com.okip.service.competency.JobRoleCompetencyService;

@Service
public class JobRoleCompetencyServiceImpl
        implements JobRoleCompetencyService {

    private final JobRoleCompetencyRepository competencyRepository;
    private final JobRoleRepository jobRoleRepository;
    private final SkillRepository skillRepository;

    public JobRoleCompetencyServiceImpl(
            JobRoleCompetencyRepository competencyRepository,
            JobRoleRepository jobRoleRepository,
            SkillRepository skillRepository) {

        this.competencyRepository = competencyRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    public JobRoleCompetencyResponseDTO createCompetency(
            JobRoleCompetencyRequestDTO request) {

        JobRole jobRole =
                jobRoleRepository.findById(request.getJobRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job Role not found."));

        Skill skill =
                skillRepository.findById(request.getSkillId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Skill not found."));

        if (competencyRepository
                .findByJobRoleAndSkill(jobRole, skill)
                .isPresent()) {

            throw new ResourceAlreadyExistsException(
                    "Competency already exists.");
        }

        JobRoleCompetency competency =
                new JobRoleCompetency();

        competency.setJobRole(jobRole);
        competency.setSkill(skill);
        competency.setRequiredProficiency(
                request.getRequiredProficiency());
        competency.setMinimumExperience(
                request.getMinimumExperience());
        competency.setMandatory(
                request.getMandatory());

        competency =
                competencyRepository.save(competency);

        return buildResponse(competency);
    }

    @Override
    public List<JobRoleCompetencyResponseDTO>
            getCompetenciesByJobRole(Long jobRoleId) {

        JobRole jobRole =
                jobRoleRepository.findById(jobRoleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job Role not found."));

        List<JobRoleCompetency> competencies =
                competencyRepository.findByJobRole(jobRole);

        List<JobRoleCompetencyResponseDTO> response =
                new ArrayList<>();

        for (JobRoleCompetency competency : competencies) {

            response.add(buildResponse(competency));
        }

        return response;
    }

    @Override
    public JobRoleCompetencyResponseDTO updateCompetency(
            Long competencyId,
            JobRoleCompetencyRequestDTO request) {

        JobRoleCompetency competency =
                competencyRepository.findById(competencyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Competency not found."));

        JobRole jobRole =
                jobRoleRepository.findById(request.getJobRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job Role not found."));

        Skill skill =
                skillRepository.findById(request.getSkillId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Skill not found."));

        competency.setJobRole(jobRole);
        competency.setSkill(skill);
        competency.setRequiredProficiency(
                request.getRequiredProficiency());
        competency.setMinimumExperience(
                request.getMinimumExperience());
        competency.setMandatory(
                request.getMandatory());

        competency =
                competencyRepository.save(competency);

        return buildResponse(competency);
    }

    @Override
    public void deleteCompetency(
            Long competencyId) {

        JobRoleCompetency competency =
                competencyRepository.findById(competencyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Competency not found."));

        competencyRepository.delete(competency);
    }

    private JobRoleCompetencyResponseDTO buildResponse(
            JobRoleCompetency competency) {

        JobRoleCompetencyResponseDTO response =
                new JobRoleCompetencyResponseDTO();

        response.setJobRoleCompetencyId(
                competency.getJobRoleCompetencyId());

        response.setJobRoleId(
                competency.getJobRole().getJobRoleId());

        response.setJobRoleName(
                competency.getJobRole().getJobRoleName());

        response.setSkillId(
                competency.getSkill().getSkillId());

        response.setSkillName(
                competency.getSkill().getSkillName());

        response.setRequiredProficiency(
                competency.getRequiredProficiency());

        response.setMinimumExperience(
                competency.getMinimumExperience());

        response.setMandatory(
                competency.getMandatory());

        return response;
    }
}