package com.knowledgeiq.dto;

import java.util.List;
import java.util.UUID;

public class AssessmentComparisonDto {
    private AssessmentDto assessment1;
    private AssessmentDto assessment2;
    private Double scoreDelta;
    private List<SkillDeltaItem> skillDeltas;

    public AssessmentComparisonDto() {}

    public AssessmentComparisonDto(AssessmentDto assessment1, AssessmentDto assessment2, Double scoreDelta, List<SkillDeltaItem> skillDeltas) {
        this.assessment1 = assessment1;
        this.assessment2 = assessment2;
        this.scoreDelta = scoreDelta;
        this.skillDeltas = skillDeltas;
    }

    public AssessmentDto getAssessment1() { return assessment1; }
    public void setAssessment1(AssessmentDto assessment1) { this.assessment1 = assessment1; }

    public AssessmentDto getAssessment2() { return assessment2; }
    public void setAssessment2(AssessmentDto assessment2) { this.assessment2 = assessment2; }

    public Double getScoreDelta() { return scoreDelta; }
    public void setScoreDelta(Double scoreDelta) { this.scoreDelta = scoreDelta; }

    public List<SkillDeltaItem> getSkillDeltas() { return skillDeltas; }
    public void setSkillDeltas(List<SkillDeltaItem> skillDeltas) { this.skillDeltas = skillDeltas; }

    public static class SkillDeltaItem {
        private String skillName;
        private Integer level1;
        private Integer level2;
        private Integer levelDelta;

        public SkillDeltaItem() {}

        public SkillDeltaItem(String skillName, Integer level1, Integer level2, Integer levelDelta) {
            this.skillName = skillName;
            this.level1 = level1;
            this.level2 = level2;
            this.levelDelta = levelDelta;
        }

        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }

        public Integer getLevel1() { return level1; }
        public void setLevel1(Integer level1) { this.level1 = level1; }

        public Integer getLevel2() { return level2; }
        public void setLevel2(Integer level2) { this.level2 = level2; }

        public Integer getLevelDelta() { return levelDelta; }
        public void setLevelDelta(Integer levelDelta) { this.levelDelta = levelDelta; }
    }
}
