package com.kgap.intel.models;

public class TrainingAdoption {
    private int participation;
    private int completion;
    private int inProgress;
    private double adoptionRate;

    public TrainingAdoption(int participation, int completion, int inProgress, double adoptionRate) {
        this.participation = participation;
        this.completion = completion;
        this.inProgress = inProgress;
        this.adoptionRate = adoptionRate;
    }

    public int getParticipation() { return participation; }
    public int getCompletion() { return completion; }
    public int getInProgress() { return inProgress; }
    public double getAdoptionRate() { return adoptionRate; }
}
