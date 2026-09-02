package com.knowledgegap.enums;

public enum ProficiencyLevel {

    UNAWARE(0),
    BEGINNER(1),
    INTERMEDIATE(2),
    ADVANCED(3),
    EXPERT(4);

    private final int score;

    ProficiencyLevel(int score) {
        this.score = score;
    }

    public int getScore() {
        return score;
    }

    public static ProficiencyLevel fromScore(int score) {

        for (ProficiencyLevel level : ProficiencyLevel.values()) {
            if (level.getScore() == score) {
                return level;
            }
        }

        throw new IllegalArgumentException(
                "Invalid proficiency score: " + score
        );
    }

    public static String getLevelName(int score) {
        return fromScore(score).name();
    }
}