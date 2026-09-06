package com.kgap.intel.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class TrainingEnrollment implements Serializable {
    @SerializedName("id")
    private Long id;

    @SerializedName("trainingId")
    private Long trainingId;

    @SerializedName("employeeId")
    private Long employeeId;

    @SerializedName("status")
    private String status;

    @SerializedName("progressPercentage")
    private Integer progressPercentage;

    @SerializedName("enrolledAt")
    private String enrolledAt;

    @SerializedName("completedAt")
    private String completedAt;

    public TrainingEnrollment() {
    }

    public TrainingEnrollment(Long trainingId, Long employeeId) {
        this.trainingId = trainingId;
        this.employeeId = employeeId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public void setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
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

    public String getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(String enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public String getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(String completedAt) {
        this.completedAt = completedAt;
    }

    public String getTrainingTitle() {
        if (trainingId == null) return "Enterprise Skills Training Program";
        switch (trainingId.intValue()) {
            case 1: return "Full Stack Java & Spring Boot Mastery";
            case 2: return "PostgreSQL Database Administration & Tuning";
            case 3: return "React 18 & Modern Frontend Engineering";
            case 4: return "Generative AI & LLM Application Building";
            case 5: return "Docker Containerization & Microservice Ops";
            case 6: return "Kubernetes Cloud Infrastructure & Helm";
            case 7: return "Enterprise REST API Design Standards";
            case 8: return "Technical Documentation & Architecture Specs";
            case 9: return "Product Lifecycle Management & Strategy";
            case 10: return "Cyber Risk Assessment & Security Best Practices";
            case 11: return "Data Pipelines & BigQuery Analytics";
            case 12: return "UI/UX Design Systems & Prototyping";
            default: return "Enterprise Skill Training Program #" + trainingId;
        }
    }
}
