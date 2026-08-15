package com.kgap.intel.models;

public class LDDashboardStats {
    public int totalPrograms;
    public int activePrograms;
    public int totalLearners;
    public int enrolledLearners;
    public double completionRate;
    public double participationRate;
    public double learningEffectiveness;
    public int pendingCertifications;

    public LDDashboardStats(int totalPrograms, int activePrograms, int totalLearners, int enrolledLearners, double completionRate, double participationRate, double learningEffectiveness, int pendingCertifications) {
        this.totalPrograms = totalPrograms;
        this.activePrograms = activePrograms;
        this.totalLearners = totalLearners;
        this.enrolledLearners = enrolledLearners;
        this.completionRate = completionRate;
        this.participationRate = participationRate;
        this.learningEffectiveness = learningEffectiveness;
        this.pendingCertifications = pendingCertifications;
    }
}
