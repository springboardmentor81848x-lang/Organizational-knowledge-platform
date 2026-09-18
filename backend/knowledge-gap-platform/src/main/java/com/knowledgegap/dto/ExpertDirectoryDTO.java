package com.knowledgegap.dto;

public class ExpertDirectoryDTO {

    private Long id;
    private Long employeeDbId;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String designation;
    private String department;
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private Integer proficiencyLevel;
    private String proficiency;
    private String role;
    private boolean availableForMentorship;

    public ExpertDirectoryDTO() {
    }

    public ExpertDirectoryDTO(
            Long id,
            Long employeeDbId,
            String employeeId,
            String firstName,
            String lastName,
            String email,
            String designation,
            String department,
            Long skillId,
            String skillName,
            String skillCategory,
            Integer proficiencyLevel,
            String proficiency,
            String role,
            boolean availableForMentorship) {

        this.id = id;
        this.employeeDbId = employeeDbId;
        this.employeeId = employeeId;
        String f = (firstName != null) ? firstName : "";
        String l = (lastName != null) ? lastName : "";
        this.fullName = (f + " " + l).trim();
 this.email = email;
 this.designation = designation;
 this.department = department;
 this.skillId = skillId;
 this.skillName = skillName;
 this.skillCategory = skillCategory;
 this.proficiencyLevel = proficiencyLevel;
 this.proficiency = proficiency;
 this.role = role;
 this.availableForMentorship = availableForMentorship;
 }

 public Long getId() {
 return id;
 }

 public void setId(Long id) {
 this.id = id;
 }

 public Long getEmployeeDbId() {
 return employeeDbId;
 }

 public void setEmployeeDbId(Long employeeDbId) {
 this.employeeDbId = employeeDbId;
 }

 public String getEmployeeId() {
 return employeeId;
 }

 public void setEmployeeId(String employeeId) {
 this.employeeId = employeeId;
 }

 public String getFirstName() {
 return firstName;
 }

 public void setFirstName(String firstName) {
 this.firstName = firstName;
 }

 public String getLastName() {
 return lastName;
 }

 public void setLastName(String lastName) {
 this.lastName = lastName;
 }

 public String getFullName() {
 return fullName;
 }

 public void setFullName(String fullName) {
 this.fullName = fullName;
 }

 public String getEmail() {
 return email;
 }

 public void setEmail(String email) {
 this.email = email;
 }

 public String getDesignation() {
 return designation;
 }

 public void setDesignation(String designation) {
 this.designation = designation;
 }

 public String getDepartment() {
 return department;
 }

 public void setDepartment(String department) {
 this.department = department;
 }

 public Long getSkillId() {
 return skillId;
 }

 public void setSkillId(Long skillId) {
 this.skillId = skillId;
 }

 public String getSkillName() {
 return skillName;
 }

 public void setSkillName(String skillName) {
 this.skillName = skillName;
 }

 public String getSkillCategory() {
 return skillCategory;
 }

 public void setSkillCategory(String skillCategory) {
 this.skillCategory = skillCategory;
 }

 public Integer getProficiencyLevel() {
 return proficiencyLevel;
 }

 public void setProficiencyLevel(Integer proficiencyLevel) {
 this.proficiencyLevel = proficiencyLevel;
 }

 public String getProficiency() {
 return proficiency;
 }

 public void setProficiency(String proficiency) {
 this.proficiency = proficiency;
 }

 public String getRole() {
 return role;
 }

 public void setRole(String role) {
 this.role = role;
 }

 public boolean isAvailableForMentorship() {
 return availableForMentorship;
 }

 public void setAvailableForMentorship(boolean availableForMentorship) {
 this.availableForMentorship = availableForMentorship;
 }
}
