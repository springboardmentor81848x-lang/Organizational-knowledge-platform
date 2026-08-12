package com.kgap.intel.models;

public class HeatmapSkill {
    private String name;
    private int beginnerCount;
    private int intermediateCount;
    private int advancedCount;

    public HeatmapSkill(String name, int beginnerCount, int intermediateCount, int advancedCount) {
        this.name = name;
        this.beginnerCount = beginnerCount;
        this.intermediateCount = intermediateCount;
        this.advancedCount = advancedCount;
    }

    public String getName() { return name; }
    public int getBeginnerCount() { return beginnerCount; }
    public int getIntermediateCount() { return intermediateCount; }
    public int getAdvancedCount() { return advancedCount; }
    
    public int getTotalMembers() {
        return beginnerCount + intermediateCount + advancedCount;
    }
}
