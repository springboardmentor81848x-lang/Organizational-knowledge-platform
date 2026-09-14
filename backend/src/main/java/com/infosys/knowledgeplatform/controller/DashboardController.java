package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.*;
import com.infosys.knowledgeplatform.service.RoleCatalogService;
import com.infosys.knowledgeplatform.service.DepartmentHeadService;
import com.infosys.knowledgeplatform.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final RoleCatalogService roleCatalogService;
    private final DepartmentHeadService departmentHeadService;
    private final EmployeeService employeeService;

    public DashboardController(RoleCatalogService roleCatalogService, DepartmentHeadService departmentHeadService, EmployeeService employeeService) {
        this.roleCatalogService = roleCatalogService;
        this.departmentHeadService = departmentHeadService;
        this.employeeService = employeeService;
    }

    @GetMapping("/{rolePath}")
    public ResponseEntity<?> getDashboardData(
            @PathVariable String rolePath,
            @RequestParam(required = false) String email
    ) {
        String roleName = switch (rolePath.toLowerCase()) {
            case "manager" -> "Team Lead / Manager";
            case "hr" -> "HR Specialist";
            case "department-head", "depthead" -> "Department Head";
            case "ld" -> "Learning & Development Admin/mentor";
            case "admin" -> "System Administrator";
            default -> "Employee";
        };

        var profile = roleCatalogService.getProfile(roleName);

        Map<String, Object> response = Map.of(
                "roleProfile", Map.of(
                        "displayName", profile.displayName(),
                        "family", profile.family(),
                        "audience", profile.audience(),
                        "focusSkills", profile.focusSkills()
                ),
                "stats", List.of(
                        Map.of("icon", "👥", "color", "indigo", "value", "3,450", "title", "Total Workforce", "change", "+124", "dir", "up"),
                        Map.of("icon", "⚠️", "color", "pink", "value", "142", "title", "Skills Monitored", "change", "+18", "dir", "up"),
                        Map.of("icon", "📉", "color", "green", "value", "18%", "title", "Avg. Competency Gap", "change", "-4%", "dir", "up"),
                        Map.of("icon", "🎓", "color", "purple", "value", "1,894", "title", "Active Learners", "change", "54%", "dir", "neutral")
                ),
                "highRiskGaps", List.of(
                        Map.of("title", "Cloud Infrastructure Security", "severity", "Critical", "impact", "Engineering • Impacts Q3", "value", 42),
                        Map.of("title", "Predictive Data Modeling (Python)", "severity", "High", "impact", "Data Science • Emerging Need", "value", 28),
                        Map.of("title", "Advanced SEO & Performance", "severity", "Medium", "impact", "Marketing • Optimization", "value", 15)
                ),
                "trainingRecommendations", List.of(
                        Map.of("score", 98, "title", "Advanced Cloud Architectures", "provider", "Internal Engineering", "source", "Internal Catalog", "duration", "12h"),
                        Map.of("score", 92, "title", "Generative AI for Professionals", "provider", "Coursera Enterprise", "source", "External", "duration", "4h"),
                        Map.of("score", 85, "title", "Real-time Event Streaming", "provider", "Udemy Business", "source", "External", "duration", "8h")
                ),
                "departmentSkillCoverage", List.of(
                        Map.of("department", "Engineering", "pct", 78, "color", "#6366f1"),
                        Map.of("department", "Marketing", "pct", 65, "color", "#ec4899"),
                        Map.of("department", "Data Science", "pct", 55, "color", "#f59e0b"),
                        Map.of("department", "HR & Ops", "pct", 88, "color", "#10b981")
                )
        );

        return ResponseEntity.ok(response);
    }

    // ===== DEPARTMENT HEAD ENDPOINTS =====

    @GetMapping("/department-head/statistics")
    public ResponseEntity<?> getDepartmentStatistics(@RequestParam String email) {
        return ResponseEntity.ok(departmentHeadService.getDepartmentStatistics(email));
    }

    @GetMapping("/department-head/teams")
    public ResponseEntity<?> getDepartmentTeams(@RequestParam String email) {
        return ResponseEntity.ok(departmentHeadService.getDepartmentTeams(email));
    }

    @GetMapping("/department-head/employees")
    public ResponseEntity<?> getDepartmentEmployees(@RequestParam String email) {
        return ResponseEntity.ok(departmentHeadService.getDepartmentEmployees(email));
    }

    @GetMapping("/department-head/knowledge-gaps")
    public ResponseEntity<?> getKnowledgeGaps(@RequestParam String email) {
        return ResponseEntity.ok(departmentHeadService.getKnowledgeGaps(email));
    }

    @GetMapping("/department-head/learning-priorities")
    public ResponseEntity<?> getLearningPriorities(@RequestParam String email) {
        return ResponseEntity.ok(departmentHeadService.getLearningPriorities(email));
    }

    @PostMapping("/department-head/learning-priorities")
    public ResponseEntity<?> createLearningPriority(
            @RequestParam String email,
            @RequestBody Map<String, Object> priorityData) {
        return ResponseEntity.ok(departmentHeadService.createLearningPriority(email, priorityData));
    }

    @GetMapping("/department-head/knowledge-approvals")
    public ResponseEntity<?> getKnowledgeApprovals(@RequestParam String email) {
        return ResponseEntity.ok(departmentHeadService.getKnowledgeApprovals(email));
    }

    @PutMapping("/department-head/knowledge-approvals/{id}")
    public ResponseEntity<?> reviewKnowledgeApproval(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestParam String status,
            @RequestBody(required = false) Map<String, String> body) {
        String reviewNotes = body != null ? body.getOrDefault("notes", "") : "";
        return ResponseEntity.ok(departmentHeadService.reviewKnowledgeApproval(id, email, status, reviewNotes));
    }

    @GetMapping("/department-head/team-leader-reports")
    public ResponseEntity<?> getTeamLeaderReports(@RequestParam String email) {
        return ResponseEntity.ok(departmentHeadService.getTeamLeaderReports(email));
    }

    @PutMapping("/department-head/team-leader-reports/{id}")
    public ResponseEntity<?> resolveTeamLeaderReport(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestBody(required = false) Map<String, String> body) {
        String resolution = body != null ? body.getOrDefault("resolution", "") : "";
        return ResponseEntity.ok(departmentHeadService.resolveTeamLeaderReport(id, email, resolution));
    }

    // ===== EMPLOYEE ENDPOINTS =====

    @GetMapping("/employee/overview")
    public ResponseEntity<?> getEmployeeDashboardOverview(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.getEmployeeDashboardOverview(email));
    }

    @GetMapping("/employee/my-knowledge")
    public ResponseEntity<?> getMyKnowledge(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.getMyKnowledge(email));
    }

    @PostMapping("/employee/my-knowledge")
    public ResponseEntity<?> createKnowledgeItem(
            @RequestParam String email,
            @RequestBody KnowledgeItem item) {
        return ResponseEntity.ok(employeeService.createKnowledgeItem(email, item));
    }

    @PutMapping("/employee/my-knowledge/{itemId}")
    public ResponseEntity<?> updateKnowledgeItem(
            @RequestParam String email,
            @PathVariable Long itemId,
            @RequestBody KnowledgeItem updates) {
        return ResponseEntity.ok(employeeService.updateKnowledgeItem(email, itemId, updates));
    }

    @GetMapping("/employee/recommended-resources")
    public ResponseEntity<?> getRecommendedResources(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.getRecommendedResources(email));
    }

    @GetMapping("/employee/search-knowledge")
    public ResponseEntity<?> searchKnowledge(@RequestParam String keyword) {
        return ResponseEntity.ok(employeeService.searchKnowledge(keyword));
    }

    @GetMapping("/employee/knowledge-by-category")
    public ResponseEntity<?> getKnowledgeByCategory(@RequestParam String category) {
        return ResponseEntity.ok(employeeService.getKnowledgeByCategory(category));
    }

    @GetMapping("/employee/knowledge-gaps")
    public ResponseEntity<?> getKnowledgeGaps(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.getKnowledgeGaps(email));
    }

    @GetMapping("/employee/assigned-training")
    public ResponseEntity<?> getAssignedTraining(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.getAssignedTraining(email));
    }

    @PostMapping("/employee/enroll-training")
    public ResponseEntity<?> enrollInTraining(
            @RequestParam String email,
            @RequestBody Map<String, Object> enrollmentData) {
        Long programId = ((Number) enrollmentData.get("programId")).longValue();
        String programTitle = (String) enrollmentData.get("programTitle");
        String provider = (String) enrollmentData.get("provider");
        return ResponseEntity.ok(employeeService.enrollInTraining(email, programId, programTitle, provider));
    }

    @PutMapping("/employee/training-progress/{enrollmentId}")
    public ResponseEntity<?> updateTrainingProgress(
            @PathVariable Long enrollmentId,
            @RequestParam Integer progress) {
        return ResponseEntity.ok(employeeService.updateTrainingProgress(enrollmentId, progress));
    }

    @GetMapping("/employee/learning-progress")
    public ResponseEntity<?> getLearningProgress(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.getLearningProgress(email));
    }

    @GetMapping("/employee/bookmarks")
    public ResponseEntity<?> getBookmarks(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.getBookmarks(email));
    }

    @PostMapping("/employee/bookmarks")
    public ResponseEntity<?> addBookmark(
            @RequestParam String email,
            @RequestBody Map<String, Object> bookmarkData) {
        Long knowledgeItemId = ((Number) bookmarkData.get("knowledgeItemId")).longValue();
        return ResponseEntity.ok(employeeService.addBookmark(email, knowledgeItemId));
    }

    @DeleteMapping("/employee/bookmarks/{bookmarkId}")
    public ResponseEntity<?> removeBookmark(
            @RequestParam String email,
            @PathVariable Long bookmarkId) {
        return ResponseEntity.ok(employeeService.removeBookmark(email, bookmarkId));
    }

    @GetMapping("/employee/my-questions")
    public ResponseEntity<?> getMyQuestions(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.getMyQuestions(email));
    }

    @GetMapping("/employee/recent-questions")
    public ResponseEntity<?> getRecentQuestions() {
        return ResponseEntity.ok(employeeService.getRecentQuestions());
    }

    @PostMapping("/employee/ask-question")
    public ResponseEntity<?> askQuestion(
            @RequestParam String email,
            @RequestBody Question question) {
        return ResponseEntity.ok(employeeService.askQuestion(email, question));
    }

    @GetMapping("/employee/question-answers/{questionId}")
    public ResponseEntity<?> getAnswersForQuestion(@PathVariable Long questionId) {
        return ResponseEntity.ok(employeeService.getAnswersForQuestion(questionId));
    }

    @PostMapping("/employee/answer-question/{questionId}")
    public ResponseEntity<?> answerQuestion(
            @RequestParam String email,
            @PathVariable Long questionId,
            @RequestBody Map<String, String> answerData) {
        String content = answerData.get("content");
        return ResponseEntity.ok(employeeService.answerQuestion(email, questionId, content));
    }

    @PutMapping("/employee/accept-answer/{questionId}/{answerId}")
    public ResponseEntity<?> acceptAnswer(
            @RequestParam String email,
            @PathVariable Long questionId,
            @PathVariable Long answerId) {
        return ResponseEntity.ok(employeeService.acceptAnswer(email, questionId, answerId));
    }

    @PostMapping("/employee/feedback/{knowledgeItemId}")
    public ResponseEntity<?> giveFeedback(
            @RequestParam String email,
            @PathVariable Long knowledgeItemId,
            @RequestBody Feedback feedback) {
        return ResponseEntity.ok(employeeService.giveFeedback(email, knowledgeItemId, feedback));
    }

    @GetMapping("/employee/feedback/{knowledgeItemId}")
    public ResponseEntity<?> getFeedbackOnResource(@PathVariable Long knowledgeItemId) {
        return ResponseEntity.ok(employeeService.getFeedbackOnResource(knowledgeItemId));
    }

    @GetMapping("/employee/recent-activity")
    public ResponseEntity<?> getRecentActivity(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.getRecentActivity(email));
    }
}

