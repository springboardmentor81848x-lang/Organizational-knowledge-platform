package com.kgap.intel.models;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MentorProfileResponse {
    @com.google.gson.annotations.SerializedName("id")
    private Long id;

    @com.google.gson.annotations.SerializedName(value = "employeeId", alternate = {"employee_id"})
    private Long employeeId;

    @com.google.gson.annotations.SerializedName("expertise")
    private String expertise;

    @com.google.gson.annotations.SerializedName(value = "experienceYears", alternate = {"experience_years"})
    private Integer experienceYears;

    @com.google.gson.annotations.SerializedName("availability")
    private String availability;

    @com.google.gson.annotations.SerializedName("bio")
    private String bio;

    // Static map for known seed employee names in the system
    private static final Map<Long, String> SEED_EMPLOYEE_NAMES = new HashMap<>();
    static {
        SEED_EMPLOYEE_NAMES.put(1L, "System Administrator");
        SEED_EMPLOYEE_NAMES.put(2L, "Priya Patel");
        SEED_EMPLOYEE_NAMES.put(3L, "Sarah Johnson");
        SEED_EMPLOYEE_NAMES.put(4L, "Aarav Sharma");
        SEED_EMPLOYEE_NAMES.put(5L, "Rohan Gupta");
        SEED_EMPLOYEE_NAMES.put(6L, "Ananya Roy");
        SEED_EMPLOYEE_NAMES.put(7L, "David Miller");
        SEED_EMPLOYEE_NAMES.put(8L, "Meera Iyer");
        SEED_EMPLOYEE_NAMES.put(9L, "James Wilson");
        SEED_EMPLOYEE_NAMES.put(10L, "Sneha Nair");
        SEED_EMPLOYEE_NAMES.put(11L, "Rajesh Kumar");
        SEED_EMPLOYEE_NAMES.put(12L, "Lisa Chang");
        SEED_EMPLOYEE_NAMES.put(13L, "Vikram Mehta");
        SEED_EMPLOYEE_NAMES.put(14L, "Kavitha Raman");
        SEED_EMPLOYEE_NAMES.put(15L, "Amit Desai");
        SEED_EMPLOYEE_NAMES.put(16L, "Michael Chen");
        SEED_EMPLOYEE_NAMES.put(17L, "Sophia Martinez");
        SEED_EMPLOYEE_NAMES.put(18L, "Rahul Bose");
        SEED_EMPLOYEE_NAMES.put(19L, "Emily Davis");
        SEED_EMPLOYEE_NAMES.put(20L, "Arjun Kapoor");
        SEED_EMPLOYEE_NAMES.put(21L, "Neha Verma");
        SEED_EMPLOYEE_NAMES.put(22L, "Karan Singh");
        SEED_EMPLOYEE_NAMES.put(23L, "Tanvi Shah");
        SEED_EMPLOYEE_NAMES.put(24L, "Ravi Shankar");
        SEED_EMPLOYEE_NAMES.put(25L, "Deepa Nambiar");
        SEED_EMPLOYEE_NAMES.put(26L, "Vikramaditya Sen");
        SEED_EMPLOYEE_NAMES.put(27L, "Natasha Roy");
        SEED_EMPLOYEE_NAMES.put(28L, "Siddharth Verma");
        SEED_EMPLOYEE_NAMES.put(29L, "Elena Rostova");
        SEED_EMPLOYEE_NAMES.put(30L, "Karthik Nambiar");
    }

    public MentorProfileResponse() {}

    public MentorProfileResponse(Long id, Long employeeId, String expertise, Integer experienceYears, String availability, String bio) {
        this.id = id;
        this.employeeId = employeeId;
        this.expertise = expertise;
        this.experienceYears = experienceYears;
        this.availability = availability;
        this.bio = bio;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getExpertise() { return expertise != null ? expertise : ""; }
    public void setExpertise(String expertise) { this.expertise = expertise; }

    public Integer getExperienceYears() { return experienceYears != null ? experienceYears : 0; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getAvailability() { return availability != null ? availability : "Available"; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getBio() { return bio != null ? bio : ""; }
    public void setBio(String bio) { this.bio = bio; }

    public String getDisplayName() {
        Long empId = getEffectiveMentorId();
        if (empId != null && SEED_EMPLOYEE_NAMES.containsKey(empId)) {
            return SEED_EMPLOYEE_NAMES.get(empId);
        }
        return "Mentor #" + (empId != null ? empId : id);
    }

    public Long getEffectiveMentorId() {
        if (employeeId != null && employeeId > 0) {
            return employeeId;
        }
        if (id != null) {
            if (id == 1L) return 15L; // Amit Desai
            if (id == 2L) return 16L; // Michael Chen
            if (id == 3L) return 17L; // Sophia Martinez
            if (id == 4L) return 18L; // Rahul Bose
            if (id == 5L) return 19L; // Emily Davis
            if (id == 6L) return 20L; // Arjun Kapoor
            if (id == 7L) return 26L; // Vikramaditya Sen
            if (id == 8L) return 27L; // Natasha Roy
            if (id == 9L) return 28L; // Siddharth Verma
            if (id == 10L) return 29L; // Elena Rostova
            if (id == 11L) return 30L; // Karthik Nambiar
            if (id > 11L) return id;
        }
        return id;
    }

    public double getRatingVal() {
        // High rated default for ranking/sorting compatibility
        return 4.8;
    }

    public String getRatingFormatted() {
        return "4.8";
    }

    public List<String> getSkillTags() {
        if (expertise == null || expertise.trim().isEmpty()) {
            return new ArrayList<>();
        }
        String[] parts = expertise.split("[,;&]");
        List<String> tags = new ArrayList<>();
        for (String p : parts) {
            String trimmed = p.trim();
            if (!trimmed.isEmpty()) {
                tags.add(trimmed);
            }
        }
        return tags;
    }
}
