package com.knowledgeiq.controller;

import com.knowledgeiq.dto.PersonalizedRecommendationDto;
import com.knowledgeiq.model.CourseEnrollment;
import com.knowledgeiq.model.TrainingCourse;
import com.knowledgeiq.service.TrainingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/training")
public class TrainingController {

    @Autowired
    private TrainingService trainingService;

    @GetMapping("/courses")
    public ResponseEntity<List<TrainingCourse>> getAllCourses() {
        return ResponseEntity.ok(trainingService.getAllCourses());
    }

    @GetMapping("/external-catalog")
    public ResponseEntity<?> getExternalCatalog() {
        return ResponseEntity.ok(trainingService.getExternalCatalog());
    }

    @PostMapping("/courses")
    @PreAuthorize("hasAnyRole('L_AND_D_ADMIN', 'HR_SPECIALIST', 'SYSTEM_ADMIN')")
    public ResponseEntity<TrainingCourse> createCourse(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(trainingService.createCourse(request));
    }

    @PutMapping("/courses/{id}")
    @PreAuthorize("hasAnyRole('L_AND_D_ADMIN', 'HR_SPECIALIST', 'SYSTEM_ADMIN')")
    public ResponseEntity<TrainingCourse> updateCourse(@PathVariable UUID id, @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(trainingService.updateCourse(id, request));
    }

    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasAnyRole('L_AND_D_ADMIN', 'HR_SPECIALIST', 'SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteCourse(@PathVariable UUID id) {
        trainingService.deleteCourse(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }

    @GetMapping("/courses/skill/{skillId}")
    public ResponseEntity<List<TrainingCourse>> getCoursesForSkill(@PathVariable UUID skillId) {
        return ResponseEntity.ok(trainingService.getCoursesForSkill(skillId));
    }

    @PostMapping("/enroll")
    public ResponseEntity<CourseEnrollment> enrollUser(@RequestBody Map<String, String> request, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        UUID courseId = UUID.fromString(request.get("courseId"));
        return ResponseEntity.ok(trainingService.enrollUser(userId, courseId));
    }

    @GetMapping("/enrollments/me")
    public ResponseEntity<List<CourseEnrollment>> getMyEnrollments(Authentication auth) {
        String userIdStr = (String) auth.getPrincipal();
        return ResponseEntity.ok(trainingService.getUserEnrollments(UUID.fromString(userIdStr)));
    }

    @PutMapping("/enrollments/{enrollmentId}/status")
    public ResponseEntity<CourseEnrollment> updateStatus(@PathVariable UUID enrollmentId, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        return ResponseEntity.ok(trainingService.updateEnrollmentStatus(enrollmentId, status));
    }

    @GetMapping("/recommendations/me")
    public ResponseEntity<List<TrainingCourse>> getMyRecommendations(Authentication auth) {
        String userIdStr = (String) auth.getPrincipal();
        return ResponseEntity.ok(trainingService.getRecommendations(UUID.fromString(userIdStr)));
    }

    @GetMapping("/recommendations/personalized")
    public ResponseEntity<List<PersonalizedRecommendationDto>> getPersonalizedRecommendations(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String userIdStr = (String) auth.getPrincipal();
        return ResponseEntity.ok(trainingService.getPersonalizedRecommendations(UUID.fromString(userIdStr)));
    }

    @GetMapping("/learning-path/personalized")
    public ResponseEntity<com.knowledgeiq.dto.PersonalizedLearningPathDto> getPersonalizedLearningPath(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String userIdStr = (String) auth.getPrincipal();
        return ResponseEntity.ok(trainingService.getPersonalizedLearningPath(UUID.fromString(userIdStr)));
    }

    @GetMapping("/my-learning/me")
    public ResponseEntity<Object> getMyLearningData(Authentication auth) {
        String userIdStr = (String) auth.getPrincipal();
        return ResponseEntity.ok(trainingService.getMyLearning(UUID.fromString(userIdStr)));
    }
}
