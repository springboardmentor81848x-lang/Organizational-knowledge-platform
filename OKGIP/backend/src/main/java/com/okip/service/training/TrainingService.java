package com.okip.service.training;

import java.util.List;

import com.okip.dto.training.TrainingRequestDTO;
import com.okip.dto.training.TrainingResponseDTO;

public interface TrainingService {

    TrainingResponseDTO createTraining(TrainingRequestDTO request);

    TrainingResponseDTO getTrainingById(Long trainingId);

    List<TrainingResponseDTO> getAllTrainings();

    TrainingResponseDTO updateTraining(Long trainingId, TrainingRequestDTO request);

    void deleteTraining(Long trainingId);
}
