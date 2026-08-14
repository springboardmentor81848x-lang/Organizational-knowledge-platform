package com.knowledgeiq.dto;

import java.util.List;

public class PersonalizedLearningPathDto {
    private String targetRole;
    private Integer skillScore;
    private Integer gapPercentage;
    private String topGapSkill;
    private String pathWhyOrderExplanation;
    private Integer completedCount;
    private Integer totalCount;
    private Boolean hasNoGaps;
    private Boolean isNewUser;
    private List<PersonalizedRecommendationDto> steps;

    public PersonalizedLearningPathDto() {}

    public PersonalizedLearningPathDto(String targetRole, Integer skillScore, Integer gapPercentage, String topGapSkill, String pathWhyOrderExplanation, Integer completedCount, Integer totalCount, Boolean hasNoGaps, Boolean isNewUser, List<PersonalizedRecommendationDto> steps) {
        this.targetRole = targetRole;
        this.skillScore = skillScore;
        this.gapPercentage = gapPercentage;
        this.topGapSkill = topGapSkill;
        this.pathWhyOrderExplanation = pathWhyOrderExplanation;
        this.completedCount = completedCount;
        this.totalCount = totalCount;
        this.hasNoGaps = hasNoGaps;
        this.isNewUser = isNewUser;
        this.steps = steps;
    }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public Integer getSkillScore() { return skillScore; }
    public void setSkillScore(Integer skillScore) { this.skillScore = skillScore; }

    public Integer getGapPercentage() { return gapPercentage; }
    public void setGapPercentage(Integer gapPercentage) { this.gapPercentage = gapPercentage; }

    public String getTopGapSkill() { return topGapSkill; }
    public void setTopGapSkill(String topGapSkill) { this.topGapSkill = topGapSkill; }

    public String getPathWhyOrderExplanation() { return pathWhyOrderExplanation; }
    public void setPathWhyOrderExplanation(String pathWhyOrderExplanation) { this.pathWhyOrderExplanation = pathWhyOrderExplanation; }

    public Integer getCompletedCount() { return completedCount; }
    public void setCompletedCount(Integer completedCount) { this.completedCount = completedCount; }

    public Integer getTotalCount() { return totalCount; }
    public void setTotalCount(Integer totalCount) { this.totalCount = totalCount; }

    public Boolean getHasNoGaps() { return hasNoGaps; }
    public void setHasNoGaps(Boolean hasNoGaps) { this.hasNoGaps = hasNoGaps; }

    public Boolean getIsNewUser() { return isNewUser; }
    public void setIsNewUser(Boolean isNewUser) { this.isNewUser = isNewUser; }

    public List<PersonalizedRecommendationDto> getSteps() { return steps; }
    public void setSteps(List<PersonalizedRecommendationDto> steps) { this.steps = steps; }
}
