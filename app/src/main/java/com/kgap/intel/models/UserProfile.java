package com.kgap.intel.models;

import java.util.List;

public class UserProfile {
    private String employeeId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String department;
    private String designation;
    private String experience;
    private String education;
    private String bio;
    private List<Skill> skills;
    private List<Certification> certifications;
    private int learningProgress; // 0-100

    public UserProfile(String employeeId, String fullName, String email, String phoneNumber, String department, String designation, String experience, String education, String bio, List<Skill> skills, List<Certification> certifications, int learningProgress) {
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.department = department;
        this.designation = designation;
        this.experience = experience;
        this.education = education;
        this.bio = bio;
        this.skills = skills;
        this.certifications = certifications;
        this.learningProgress = learningProgress;
    }

    // Getters
    public String getEmployeeId() { return employeeId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getDepartment() { return department; }
    public String getDesignation() { return designation; }
    public String getExperience() { return experience; }
    public String getEducation() { return education; }
    public String getBio() { return bio; }
    public List<Skill> getSkills() { return skills; }
    public List<Certification> getCertifications() { return certifications; }
    public int getLearningProgress() { return learningProgress; }
}
