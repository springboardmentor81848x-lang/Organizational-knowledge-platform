package com.okip.service.training.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.training.TrainingRequestDTO;
import com.okip.dto.training.TrainingResponseDTO;
import com.okip.entity.master.Training;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.TrainingRepository;
import com.okip.service.training.TrainingService;

@Service
@Transactional
public class TrainingServiceImpl implements TrainingService {

    private final TrainingRepository trainingRepository;

    public TrainingServiceImpl(
            TrainingRepository trainingRepository) {

        this.trainingRepository = trainingRepository;
    }

    @Override
    public TrainingResponseDTO createTraining(
            TrainingRequestDTO request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Training request cannot be null.");
        }

        if (request.getTrainingName() == null
                || request.getTrainingName().isBlank()) {

            throw new IllegalArgumentException(
                    "Training name is required.");
        }

        if (trainingRepository.existsByTrainingNameIgnoreCase(
                request.getTrainingName())) {

            throw new ResourceAlreadyExistsException(
                    "Training already exists.");
        }

        Training training = new Training();

        training.setTrainingName(
                request.getTrainingName().trim());

        training.setProvider(
                request.getProvider());

        training.setDuration(
                request.getDuration());

        training.setLevel(
                request.getLevel());

        training.setDescription(
                request.getDescription());

        training.setCourseUrl(
                request.getCourseUrl());

        Training savedTraining =
                trainingRepository.save(training);

        return convertToResponse(savedTraining);
    }

    @Override
    @Transactional(readOnly = true)
    public TrainingResponseDTO getTrainingById(
            Long trainingId) {

        Training training =
                trainingRepository.findById(trainingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Training not found."));

        return convertToResponse(training);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrainingResponseDTO> getAllTrainings() {

        return trainingRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TrainingResponseDTO updateTraining(
            Long trainingId,
            TrainingRequestDTO request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Training request cannot be null.");
        }

        Training training =
                trainingRepository.findById(trainingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Training not found."));

        String newName = request.getTrainingName();

        if (newName == null || newName.isBlank()) {
            throw new IllegalArgumentException(
                    "Training name is required.");
        }

        boolean nameChanged =
                !training.getTrainingName()
                        .equalsIgnoreCase(newName.trim());

        if (nameChanged
                && trainingRepository
                        .existsByTrainingNameIgnoreCaseAndTrainingIdNot(
                                newName.trim(),
                                trainingId)) {

            throw new ResourceAlreadyExistsException(
                    "Training already exists.");
        }

        training.setTrainingName(
                newName.trim());

        training.setProvider(
                request.getProvider());

        training.setDuration(
                request.getDuration());

        training.setLevel(
                request.getLevel());

        training.setDescription(
                request.getDescription());

        training.setCourseUrl(
                request.getCourseUrl());

        Training updatedTraining =
                trainingRepository.save(training);

        return convertToResponse(updatedTraining);
    }

    @Override
    public void deleteTraining(
            Long trainingId) {

        Training training =
                trainingRepository.findById(trainingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Training not found."));

        trainingRepository.delete(training);
    }

    private TrainingResponseDTO convertToResponse(
            Training training) {

        TrainingResponseDTO response =
                new TrainingResponseDTO();

        response.setTrainingId(
                training.getTrainingId());

        response.setTrainingName(
                training.getTrainingName());

        response.setProvider(
                training.getProvider());

        response.setDuration(
                training.getDuration());

        response.setLevel(
                training.getLevel());

        response.setDescription(
                training.getDescription());

        response.setCourseUrl(
                training.getCourseUrl());

        return response;
    }
}