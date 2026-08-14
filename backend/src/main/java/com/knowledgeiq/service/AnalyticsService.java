package com.knowledgeiq.service;

import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEmployees", userRepository.count());
        summary.put("totalSkillsTracked", skillRepository.count());
        summary.put("totalAssessmentsCompleted", employeeSkillRepository.count());
        summary.put("activeCourseEnrollments", enrollmentRepository.count());
        
        long totalUsers = userRepository.count();
        double totalReadiness = 0.0;
        if (totalUsers > 0) {
            long usersWithGaps = 0;
            for (com.knowledgeiq.model.User user : userRepository.findAll()) {
                if (user.getRole() != null) {
                    List<com.knowledgeiq.dto.SkillGapDto> gaps = gapAnalysisService.calculateUserGaps(user.getId());
                    boolean hasGap = gaps.stream().anyMatch(g -> g.getCurrentLevel() < g.getRequiredLevel());
                    if (!hasGap) usersWithGaps++; // Users without gaps are 100% ready. Wait, users with gaps are NOT ready.
                    // Actually, let's just do a simple average of currentLevel / requiredLevel.
                    double userScore = 0;
                    if (!gaps.isEmpty()) {
                        double sum = 0;
                        for (com.knowledgeiq.dto.SkillGapDto gap : gaps) {
                            sum += Math.min(1.0, (double) gap.getCurrentLevel() / Math.max(1, gap.getRequiredLevel()));
                        }
                        userScore = (sum / gaps.size()) * 100;
                    }
                    totalReadiness += userScore;
                }
            }
            summary.put("workforceReadinessScore", Math.round(totalReadiness / totalUsers));
        } else {
            summary.put("workforceReadinessScore", 0);
        }
        
        return summary;
    }

    public String generateGapReportCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("User ID,Full Name,Email,Department,Role,Skill Name,Category,Current Level,Required Level,Gap Level,Is Critical\n");
        for (com.knowledgeiq.model.User user : userRepository.findAll()) {
            if (user.getRole() != null) {
                List<com.knowledgeiq.dto.SkillGapDto> gaps = gapAnalysisService.calculateUserGaps(user.getId());
                for (com.knowledgeiq.dto.SkillGapDto g : gaps) {
                    int gapLvl = Math.max(0, g.getRequiredLevel() - g.getCurrentLevel());
                    csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,%d,%d,%s\n",
                            user.getId(),
                            user.getFullName(),
                            user.getEmail(),
                            user.getDepartment() != null ? user.getDepartment().getName() : "Unassigned",
                            user.getRole() != null ? user.getRole().getTitle() : "Unassigned",
                            g.getSkillName(),
                            g.getCategoryName(),
                            g.getCurrentLevel(),
                            g.getRequiredLevel(),
                            gapLvl,
                            g.getIsCritical() != null && g.getIsCritical() ? "YES" : "NO"
                    ));
                }
            }
        }
        return csv.toString();
    }

    public String generateTrainingReportCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("Enrollment ID,User Name,User Email,Course Title,Provider,Status,Progress %,Enrolled At,Completed At\n");
        for (com.knowledgeiq.model.CourseEnrollment e : enrollmentRepository.findAll()) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",\"%s\"\n",
                    e.getId(),
                    e.getUser() != null ? e.getUser().getFullName() : "N/A",
                    e.getUser() != null ? e.getUser().getEmail() : "N/A",
                    e.getCourse() != null ? e.getCourse().getTitle() : "N/A",
                    e.getCourse() != null ? e.getCourse().getProvider() : "Internal",
                    e.getStatus(),
                    e.getProgressPercent() != null ? e.getProgressPercent() : 0,
                    e.getEnrolledAt() != null ? e.getEnrolledAt().toString() : "N/A",
                    e.getCompletedAt() != null ? e.getCompletedAt().toString() : "N/A"
            ));
        }
        return csv.toString();
    }
}
