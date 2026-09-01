package com.okgip.controller;

import com.okgip.entity.Employee;
import com.okgip.entity.Mentorship;
import com.okgip.entity.Skill;
import com.okgip.repository.EmployeeRepository;
import com.okgip.repository.MentorshipRepository;
import com.okgip.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/mentorships")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MentorshipController {

    @Autowired
    private MentorshipRepository mentorshipRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SkillRepository skillRepository;

    @GetMapping
    public ResponseEntity<?> getAllMentorships(@RequestParam(required = false) Long employeeId,
                                              @RequestParam(required = false) String status) {
        List<Mentorship> list;
        if (employeeId != null) {
            list = mentorshipRepository.findByMenteeIdOrMentorId(employeeId, employeeId);
        } else if (status != null) {
            list = mentorshipRepository.findByStatus(status);
        } else {
            list = mentorshipRepository.findAll();
        }
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getMentorRecommendations(@RequestParam(required = false) Long employeeId,
                                                      @RequestParam(required = false) String skillName) {
        List<Employee> allEmployees = employeeRepository.findAll();
        List<Map<String, Object>> recommendations = new ArrayList<>();

        // Find experts and high-proficiency employees
        for (Employee emp : allEmployees) {
            if (employeeId != null && emp.getId().equals(employeeId)) {
                continue; // Do not recommend self
            }
            if (emp.getExperienceYears() != null && emp.getExperienceYears() >= 3) {
                Map<String, Object> rec = new HashMap<>();
                rec.put("mentorId", emp.getId());
                rec.put("name", emp.getFirstName() + " " + emp.getLastName());
                rec.put("email", emp.getUser() != null ? emp.getUser().getEmail() : "");
                rec.put("department", emp.getDepartment() != null ? emp.getDepartment().getName() : "Technology");
                rec.put("designation", emp.getDesignation());
                rec.put("experienceYears", emp.getExperienceYears());
                rec.put("expertSkill", skillName != null ? skillName : "Full Stack Architecture & Spring Boot");
                rec.put("proficiencyLevel", 5);
                rec.put("matchScore", 95);
                rec.put("availability", "Available (2 slots)");
                recommendations.add(rec);
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "data", recommendations));
    }

    @GetMapping("/experts")
    public ResponseEntity<?> getExpertDirectory(@RequestParam(required = false) String skill,
                                                @RequestParam(required = false) String department) {
        List<Employee> all = employeeRepository.findAll();
        List<Map<String, Object>> experts = all.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("name", e.getFirstName() + " " + e.getLastName());
            map.put("email", e.getUser() != null ? e.getUser().getEmail() : "");
            map.put("department", e.getDepartment() != null ? e.getDepartment().getName() : "Engineering");
            map.put("designation", e.getDesignation());
            map.put("experience", (e.getExperienceYears() != null ? e.getExperienceYears() : 4) + " yrs");
            map.put("skills", List.of("Spring Boot", "React", "Docker", "PostgreSQL", "Cloud Architecture"));
            map.put("rating", 4.9);
            map.put("activeMentees", 2);
            map.put("status", "Available");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", experts));
    }

    @PostMapping
    public ResponseEntity<?> requestMentorship(@RequestBody Map<String, Object> body) {
        Long mentorId = Long.valueOf(body.get("mentorId").toString());
        Long menteeId = Long.valueOf(body.get("menteeId").toString());
        Long skillId = body.containsKey("skillId") && body.get("skillId") != null ? Long.valueOf(body.get("skillId").toString()) : 1L;
        String goal = body.getOrDefault("goal", "Accelerate Spring Boot and Cloud microservices proficiency").toString();

        Employee mentor = employeeRepository.findById(mentorId).orElse(null);
        Employee mentee = employeeRepository.findById(menteeId).orElse(null);
        Skill skill = skillRepository.findById(skillId).orElse(null);

        if (mentor == null || mentee == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Mentor or Mentee not found"));
        }

        Mentorship mentorship = Mentorship.builder()
                .mentor(mentor)
                .mentee(mentee)
                .skill(skill)
                .goal(goal)
                .status("REQUESTED")
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(3))
                .build();

        Mentorship saved = mentorshipRepository.save(mentorship);
        return ResponseEntity.status(201).json(Map.of("success", true, "message", "Mentorship requested successfully", "data", saved));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptMentorship(@PathVariable Long id) {
        return mentorshipRepository.findById(id).map(m -> {
            m.setStatus("ACTIVE");
            Mentorship saved = mentorshipRepository.save(m);
            return ResponseEntity.ok(Map.of("success", true, "message", "Mentorship accepted and active", "data", saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectMentorship(@PathVariable Long id) {
        return mentorshipRepository.findById(id).map(m -> {
            m.setStatus("REJECTED");
            Mentorship saved = mentorshipRepository.save(m);
            return ResponseEntity.ok(Map.of("success", true, "message", "Mentorship request declined", "data", saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeMentorship(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return mentorshipRepository.findById(id).map(m -> {
            m.setStatus("COMPLETED");
            if (body.containsKey("rating")) {
                m.setRating(Integer.valueOf(body.get("rating").toString()));
            }
            if (body.containsKey("feedback")) {
                m.setFeedback(body.get("feedback").toString());
            }
            Mentorship saved = mentorshipRepository.save(m);
            return ResponseEntity.ok(Map.of("success", true, "message", "Mentorship marked as completed with feedback", "data", saved));
        }).orElse(ResponseEntity.notFound().build());
    }
}
