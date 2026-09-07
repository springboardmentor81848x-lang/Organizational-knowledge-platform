package com.okip.dto.trainingmapping;

import jakarta.validation.constraints.NotNull;

public class TrainingSkillRequestDTO {

    @NotNull(message = "Training ID is required")
    private Long trainingId;

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    public TrainingSkillRequestDTO() {
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public void setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }
}