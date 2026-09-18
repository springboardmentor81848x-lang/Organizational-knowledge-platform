package com.orgskills.intelligence.dto.analytics;

import com.orgskills.intelligence.dto.employee.AchievementResponse;
import com.orgskills.intelligence.dto.gap.UserGapSummaryResponse;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.dto.skill.UserSkillResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/** Everything one employee's dashboard shows, assembled from live queries on each request. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeAnalyticsResponse {
    private Long employeeId;
    private String fullName;
    private String email;
    private String jobTitle;
    private String department;

    private List<UserSkillResponse> skillProfile;
    private UserGapSummaryResponse gapSummary;
    private List<LearningPathSummary> activeLearningPaths;

    /** Mean completion across the employee's enrolments, 0-100. */
    private Double learningProgressPercent;
    private Long activeEnrollments;
    private Long completedEnrollments;

    private List<AchievementResponse> achievements;
    private List<UpcomingSessionSummary> upcomingSessions;

    /** The employee's current mentorship as mentee, or null when they have none. */
    private MentorshipResponse activeMentor;

    private List<RecentAssessmentResultSummary> recentAssessmentResults;

    private Instant generatedAt;
}
