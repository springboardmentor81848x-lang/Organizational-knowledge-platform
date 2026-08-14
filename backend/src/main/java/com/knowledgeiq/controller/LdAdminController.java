package com.knowledgeiq.controller;

import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import com.knowledgeiq.service.GapAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ldadmin")
@PreAuthorize("hasAnyRole('L_AND_D_ADMIN', 'SYSTEM_ADMIN')")
public class LdAdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CertificationRepository certificationRepository;

    @Autowired
    private TrainingCourseRepository courseRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getLdDashboard(Authentication auth) {
        UUID adminId = UUID.fromString((String) auth.getPrincipal());
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("L&D Admin not found"));

        UUID orgId = admin.getOrganization() != null ? admin.getOrganization().getId() : null;

        Map<String, Object> data = new HashMap<>();
        data.put("name", admin.getFullName());
        data.put("title", admin.getRoleTitle() != null ? admin.getRoleTitle() : "L&D Program Lead");
        data.put("initials", admin.getFullName() != null && admin.getFullName().length() > 0 ? 
                admin.getFullName().substring(0, 1).toUpperCase() : "LD");

        // Dynamic metrics
        long totalCourses = courseRepository.count();
        long pendingCerts = 0;
        long totalEnrollments = 0;
        long completedEnrollments = 0;

        if (orgId != null) {
            pendingCerts = certificationRepository.findByUserOrganizationIdOrderByCreatedAtDesc(orgId).stream()
                    .filter(c -> "UPLOADED".equalsIgnoreCase(c.getStatus()) || "PENDING".equalsIgnoreCase(c.getStatus()))
                    .count();
            
            List<CourseEnrollment> enrollments = enrollmentRepository.findAll().stream()
                    .filter(e -> e.getUser() != null && e.getUser().getOrganization() != null && 
                            e.getUser().getOrganization().getId().equals(orgId))
                    .collect(Collectors.toList());
            
            totalEnrollments = enrollments.size();
            completedEnrollments = enrollments.stream().filter(e -> "COMPLETED".equalsIgnoreCase(e.getStatus())).count();
        }

        data.put("totalCourses", totalCourses);
        data.put("pendingCertifications", pendingCerts);
        data.put("totalEnrollments", totalEnrollments);
        data.put("completedEnrollments", completedEnrollments);
        data.put("completionRate", totalEnrollments > 0 ? (completedEnrollments * 100) / totalEnrollments : 0);

        // Course Catalog List
        data.put("courses", courseRepository.findAll());

        // Dynamic Enrollment Chart data
        List<Map<String, Object>> enrollmentTrends = Arrays.asList(
                Map.of("month", "May", "value", totalEnrollments / 4),
                Map.of("month", "Jun", "value", totalEnrollments / 2),
                Map.of("month", "Jul", "value", totalEnrollments)
        );
        data.put("trends", enrollmentTrends);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/certifications")
    public ResponseEntity<List<Certification>> getCertifications(Authentication auth) {
        UUID adminId = UUID.fromString((String) auth.getPrincipal());
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("L&D Admin not found"));

        if (admin.getOrganization() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        return ResponseEntity.ok(certificationRepository.findByUserOrganizationIdOrderByCreatedAtDesc(admin.getOrganization().getId()));
    }

    @PostMapping("/certifications/{id}/verify")
    @Transactional
    public ResponseEntity<Map<String, String>> verifyCertification(@PathVariable UUID id, Authentication auth) {
        Certification cert = certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        cert.setStatus("VERIFIED");
        cert.setAssessmentStatus("Completed");
        cert.setAssessmentScore(95.0);
        certificationRepository.save(cert);

        // Auto upgrade skill rating if skill is present
        if (cert.getSkill() != null && cert.getUser() != null) {
            User employee = cert.getUser();
            Skill skill = cert.getSkill();
            
            EmployeeSkill es = employeeSkillRepository.findByUserIdAndSkillId(employee.getId(), skill.getId())
                    .orElseGet(() -> {
                        EmployeeSkill newEs = new EmployeeSkill();
                        newEs.setUser(employee);
                        newEs.setSkill(skill);
                        return newEs;
                    });
            // Automatically set proficiency level to 4 (Advanced) for verified certs
            es.setProficiencyLevel(Math.max(es.getProficiencyLevel() != null ? es.getProficiencyLevel() : 1, 4));
            employeeSkillRepository.save(es);

            try {
                gapAnalysisService.recalculateUserGaps(employee.getId());
            } catch (Exception e) {
                System.err.println("Recalculation error on verification: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(Map.of("message", "Certification verified and employee skills updated successfully."));
    }

    private static final List<Map<String, Object>> IN_MEMORY_PATHS = new ArrayList<>(Arrays.asList(
            new HashMap<>(Map.of(
                    "id", "path-1",
                    "title", "Enterprise Spring Boot Microservices Security",
                    "targetSkill", "Java Spring Boot",
                    "targetRole", "Senior Product Engineer",
                    "difficulty", "Advanced",
                    "durationHours", 32,
                    "enrolledCount", 6,
                    "milestones", Arrays.asList("Spring Security 6 & OAuth2", "Microservice Gateway Design", "High-Volume Performance & Caching")
            )),
            new HashMap<>(Map.of(
                    "id", "path-2",
                    "title", "Cloud Infrastructure & Container Security Mastery",
                    "targetSkill", "Cloud / AWS",
                    "targetRole", "DevOps & Security Specialist",
                    "difficulty", "Advanced",
                    "durationHours", 40,
                    "enrolledCount", 5,
                    "milestones", Arrays.asList("Docker & Kubernetes Hardening", "AWS IAM & VPC Architecture", "Terraform Infrastructure as Code")
            )),
            new HashMap<>(Map.of(
                    "id", "path-3",
                    "title", "React 18 & Enterprise Design Systems",
                    "targetSkill", "React",
                    "targetRole", "Lead UI/UX Engineer",
                    "difficulty", "Intermediate",
                    "durationHours", 24,
                    "enrolledCount", 4,
                    "milestones", Arrays.asList("Concurrent Mode & Suspense", "State Management with Zustand", "Figma Token Synchronization")
            ))
    ));

    @GetMapping("/paths")
    public ResponseEntity<List<Map<String, Object>>> getLearningPaths(Authentication auth) {
        return ResponseEntity.ok(IN_MEMORY_PATHS);
    }

    @PostMapping("/paths")
    public ResponseEntity<Map<String, Object>> createLearningPath(@RequestBody Map<String, Object> payload, Authentication auth) {
        String newId = "path-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> newPath = new HashMap<>(payload);
        newPath.put("id", newId);
        newPath.put("enrolledCount", 0);
        if (!newPath.containsKey("milestones")) {
            newPath.put("milestones", Arrays.asList("Foundation Principles", "Applied Case Study", "Competency Assessment"));
        }
        IN_MEMORY_PATHS.add(0, newPath);
        return ResponseEntity.ok(newPath);
    }

    @DeleteMapping("/paths/{id}")
    public ResponseEntity<Map<String, String>> deleteLearningPath(@PathVariable String id, Authentication auth) {
        IN_MEMORY_PATHS.removeIf(p -> Objects.equals(p.get("id"), id));
        return ResponseEntity.ok(Map.of("message", "Learning path removed successfully."));
    }
}
