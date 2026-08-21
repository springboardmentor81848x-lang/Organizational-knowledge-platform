package com.kgap.intel.models;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MentorProfileResponse {
    private Long id;
    private Long employeeId;
    private String expertise;
    private Integer experienceYears;
    private String availability;
    private String bio;

    // Static map for known seed employee names in the system
    private static final Map<Long, String> SEED_EMPLOYEE_NAMES = new HashMap<>();
    static {
        SEED_EMPLOYEE_NAMES.put(16L, "Michael Chen");
        SEED_EMPLOYEE_NAMES.put(18L, "Alex Rivera");
        SEED_EMPLOYEE_NAMES.put(19L, "Dr. Sarah Jenkins");
        SEED_EMPLOYEE_NAMES.put(20L, "Ramesh Rao");
        SEED_EMPLOYEE_NAMES.put(21L, "Elena Vance");
        SEED_EMPLOYEE_NAMES.put(22L, "David Kim");
        SEED_EMPLOYEE_NAMES.put(23L, "Sophia Martinez");
        SEED_EMPLOYEE_NAMES.put(24L, "Liam O'Connor");
        SEED_EMPLOYEE_NAMES.put(4L, "Aarav Sharma");
        SEED_EMPLOYEE_NAMES.put(6L, "Ananya Roy");
        SEED_EMPLOYEE_NAMES.put(2L, "Vikram Mehta");
        SEED_EMPLOYEE_NAMES.put(9L, "Sarah Johnson");
        SEED_EMPLOYEE_NAMES.put(5L, "Rohan Gupta");
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
        return employeeId != null ? employeeId : id;
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
