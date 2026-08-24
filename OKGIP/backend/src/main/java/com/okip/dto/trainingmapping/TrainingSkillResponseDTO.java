package com.okip.dto.trainingmapping;

public class TrainingSkillResponseDTO {

    private Long trainingSkillId;

    private Long trainingId;

    private String trainingName;

    private Long skillId;

    private String skillName;

    public TrainingSkillResponseDTO() {
    }

    public Long getTrainingSkillId() {
        return trainingSkillId;
    }

    public void setTrainingSkillId(Long trainingSkillId) {
        this.trainingSkillId = trainingSkillId;
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public void setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
    }

    public String getTrainingName() {
        return trainingName;
    }

    public void setTrainingName(String trainingName) {
        this.trainingName = trainingName;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }
}