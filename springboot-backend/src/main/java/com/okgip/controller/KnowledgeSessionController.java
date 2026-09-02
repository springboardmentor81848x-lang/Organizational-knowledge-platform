package com.okgip.controller;

import com.okgip.entity.Employee;
import com.okgip.entity.KnowledgeSession;
import com.okgip.entity.SessionRegistration;
import com.okgip.entity.Skill;
import com.okgip.repository.EmployeeRepository;
import com.okgip.repository.KnowledgeSessionRepository;
import com.okgip.repository.SessionRegistrationRepository;
import com.okgip.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/sessions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class KnowledgeSessionController {

    @Autowired
    private KnowledgeSessionRepository sessionRepository;

    @Autowired
    private SessionRegistrationRepository registrationRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SkillRepository skillRepository;

    @GetMapping
    public ResponseEntity<?> getAllSessions() {
        List<KnowledgeSession> sessions = sessionRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (KnowledgeSession s : sessions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("title", s.getTitle());
            map.put("description", s.getDescription());
            map.put("hostMentorName", s.getHostMentor() != null ? s.getHostMentor().getFirstName() + " " + s.getHostMentor().getLastName() : "Tech Lead");
            map.put("hostMentorId", s.getHostMentor() != null ? s.getHostMentor().getId() : null);
            map.put("skillName", s.getSkill() != null ? s.getSkill().getName() : "Enterprise Architecture");
            map.put("sessionDate", s.getSessionDate());
            map.put("durationMinutes", s.getDurationMinutes());
            map.put("maxCapacity", s.getMaxCapacity());
            long registeredCount = registrationRepository.countBySessionIdAndAttendanceStatusNot(s.getId(), "CANCELLED");
            map.put("registeredCount", registeredCount);
            map.put("meetingLink", s.getMeetingLink() != null ? s.getMeetingLink() : "https://meet.google.com/okgip-tech-sync");
            map.put("status", s.getStatus());
            map.put("averageRating", s.getAverageRating());
            map.put("effectivenessScore", s.getEffectivenessScore());
            result.add(map);
        }
        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSessionById(@PathVariable Long id) {
        return sessionRepository.findById(id).map(session -> {
            List<SessionRegistration> regs = registrationRepository.findBySessionId(id);
            return ResponseEntity.ok(Map.of("success", true, "session", session, "registrations", regs));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody Map<String, Object> body) {
        String title = body.get("title").toString();
        String description = body.getOrDefault("description", "").toString();
        Long hostMentorId = Long.valueOf(body.get("hostMentorId").toString());
        Long skillId = body.containsKey("skillId") && body.get("skillId") != null ? Long.valueOf(body.get("skillId").toString()) : null;
        Integer maxCapacity = body.containsKey("maxCapacity") ? Integer.valueOf(body.get("maxCapacity").toString()) : 25;
        Integer duration = body.containsKey("durationMinutes") ? Integer.valueOf(body.get("durationMinutes").toString()) : 60;
        String meetingLink = body.getOrDefault("meetingLink", "https://meet.google.com/okgip-knowledge-session").toString();

        Employee mentor = employeeRepository.findById(hostMentorId).orElse(null);
        if (mentor == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Host mentor employee not found"));
        }

        Skill skill = skillId != null ? skillRepository.findById(skillId).orElse(null) : null;

        KnowledgeSession session = KnowledgeSession.builder()
                .title(title)
                .description(description)
                .hostMentor(mentor)
                .skill(skill)
                .sessionDate(LocalDateTime.now().plusDays(2))
                .durationMinutes(duration)
                .maxCapacity(maxCapacity)
                .meetingLink(meetingLink)
                .status("SCHEDULED")
                .averageRating(5.0)
                .effectivenessScore(95.0)
                .build();

        KnowledgeSession saved = sessionRepository.save(session);
        return ResponseEntity.status(201).json(Map.of("success", true, "message", "Knowledge sharing session created", "data", saved));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForSession(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long employeeId = Long.valueOf(body.get("employeeId").toString());

        KnowledgeSession session = sessionRepository.findById(id).orElse(null);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }

        long registeredCount = registrationRepository.countBySessionIdAndAttendanceStatusNot(id, "CANCELLED");
        if (registeredCount >= session.getMaxCapacity()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Knowledge session is full at maximum capacity (" + session.getMaxCapacity() + ")"));
        }

        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Employee not found"));
        }

        Optional<SessionRegistration> existing = registrationRepository.findBySessionIdAndEmployeeId(id, employeeId);
        if (existing.isPresent()) {
            SessionRegistration reg = existing.get();
            reg.setAttendanceStatus("REGISTERED");
            registrationRepository.save(reg);
            return ResponseEntity.ok(Map.of("success", true, "message", "Registration renewed", "data", reg));
        }

        SessionRegistration reg = SessionRegistration.builder()
                .session(session)
                .employee(emp)
                .attendanceStatus("REGISTERED")
                .build();

        SessionRegistration saved = registrationRepository.save(reg);
        return ResponseEntity.status(201).json(Map.of("success", true, "message", "Successfully registered for knowledge session", "data", saved));
    }

    @PutMapping("/{id}/attendance")
    public ResponseEntity<?> markAttendance(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        String status = body.getOrDefault("attendanceStatus", "ATTENDED").toString();

        Optional<SessionRegistration> regOpt = registrationRepository.findBySessionIdAndEmployeeId(id, employeeId);
        if (regOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Registration not found for employee"));
        }

        SessionRegistration reg = regOpt.get();
        reg.setAttendanceStatus(status);
        SessionRegistration saved = registrationRepository.save(reg);
        return ResponseEntity.ok(Map.of("success", true, "message", "Attendance updated to " + status, "data", saved));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<?> submitFeedback(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        Integer rating = Integer.valueOf(body.get("rating").toString());
        String feedbackText = body.getOrDefault("feedback", "Excellent session, very practical hands-on examples.").toString();

        Optional<SessionRegistration> regOpt = registrationRepository.findBySessionIdAndEmployeeId(id, employeeId);
        if (regOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Registration record not found"));
        }

        SessionRegistration reg = regOpt.get();
        reg.setRating(rating);
        reg.setFeedback(feedbackText);
        reg.setAttendanceStatus("ATTENDED");
        registrationRepository.save(reg);

        // Update average rating and effectiveness score on session
        sessionRepository.findById(id).ifPresent(s -> {
            List<SessionRegistration> list = registrationRepository.findBySessionId(id);
            double sum = 0;
            int count = 0;
            for (SessionRegistration r : list) {
                if (r.getRating() != null) {
                    sum += r.getRating();
                    count++;
                }
            }
            if (count > 0) {
                s.setAverageRating(Math.round((sum / count) * 10.0) / 10.0);
                s.setEffectivenessScore(Math.min(100.0, (s.getAverageRating() / 5.0) * 100.0));
                sessionRepository.save(s);
            }
        });

        return ResponseEntity.ok(Map.of("success", true, "message", "Feedback submitted and session effectiveness updated successfully"));
    }
}
