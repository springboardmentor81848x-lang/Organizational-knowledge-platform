package com.orgskills.intelligence.entity.enums;

/**
 * How serious a skill gap is. The thresholds live here rather than in each consumer, so gap
 * analysis, the dashboards and the reports cannot classify the same gap differently.
 */
public enum RiskSeverity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL;

    /** Classifies a gap on the canonical 0-4 proficiency scale, where a gap of 3+ is critical. */
    public static RiskSeverity fromGapScore(double gapScore) {
        if (gapScore >= 3.0) {
            return CRITICAL;
        }
        if (gapScore >= 2.0) {
            return HIGH;
        }
        if (gapScore >= 1.0) {
            return MEDIUM;
        }
        return LOW;
    }
}
