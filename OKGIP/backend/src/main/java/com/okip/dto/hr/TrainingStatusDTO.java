package com.okip.dto.hr;

public class TrainingStatusDTO {
    private String status;
    private int count;
    private double percentage;

    public TrainingStatusDTO() {}
    public TrainingStatusDTO(String status, int count, double percentage) {
        this.status = status; this.count = count; this.percentage = percentage;
    }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public int getCount() { return count; }
    public void setCount(int v) { count = v; }
    public double getPercentage() { return percentage; }
    public void setPercentage(double v) { percentage = v; }
}
