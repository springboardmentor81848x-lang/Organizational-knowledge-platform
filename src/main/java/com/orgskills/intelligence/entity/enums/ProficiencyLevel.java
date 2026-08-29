package com.orgskills.intelligence.entity.enums;

/**
 * The single numeric scale for skill proficiency across the whole platform.
 *
 * <p>Every module that needs a number for a skill level reads it from here. No service may
 * define its own ladder: when gap analysis, the heatmap and the recommendation engine each
 * carried their own {@code UNAWARE -> 1.0} switch, the same employee could score differently
 * depending on which report you opened.
 *
 * <p>{@code UNAWARE} scores 0 because it means "has the skill on record but no working
 * knowledge". A skill the employee has no record of at all is a different thing — see
 * {@link com.orgskills.intelligence.entity.GapAnalysis#getMissingSkill()} — and must not be
 * inferred from a score of zero.
 */
public enum ProficiencyLevel {
    UNAWARE(0),
    BEGINNER(1),
    INTERMEDIATE(2),
    ADVANCED(3),
    EXPERT(4);

    public static final int MIN_SCORE = 0;
    public static final int MAX_SCORE = 4;

    private final int score;

    ProficiencyLevel(int score) {
        this.score = score;
    }

    public int getScore() {
        return score;
    }

    /** Exact lookup, for a caller supplying a proficiency as a number. */
    public static ProficiencyLevel fromScore(int score) {
        for (ProficiencyLevel level : values()) {
            if (level.score == score) {
                return level;
            }
        }
        throw new IllegalArgumentException(
                "Proficiency score must be between " + MIN_SCORE + " and " + MAX_SCORE + ", got: " + score);
    }

    /**
     * Nearest level for a fractional score, used when labelling an average across employees.
     * Values outside the scale are clamped rather than rejected, because an average can only
     * come from values already inside it.
     */
    public static ProficiencyLevel fromScore(double score) {
        int rounded = (int) Math.round(Math.max(MIN_SCORE, Math.min(MAX_SCORE, score)));
        return fromScore(rounded);
    }
}
