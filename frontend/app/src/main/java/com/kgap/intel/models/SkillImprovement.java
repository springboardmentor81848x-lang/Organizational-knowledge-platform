package com.kgap.intel.models;

import java.io.Serializable;

public class SkillImprovement implements Serializable {

    public enum Trend {
        IMPROVED,
        DECLINED,
        NO_CHANGE
    }

    private Long skillId;
    private double initialScore;
    private double currentScore;
    private double improvementPercentage;
    private Trend trend;

    public SkillImprovement() {
    }

    public SkillImprovement(Long skillId, double initialScore, double currentScore, double improvementPercentage, Trend trend) {
        this.skillId = skillId;
        this.initialScore = initialScore;
        this.currentScore = currentScore;
        this.improvementPercentage = improvementPercentage;
        this.trend = trend;
    }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public double getInitialScore() { return initialScore; }
    public void setInitialScore(double initialScore) { this.initialScore = initialScore; }

    public double getCurrentScore() { return currentScore; }
    public void setCurrentScore(double currentScore) { this.currentScore = currentScore; }

    public double getImprovementPercentage() { return improvementPercentage; }
    public void setImprovementPercentage(double improvementPercentage) { this.improvementPercentage = improvementPercentage; }

    public Trend getTrend() { return trend; }
    public void setTrend(Trend trend) { this.trend = trend; }

    public static SkillImprovement calculate(java.util.List<AssessmentResultItem> results) {
        if (results == null || results.isEmpty()) {
            return null;
        }

        java.util.List<AssessmentResultItem> validResults = new java.util.ArrayList<>();
        for (AssessmentResultItem item : results) {
            if (item != null && item.getScorePercentage() != null) {
                validResults.add(item);
            }
        }

        if (validResults.isEmpty()) {
            return null;
        }

        java.util.Collections.sort(validResults, (a, b) -> {
            String dateA = a.getCompletedAt() != null ? a.getCompletedAt() : "";
            String dateB = b.getCompletedAt() != null ? b.getCompletedAt() : "";
            return dateA.compareTo(dateB);
        });

        Long skillId = validResults.get(0).getSkillId();
        double baselineScore = validResults.get(0).getScorePercentage();
        double latestScore = validResults.get(validResults.size() - 1).getScorePercentage();

        if (validResults.size() == 1) {
            return new SkillImprovement(skillId, baselineScore, latestScore, 0.0, Trend.NO_CHANGE);
        }

        double improvementPercentage = latestScore - baselineScore;
        Trend trend;
        if (improvementPercentage > 0.001) {
            trend = Trend.IMPROVED;
        } else if (improvementPercentage < -0.001) {
            trend = Trend.DECLINED;
        } else {
            trend = Trend.NO_CHANGE;
        }

        return new SkillImprovement(skillId, baselineScore, latestScore, improvementPercentage, trend);
    }
}
