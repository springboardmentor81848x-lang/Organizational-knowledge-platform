package com.okip.dto.education;

public class EducationResponseDTO {

    private Long educationId;

    private String employeeCode;

    private String degree;

    private String specialization;

    private String institution;

    private String university;

    private Double cgpaOrPercentage;

    private Integer startYear;

    private Integer endYear;

    public EducationResponseDTO() {
    }

    public Long getEducationId() {
        return educationId;
    }

    public void setEducationId(Long educationId) {
        this.educationId = educationId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getInstitution() {
        return institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public Double getCgpaOrPercentage() {
        return cgpaOrPercentage;
    }

    public void setCgpaOrPercentage(Double cgpaOrPercentage) {
        this.cgpaOrPercentage = cgpaOrPercentage;
    }

    public Integer getStartYear() {
        return startYear;
    }

    public void setStartYear(Integer startYear) {
        this.startYear = startYear;
    }

    public Integer getEndYear() {
        return endYear;
    }

    public void setEndYear(Integer endYear) {
        this.endYear = endYear;
    }

}