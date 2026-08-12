package com.kgap.intel.models;

public class GapSkill {
    private String name;
    private int currentProficiency;
    private int requiredProficiency;
    private int membersAffected;
    private Severity severity;

    public enum Severity {
        CRITICAL, HIGH, MEDIUM, LOW
    }

    public GapSkill(String name, int currentProficiency, int requiredProficiency) {
        this.name = name;
        this.currentProficiency = currentProficiency;
        this.requiredProficiency = requiredProficiency;
        this.membersAffected = 0;
        this.severity = calculateSeverity();
    }

    public GapSkill(String name, int currentProficiency, int requiredProficiency, int membersAffected) {
        this.name = name;
        this.currentProficiency = currentProficiency;
        this.requiredProficiency = requiredProficiency;
        this.membersAffected = membersAffected;
        this.severity = calculateSeverity();
    }

    private Severity calculateSeverity() {
        int gap = requiredProficiency - currentProficiency;
        if (gap >= 40) return Severity.CRITICAL;
        if (gap >= 25) return Severity.HIGH;
        if (gap >= 10) return Severity.MEDIUM;
        return Severity.LOW;
    }

    public String getName() { return name; }
    public int getCurrentProficiency() { return currentProficiency; }
    public int getRequiredProficiency() { return requiredProficiency; }
    public int getMembersAffected() { return membersAffected; }
    public Severity getSeverity() { return severity; }
    public int getGap() { return Math.max(0, requiredProficiency - currentProficiency); }
}
