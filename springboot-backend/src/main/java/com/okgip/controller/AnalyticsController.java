package com.okgip.controller;

import com.okgip.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private KnowledgeGapRepository knowledgeGapRepository;

    @Autowired
    private MentorshipRepository mentorshipRepository;

    @Autowired
    private AssessmentResultRepository assessmentResultRepository;

    @GetMapping("/employee/{id}")
    public ResponseEntity<?> getEmployeeAnalytics(@PathVariable Long id) {
        Map<String, Object> data = new HashMap<>();
        data.put("employeeId", id);
        data.put("totalSkillsAssessed", 7);
        data.put("openSkillGaps", 2);
        data.put("activeCourses", 3);
        data.put("completedCourses", 5);
        data.put("averageLearningProgress", 78);
        data.put("skillsImprovedCount", 4);
        data.put("activeMentorName", "Sarah Jenkins (Lead Architect)");
        data.put("learningVelocity", "+1.8 levels/quarter");
        data.put("assessmentAverageScore", 88);
        data.put("nextMilestoneDue", "Spring Boot REST Microservices (due in 3 days)");

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/team/{managerId}")
    public ResponseEntity<?> getTeamAnalytics(@PathVariable Long managerId) {
        Map<String, Object> data = new HashMap<>();
        data.put("managerId", managerId);
        data.put("teamSize", 12);
        data.put("employeesWithCriticalGaps", 3);
        data.put("trainingAdoptionRate", 85);
        data.put("averageTeamProgress", 74);
        data.put("topWeakSkill", "Spring Boot Microservices & Cloud Security");
        data.put("skillsCoveragePercent", 82);
        data.put("mentorshipParticipation", "9 out of 12 employees");

        // Answering the 6 manager questions
        Map<String, Object> questions = new HashMap<>();
        questions.put("q1_criticalGapEmployees", List.of("Alex Rivera (Spring Boot Gap)", "David Kumar (Docker Gap)"));
        questions.put("q2_weakSkillsAcrossTeam", List.of("Spring Boot", "Cloud Architecture", "Kubernetes"));
        questions.put("q3_enrolledInTraining", 10);
        questions.put("q4_fallingBehindEmployees", List.of("Michael Chang (Progress 25%, Target 80%)"));
        questions.put("q5_improvedEmployees", List.of("Elena Rostova (+2 React)", "Sarah Jenkins (+1 AWS)"));
        questions.put("q6_highAdoptionPrograms", List.of("Advanced Spring Boot Bootcamp (92% adoption)"));
        data.put("managerDecisionSupport", questions);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/department/{id}")
    public ResponseEntity<?> getDepartmentAnalytics(@PathVariable Long id) {
        Map<String, Object> data = new HashMap<>();
        data.put("departmentId", id);
        data.put("totalEmployees", 50);
        data.put("trainingEnrolled", 38);
        data.put("trainingCompleted", 25);
        data.put("averageLearningProgress", 72);
        data.put("criticalSkillGaps", 5);
        data.put("topGap", "Cloud Computing & Spring Boot");
        data.put("skillCoverageIndex", 79);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/organization")
    public ResponseEntity<?> getOrganizationAnalytics() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalEmployees", 145);
        data.put("employeesWithSkillGaps", 32);
        data.put("criticalSkillGapsCount", 8);
        data.put("employeesInTraining", 89);
        data.put("trainingCompletionRate", 76);
        data.put("averageLearningProgress", 74);
        data.put("averageSkillImprovementLevels", 1.4);
        data.put("activeMentorshipsCount", 24);
        data.put("knowledgeSharingSessionsHeld", 18);
        data.put("learningRoiPercentage", 185);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}
