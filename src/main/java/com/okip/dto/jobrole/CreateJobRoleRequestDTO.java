package com.okip.dto.jobrole;

public class CreateJobRoleRequestDTO {

    private String jobRoleName;

    private String description;

    public CreateJobRoleRequestDTO() {
    }

    public String getJobRoleName() {
        return jobRoleName;
    }

    public void setJobRoleName(String jobRoleName) {
        this.jobRoleName = jobRoleName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}