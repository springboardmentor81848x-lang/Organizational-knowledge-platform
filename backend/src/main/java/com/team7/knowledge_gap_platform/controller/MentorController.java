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
    private final com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository employeeSkillRepository;
    private final com.team7.knowledge_gap_platform.repository.SkillRepository skillRepository;

    public MentorController(
            EmployeeRepository employeeRepository,
            com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository employeeSkillRepository,
            com.team7.knowledge_gap_platform.repository.SkillRepository skillRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
    }

    public static class MentorDto {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private String expertise;
        private Integer experienceYears;
        private String availability;
        private String bio;
        private String role;
        private Boolean canRequestMentorship;
        private List<String> higherSkills;

        public MentorDto(Long id, Long employeeId, String employeeName, String expertise, Integer experienceYears, String availability, String bio, String role, Boolean canRequestMentorship, List<String> higherSkills) {
            this.id = id;
            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.expertise = expertise;
            this.experienceYears = experienceYears;
            this.availability = availability;
            this.bio = bio;
            this.role = role;
            this.canRequestMentorship = canRequestMentorship;
            this.higherSkills = higherSkills;
        }

        public Long getId() { return id; }
        public Long getEmployeeId() { return employeeId; }
        public String getEmployeeName() { return employeeName; }
        public String getExpertise() { return expertise; }
        public Integer getExperienceYears() { return experienceYears; }
        public String getAvailability() { return availability; }
        public String getBio() { return bio; }
        public String getRole() { return role; }
        public Boolean getCanRequestMentorship() { return canRequestMentorship; }
        public List<String> getHigherSkills() { return higherSkills; }
    }

    private int getProficiencyRank(String level) {
        if (level == null) return 0;
        switch (level.trim().toUpperCase()) {
            case "EXPERT": return 4;
            case "ADVANCED": return 3;
            case "INTERMEDIATE": return 2;
            case "BEGINNER": return 1;
            default: return 0;
        }
    }

    @GetMapping
    public ResponseEntity<List<MentorDto>> getAllMentors(
            @RequestParam(required = false) Long requesterId) {

        List<Employee> all = employeeRepository.findAll();
        List<MentorDto> mentors = new ArrayList<>();

        // Load skill name cache
        Map<Long, String> skillNameMap = skillRepository.findAll().stream()
                .collect(Collectors.toMap(com.team7.knowledge_gap_platform.entity.Skill::getId,
                        com.team7.knowledge_gap_platform.entity.Skill::getSkillName,
                        (a, b) -> a));

        // Map requester's skills and proficiency ranks if requesterId is provided
        Map<Long, Integer> requesterProficiencyMap = new java.util.HashMap<>();
        if (requesterId != null) {
            List<com.team7.knowledge_gap_platform.entity.EmployeeSkill> reqSkills = employeeSkillRepository.findByEmployeeId(requesterId);
            for (com.team7.knowledge_gap_platform.entity.EmployeeSkill es : reqSkills) {
                requesterProficiencyMap.put(es.getSkillId(), getProficiencyRank(es.getProficiencyLevel()));
            }
        }

        for (Employee emp : all) {
            // Exclude requester themself
            if (requesterId != null && emp.getId().equals(requesterId)) {
                continue;
            }

            // Strictly filter out non-peer employees (ADMIN, HR, MANAGER, DEPARTMENT_HEAD, formal MENTOR)
            // Peer connections are ONLY between employees
            String empRole = emp.getRole();
            if (empRole == null || !"EMPLOYEE".equalsIgnoreCase(empRole.trim())) {
                continue;
            }

            // Retrieve candidate's skills
            List<com.team7.knowledge_gap_platform.entity.EmployeeSkill> candSkills = employeeSkillRepository.findByEmployeeId(emp.getId());
            List<String> higherSkillNames = new ArrayList<>();
            List<String> allSkillNames = new ArrayList<>();

            for (com.team7.knowledge_gap_platform.entity.EmployeeSkill cs : candSkills) {
                String sName = skillNameMap.getOrDefault(cs.getSkillId(), "Skill #" + cs.getSkillId());
                allSkillNames.add(sName);

                int candRank = getProficiencyRank(cs.getProficiencyLevel());
                int reqRank = requesterProficiencyMap.getOrDefault(cs.getSkillId(), 0);

                if (candRank > reqRank) {
                    higherSkillNames.add(sName + " (" + cs.getProficiencyLevel() + ")");
                }
            }

            // Rule: Requester can only send mentorship requests to peer employees who have a higher skill level
            // If requesterId is provided and candidate has NO higher skills, filter candidate out
            if (requesterId != null && higherSkillNames.isEmpty()) {
                continue;
            }

            int expYears = 3;
            if (emp.getExperience() != null) {
                String expStr = emp.getExperience().replaceAll("[^0-9]", "");
                if (!expStr.isEmpty()) {
                    try { expYears = Integer.parseInt(expStr.substring(0, Math.min(2, expStr.length()))); } catch (Exception ignored) {}
                }
            }

            String expertise = !higherSkillNames.isEmpty() ? String.join(", ", higherSkillNames) :
                    (!allSkillNames.isEmpty() ? String.join(", ", allSkillNames) : (emp.getDepartment() != null ? emp.getDepartment() : "Software Engineering"));

            String fullName = (emp.getFirstName() != null ? emp.getFirstName() : "") + " " + (emp.getLastName() != null ? emp.getLastName() : "");

            mentors.add(new MentorDto(
                    emp.getId(),
                    emp.getId(),
                    fullName.trim(),
                    expertise,
                    expYears,
                    "Available",
                    emp.getBio() != null ? emp.getBio() : "Peer developer with higher proficiency in " + expertise,
                    emp.getRole(),
                    true,
                    higherSkillNames
            ));
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
