package com.knowledgegap.dto;

public class MentorRecommendationDTO {

    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String designation;

    private Long skillId;
    private String skillName;
    private Integer skillLevel;

    public MentorRecommendationDTO() {
    }

    public MentorRecommendationDTO(
            Long id,
            String employeeId,
            String firstName,
            String lastName,
            String email,
            String designation,
            Long skillId,
            String skillName,
            Integer skillLevel) {

        this.id = id;
        this.employeeId = employeeId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.designation = designation;
        this.skillId = skillId;
        this.skillName = skillName;
        this.skillLevel = skillLevel;
    }

    public Long getId() {
        return id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getDesignation() {
        return designation;
    }

    public Long getSkillId() {
        return skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public Integer getSkillLevel() {
        return skillLevel;
    }
}