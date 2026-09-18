package com.knowledgegap.dto;

public class PeerEmployeeSkillResponse {

    private Long id;
    private Long skillId;
    private String skillName;
    private Integer currentLevel;

    public PeerEmployeeSkillResponse() {
    }

    public PeerEmployeeSkillResponse(
            Long id,
            Long skillId,
            String skillName,
            Integer currentLevel) {

        this.id = id;
        this.skillId = skillId;
        this.skillName = skillName;
        this.currentLevel = currentLevel;
    }

    public Long getId() {
        return id;
    }

    public Long getSkillId() {
        return skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public Integer getCurrentLevel() {
        return currentLevel;
    }
}