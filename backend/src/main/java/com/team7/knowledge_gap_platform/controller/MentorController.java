package com.team7.knowledge_gap_platform.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.Employee;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;

@RestController
@RequestMapping("/mentors")
public class MentorController {

    private final EmployeeRepository employeeRepository;

    public MentorController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public static class MentorDto {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private String expertise;
        private Integer experienceYears;
        private String availability;
        private String bio;

        public MentorDto(Long id, Long employeeId, String employeeName, String expertise, Integer experienceYears, String availability, String bio) {
            this.id = id;
            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.expertise = expertise;
            this.experienceYears = experienceYears;
            this.availability = availability;
            this.bio = bio;
        }

        public Long getId() { return id; }
        public Long getEmployeeId() { return employeeId; }
        public String getEmployeeName() { return employeeName; }
        public String getExpertise() { return expertise; }
        public Integer getExperienceYears() { return experienceYears; }
        public String getAvailability() { return availability; }
        public String getBio() { return bio; }
    }

    @GetMapping
    public ResponseEntity<List<MentorDto>> getAllMentors(
            @RequestParam(required = false) Long requesterId) {

        List<Employee> all = employeeRepository.findAll();
        List<MentorDto> mentors = new ArrayList<>();

        for (Employee emp : all) {
            // Exclude requester if provided
            if (requesterId != null && emp.getId().equals(requesterId)) {
                continue;
            }

            int expYears = 5;
            if (emp.getExperience() != null) {
                String expStr = emp.getExperience().replaceAll("[^0-9]", "");
                if (!expStr.isEmpty()) {
                    try { expYears = Integer.parseInt(expStr.substring(0, Math.min(2, expStr.length()))); } catch (Exception ignored) {}
                }
            }

            String expertise = emp.getDepartment() != null ? emp.getDepartment() : "General";
            if ("Software Engineering".equalsIgnoreCase(emp.getDepartment())) {
                expertise = "Java & Spring Boot, PostgreSQL, Microservices";
            } else if ("Product Management".equalsIgnoreCase(emp.getDepartment())) {
                expertise = "Product Strategy, Agile Milestone Tracking, Agile Leadership";
            } else if ("Human Resources".equalsIgnoreCase(emp.getDepartment())) {
                expertise = "Organizational HR, Competency Mapping, Talent Development";
            } else if ("Data & AI".equalsIgnoreCase(emp.getDepartment())) {
                expertise = "Machine Learning, LLM Architecture, Python";
            }

            String fullName = (emp.getFirstName() != null ? emp.getFirstName() : "") + " " + (emp.getLastName() != null ? emp.getLastName() : "");

            mentors.add(new MentorDto(
                    emp.getId(),
                    emp.getId(),
                    fullName.trim(),
                    expertise,
                    expYears,
                    "Available",
                    emp.getBio() != null ? emp.getBio() : "Experienced mentor in " + expertise
            ));
        }

        // Add additional senior peer mentors for rich catalog
        if (mentors.size() < 6) {
            mentors.add(new MentorDto(15L, 15L, "Amit Desai", "System Design, Microservices, Cloud Architecture", 10, "Available", "Specialized in large-scale distributed systems and enterprise microservices."));
            mentors.add(new MentorDto(16L, 16L, "Michael Chen", "Machine Learning, Deep Learning, Python, NLP", 9, "Available", "Leading AI/ML data science teams and intelligent platform development."));
            mentors.add(new MentorDto(17L, 17L, "Sophia Martinez", "Docker, Kubernetes, CI/CD, AWS", 7, "Available", "Cloud infrastructure, DevOps automation and continuous deployment expert."));
        }

        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorDto> getMentorById(@PathVariable Long id) {
        List<MentorDto> all = getAllMentors(null).getBody();
        if (all != null) {
            for (MentorDto m : all) {
                if (m.getId().equals(id) || (m.getEmployeeId() != null && m.getEmployeeId().equals(id))) {
                    return ResponseEntity.ok(m);
                }
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<MentorDto>> searchMentors(
            @RequestParam String expertise,
            @RequestParam(required = false) Long requesterId) {

        List<MentorDto> all = getAllMentors(requesterId).getBody();
        if (all == null) return ResponseEntity.ok(List.of());

        String query = expertise.toLowerCase();
        List<MentorDto> matched = all.stream()
                .filter(m -> m.getExpertise().toLowerCase().contains(query) ||
                             m.getEmployeeName().toLowerCase().contains(query))
                .collect(Collectors.toList());

        return ResponseEntity.ok(matched);
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(Map.of(
                "activeMentees", 4,
                "pendingRequests", 2,
                "completedSessions", 8,
                "totalHours", 24
        ));
    }

    @GetMapping("/mentees")
    public ResponseEntity<List<Map<String, Object>>> getMentees() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "m1", "name", "Sarah Johnson", "role", "Lead Product Manager", "progress", 75, "skillsAcquired", List.of("Agile", "Roadmap"), "targetSkills", List.of("System Design"), "learningPathTitle", "Product Strategy Path"),
                Map.of("id", "m2", "name", "Aarav Sharma", "role", "Senior Java Engineer", "progress", 60, "skillsAcquired", List.of("Spring Boot", "JPA"), "targetSkills", List.of("Docker", "Redis"), "learningPathTitle", "Cloud Native Backend")
        ));
    }
}
