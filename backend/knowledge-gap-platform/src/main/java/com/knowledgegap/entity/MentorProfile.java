package com.knowledgegap.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "mentor_profiles")
public class MentorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Existing Employee/Mentor
    @OneToOne
    @JoinColumn(name = "mentor_id", nullable = false, unique = true)
    private Employee mentor;

    // Mentor biography
    @Column(length = 2000)
    private String bio;

    // Years of mentoring/industry experience
    private Integer experienceYears;

    // Maximum number of active mentees
    private Integer maxMentees;

    // Availability information
    @Column(length = 1000)
    private String availability;

    // Online / Offline / Both
    private String mentoringMode;

    public MentorProfile() {
    }

    public Long getId() {
        return id;
    }

    public Employee getMentor() {
        return mentor;
    }

    public void setMentor(Employee mentor) {
        this.mentor = mentor;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public Integer getMaxMentees() {
        return maxMentees;
    }

    public void setMaxMentees(Integer maxMentees) {
        this.maxMentees = maxMentees;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getMentoringMode() {
        return mentoringMode;
    }

    public void setMentoringMode(String mentoringMode) {
        this.mentoringMode = mentoringMode;
    }
}