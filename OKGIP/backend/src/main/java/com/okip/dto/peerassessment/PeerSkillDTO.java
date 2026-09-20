package com.okip.dto.peerassessment;

public class PeerSkillDTO {

    private Long skillId;
    private String skillName;
    private String skillCategory;
    private String currentProficiency;

    public PeerSkillDTO() {
    }

    public PeerSkillDTO(
            Long skillId,
            String skillName,
            String skillCategory,
            String currentProficiency) {

        this.skillId = skillId;
        this.skillName = skillName;
        this.skillCategory = skillCategory;
        this.currentProficiency = currentProficiency;
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

    public String getSkillCategory() {
        return skillCategory;
    }

    public void setSkillCategory(String skillCategory) {
        this.skillCategory = skillCategory;
    }

    public String getCurrentProficiency() {
        return currentProficiency;
    }

    public void setCurrentProficiency(String currentProficiency) {
        this.currentProficiency = currentProficiency;
    }
}