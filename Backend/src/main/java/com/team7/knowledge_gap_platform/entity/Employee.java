package com.team7.knowledge_gap_platform.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "employee")
public class Employee {
    @Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

private String firstName;
private String lastName;
private String email;
private String phoneNumber;
private String department;
private String role;
private Long jobRoleId;
private String experience;
private String education;
private String bio;

public Long getId() {
    return id;
}

public void setId(Long id) {
    this.id = id;
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

public String getEmail() {
    return email;
}

public void setEmail(String email) {
    this.email = email;
}

public String getPhoneNumber() {
    return phoneNumber;
}

public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
}

public String getDepartment() {
    return department;
}

public void setDepartment(String department) {
    this.department = department;
}

public String getRole() {
    return role;
}

public void setRole(String role) {
    this.role = role;
}

public Long getJobRoleId() {
    return jobRoleId;
}

public void setJobRoleId(Long jobRoleId) {
    this.jobRoleId = jobRoleId;
}

public String getExperience() {
    return experience;
}

public void setExperience(String experience) {
    this.experience = experience;
}

public String getEducation() {
    return education;
}

public void setEducation(String education) {
    this.education = education;
}

public String getBio() {
    return bio;
}

public void setBio(String bio) {
    this.bio = bio;
}
}
