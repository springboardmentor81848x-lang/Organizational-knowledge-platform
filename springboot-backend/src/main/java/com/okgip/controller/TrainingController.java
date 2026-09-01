package com.okgip.controller;

import com.okgip.entity.*;
import com.okgip.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/trainings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TrainingController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LearningMilestoneRepository learningMilestoneRepository;

    @GetMapping
    public ResponseEntity<?> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", courses));
    }

    @GetMapping("/assignments")
    public ResponseEntity<?> getAssignments(@RequestParam(required = false) Long employeeId) {
        List<CourseProgress> list = employeeId != null
                ? courseProgressRepository.findByEmployeeId(employeeId)
                : courseProgressRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @PostMapping("/enroll")
    public ResponseEntity<?> enrollCourse(@RequestBody Map<String, Object> body) {
        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        Long courseId = Long.valueOf(body.get("courseId").toString());

        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        Course course = courseRepository.findById(courseId).orElse(null);

        if (emp == null || course == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Employee or Course not found"));
        }

        Optional<CourseProgress> existing = courseProgressRepository.findByEmployeeIdAndCourseId(employeeId, courseId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Already enrolled in course", "data", existing.get()));
        }

        CourseProgress cp = CourseProgress.builder()
                .employee(emp)
                .course(course)
                .progressPercentage(0)
                .status("IN_PROGRESS")
                .enrolledAt(LocalDateTime.now())
                .build();

        CourseProgress saved = courseProgressRepository.save(cp);
        return ResponseEntity.status(201).json(Map.of("success", true, "message", "Enrolled in training program", "data", saved));
    }

    @PutMapping("/progress/{id}")
    public ResponseEntity<?> updateProgress(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Integer percentage = Integer.valueOf(body.get("progressPercentage").toString());

        return courseProgressRepository.findById(id).map(cp -> {
            cp.setProgressPercentage(percentage);
            if (percentage >= 100) {
                cp.setStatus("COMPLETED");
                cp.setCompletedAt(LocalDateTime.now());
            }
            CourseProgress saved = courseProgressRepository.save(cp);
            return ResponseEntity.ok(Map.of("success", true, "message", "Progress updated", "data", saved));
        }).orElse(ResponseEntity.notFound().build());
    }
}
