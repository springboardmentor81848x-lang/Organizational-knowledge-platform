package com.okip.service.trainingmapping.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.okip.dto.trainingmapping.TrainingSkillRequestDTO;
import com.okip.dto.trainingmapping.TrainingSkillResponseDTO;
import com.okip.entity.master.Skill;
import com.okip.entity.master.Training;
import com.okip.entity.transaction.TrainingSkill;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.SkillRepository;
import com.okip.repository.TrainingRepository;
import com.okip.repository.TrainingSkillRepository;
import com.okip.service.trainingmapping.TrainingSkillService;

@Service
public class TrainingSkillServiceImpl
        implements TrainingSkillService {

    private final TrainingSkillRepository trainingSkillRepository;

    private final TrainingRepository trainingRepository;

    private final SkillRepository skillRepository;

    public TrainingSkillServiceImpl(
            TrainingSkillRepository trainingSkillRepository,
            TrainingRepository trainingRepository,
            SkillRepository skillRepository) {

        this.trainingSkillRepository = trainingSkillRepository;
        this.trainingRepository = trainingRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    public TrainingSkillResponseDTO createMapping(
            TrainingSkillRequestDTO request) {

        Training training =
                trainingRepository.findById(
                        request.getTrainingId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Training not found."));

        Skill skill =
                skillRepository.findById(
                        request.getSkillId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Skill not found."));

        if (trainingSkillRepository
                .existsByTrainingAndSkill(training, skill)) {

            throw new ResourceAlreadyExistsException(
                    "This training is already mapped to this skill.");
        }

        TrainingSkill mapping = new TrainingSkill();

        mapping.setTraining(training);
        mapping.setSkill(skill);

        TrainingSkill savedMapping =
                trainingSkillRepository.save(mapping);

        return convertToResponse(savedMapping);
    }

    @Override
    public List<TrainingSkillResponseDTO> getMappingsByTraining(
            Long trainingId) {

        Training training =
                trainingRepository.findById(trainingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Training not found."));

        return trainingSkillRepository
                .findByTraining(training)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrainingSkillResponseDTO> getMappingsBySkill(
            Long skillId) {

        Skill skill =
                skillRepository.findById(skillId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Skill not found."));

        return trainingSkillRepository
                .findBySkill(skill)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteMapping(Long trainingSkillId) {

        TrainingSkill mapping =
                trainingSkillRepository.findById(
                        trainingSkillId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Training-skill mapping not found."));

        trainingSkillRepository.delete(mapping);
    }

    private TrainingSkillResponseDTO convertToResponse(
            TrainingSkill mapping) {

        TrainingSkillResponseDTO response =
                new TrainingSkillResponseDTO();

        response.setTrainingSkillId(
                mapping.getTrainingSkillId());

        response.setTrainingId(
                mapping.getTraining().getTrainingId());

        response.setTrainingName(
                mapping.getTraining().getTrainingName());

        response.setSkillId(
                mapping.getSkill().getSkillId());

        response.setSkillName(
                mapping.getSkill().getSkillName());

        return response;
    }
}