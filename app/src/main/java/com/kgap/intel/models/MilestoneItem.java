package com.kgap.intel.models;

import java.io.Serializable;

public class MilestoneItem implements Serializable {
    private String title;
    private String description;
    private String status; // "COMPLETED", "IN_PROGRESS", "ENROLLED"
    private Integer progressPercentage;
    private String date;
    private boolean isCompleted;

    public MilestoneItem() {
    }

    public MilestoneItem(String title, String description, String status, Integer progressPercentage, String date, boolean isCompleted) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.progressPercentage = progressPercentage;
        this.date = date;
        this.isCompleted = isCompleted;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }
}
