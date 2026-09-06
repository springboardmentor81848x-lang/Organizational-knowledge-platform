package com.kgap.intel.models;

public class GapSummary {
    private int totalGaps;
    private int criticalGaps;
    private int highGaps;
    private int mediumGaps;
    private int lowGaps;

    public GapSummary(int totalGaps, int criticalGaps, int highGaps, int mediumGaps, int lowGaps) {
        this.totalGaps = totalGaps;
        this.criticalGaps = criticalGaps;
        this.highGaps = highGaps;
        this.mediumGaps = mediumGaps;
        this.lowGaps = lowGaps;
    }

    public int getTotalGaps() { return totalGaps; }
    public int getCriticalGaps() { return criticalGaps; }
    public int getHighGaps() { return highGaps; }
    public int getMediumGaps() { return mediumGaps; }
    public int getLowGaps() { return lowGaps; }
}
