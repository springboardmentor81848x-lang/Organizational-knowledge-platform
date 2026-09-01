package com.knowledgegap.dto;

public class PeerSkillRatingRequest {

    private String skillName;

    private Integer level;

    public PeerSkillRatingRequest() {
    }

    public PeerSkillRatingRequest(
            String skillName,
            Integer level) {

        this.skillName = skillName;
        this.level = level;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}