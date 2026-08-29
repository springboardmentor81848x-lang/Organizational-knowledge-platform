package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.analytics.DepartmentAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.EmployeeAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.RecentAssessmentResultSummary;
import com.orgskills.intelligence.dto.analytics.SkillGapDepartmentBreakdown;
import com.orgskills.intelligence.dto.analytics.SkillGapReportRow;
import com.orgskills.intelligence.dto.assessment.SkillProgressionResponse;
import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.report.ReportDocument;
import com.orgskills.intelligence.dto.report.ReportFormat;
import com.orgskills.intelligence.dto.report.ReportSection;
import com.orgskills.intelligence.dto.skill.UserSkillResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * The three downloadable reports, rendered from the same figures the analytics dashboards return.
 *
 * <p>Nothing is pre-generated: each request re-runs the analytics queries and renders the document
 * from the result. A report file cached on disk is a report that quietly stops matching the
 * platform it claims to describe.
 *
 * <p>Sourcing every headline number from {@link AnalyticsService} rather than recomputing it here
 * is deliberate — it is what makes "the report agrees with the dashboard" a property of the design
 * rather than something that has to be checked.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsReportService {

    private static final DateTimeFormatter TIMESTAMP =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'").withZone(ZoneOffset.UTC);

    private final AnalyticsService analyticsService;
    private final GapAnalysisService gapAnalysisService;
    private final AssessmentService assessmentService;
    private final ReportRenderer reportRenderer;

    // ── Employee Learning Report ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public RenderedReport employeeLearningReport(Long actorId, Long employeeId, ReportFormat format)
            throws IOException {
        // Authorization is enforced by the analytics call, which runs before anything is read.
        EmployeeAnalyticsResponse analytics = analyticsService.getEmployeeAnalytics(actorId, employeeId);
        List<GapAnalysisResponse> gaps = gapAnalysisService.getStoredUserGaps(employeeId);
        List<SkillProgressionResponse> progression = assessmentService.getHistory(actorId, employeeId);

        ReportDocument document = new ReportDocument(
                "Employee Learning Report",
                analytics.getFullName() + " · generated " + TIMESTAMP.format(Instant.now()),
                "Employee_Learning_Report_" + employeeId);

        document.section("Employee Details")
                .figure("Name", analytics.getFullName())
                .figure("Email", analytics.getEmail())
                .figure("Job Title", analytics.getJobTitle())
                .figure("Department", analytics.getDepartment())
                .figure("Overall Readiness %", analytics.getGapSummary().getOverallReadinessPercentage())
                .figure("Learning Progress %", analytics.getLearningProgressPercent())
                .figure("Training Enrolled (active)", analytics.getActiveEnrollments())
                .figure("Training Completed", analytics.getCompletedEnrollments())
                .figure("Achievements Earned", analytics.getAchievements().size());

        ReportSection skills = document.section("Skill Profile")
                .columns("Skill", "Category", "Proficiency", "Level Score")
                .emptyMessage("No skills recorded for this employee.");
        for (UserSkillResponse skill : analytics.getSkillProfile()) {
            skills.row(skill.getSkillName(), skill.getSkillCategory(),
                    skill.getProficiencyLevel(), skill.getProficiencyLevel().getScore());
        }

        ReportSection required = document.section("Current vs Required Proficiency")
                .columns("Skill", "Required", "Current", "Gap", "Severity", "Skill On Record")
                .emptyMessage("No role competency profile has been analysed for this employee.");
        for (GapAnalysisResponse gap : gaps) {
            required.row(gap.getSkillName(), gap.getTargetProficiency(), gap.getCurrentProficiency(),
                    gap.getGapScore(), gap.getRiskSeverity(), gap.isMissingSkill() ? "No" : "Yes");
        }

        ReportSection assessments = document.section("Assessment Scores")
                .columns("Skill", "Type", "Previous", "Awarded", "Improvement", "Assessed At")
                .emptyMessage("No assessments have been submitted for this employee.");
        for (RecentAssessmentResultSummary result : analytics.getRecentAssessmentResults()) {
            assessments.row(result.getSkillName(), result.getAssessmentType(),
                    result.getPreviousProficiency(), result.getProficiency(),
                    signed(result.getImprovement()), TIMESTAMP.format(result.getAssessedAt()));
        }

        ReportSection improvement = document.section("Skill Improvement")
                .columns("Skill", "Previous", "Current", "Improvement", "Assessments")
                .emptyMessage("No skill has been assessed yet, so there is nothing to compare.");
        for (SkillProgressionResponse step : progression) {
            improvement.row(step.getSkillName(), step.getPreviousProficiency(),
                    step.getCurrentProficiency(), signed(step.getImprovement()), step.getAssessmentCount());
        }

        ReportSection remaining = document.section("Remaining Gaps")
                .columns("Skill", "Required", "Current", "Gap", "Severity")
                .emptyMessage("No open gaps: this employee meets every requirement of their role.");
        gaps.stream()
                .filter(gap -> gap.getGapScore() != null && gap.getGapScore() > 0.0)
                .forEach(gap -> remaining.row(gap.getSkillName(), gap.getTargetProficiency(),
                        gap.getCurrentProficiency(), gap.getGapScore(), gap.getRiskSeverity()));

        return render(document, format);
    }

    // ── Department Training Report ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public RenderedReport departmentTrainingReport(Long actorId, String department, ReportFormat format)
            throws IOException {
        DepartmentAnalyticsResponse analytics = analyticsService.getDepartmentAnalytics(actorId, department);

        ReportDocument document = new ReportDocument(
                "Department Training Report",
                analytics.getDepartment() + " · generated " + TIMESTAMP.format(Instant.now()),
                "Department_Training_Report_" + department.replaceAll("\\s+", "_"));

        document.section("Training Summary")
                .figure("Department", analytics.getDepartment())
                .figure("Total Employees", analytics.getTotalEmployees())
                .figure("Eligible Employees (with an open gap)", analytics.getEligibleEmployees())
                .figure("Employees Enrolled", analytics.getEmployeesEnrolled())
                .figure("Employees Completed", analytics.getEmployeesCompleted())
                .figure("Total Enrollments", analytics.getTotalEnrollments())
                .figure("Completed Enrollments", analytics.getCompletedEnrollments())
                .figure("Completion %", analytics.getTrainingCompletionRatePercent())
                .figure("Average Progress %", analytics.getAverageLearningProgressPercent())
                .figure("Average Skill Improvement", analytics.getAverageSkillImprovement())
                .figure("Critical Skill Gaps", analytics.getCriticalSkillGapCount());

        ReportSection topGap = document.section("Most Widely Felt Gap")
                .columns("Skill", "Category", "Affected Employees", "Critical", "Average Gap")
                .emptyMessage("No gap analysis has been run for this department yet.");
        if (analytics.getTopGapBySkill() != null) {
            var gap = analytics.getTopGapBySkill();
            topGap.row(gap.getSkillName(), gap.getCategory(), gap.getAffectedEmployees(),
                    gap.getCriticalCount(), gap.getAverageGapScore());
        }

        return render(document, format);
    }

    // ── Skill Gap Report ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public RenderedReport skillGapReport(Long actorId, ReportFormat format) throws IOException {
        List<SkillGapReportRow> rows = analyticsService.getSkillGapAnalytics(actorId);

        ReportDocument document = new ReportDocument(
                "Skill Gap Report",
                "Organization-wide · generated " + TIMESTAMP.format(Instant.now()),
                "Skill_Gap_Report");

        ReportSection perSkill = document.section("Gap By Skill")
                .columns("Skill", "Category", "Required Level", "Current Average",
                        "Average Gap", "Affected Employees", "Severity")
                .emptyMessage("No role competencies are defined, so no skill has a requirement to fall short of.");
        for (SkillGapReportRow row : rows) {
            perSkill.row(row.getSkillName(), row.getCategory(), row.getRequiredLevel(),
                    row.getCurrentAverageLevel(), row.getAverageGapScore(),
                    row.getAffectedEmployees(), row.getSeverity());
        }

        ReportSection breakdown = document.section("Department Breakdown")
                .columns("Skill", "Department", "Affected Employees", "Average Gap")
                .emptyMessage("No department currently records a gap in any required skill.");
        for (SkillGapReportRow row : rows) {
            for (SkillGapDepartmentBreakdown entry : row.getDepartmentBreakdown()) {
                breakdown.row(row.getSkillName(), entry.getDepartment(),
                        entry.getAffectedEmployees(), entry.getAverageGapScore());
            }
        }

        return render(document, format);
    }

    // ── Rendering ───────────────────────────────────────────────────────────────

    private RenderedReport render(ReportDocument document, ReportFormat format) throws IOException {
        byte[] content = reportRenderer.render(document, format);
        String filename = document.getFileBaseName() + "." + format.getExtension();
        return new RenderedReport(content, filename, format.getContentType());
    }

    /** Renders an improvement so a decline is unmistakable rather than an unlabelled negative. */
    private String signed(Integer improvement) {
        if (improvement == null) {
            return "-";
        }
        return improvement > 0 ? "+" + improvement : String.valueOf(improvement);
    }

    /** A finished report: its bytes, and what the browser needs to save it. */
    public record RenderedReport(byte[] content, String filename, String contentType) {

        public String contentDisposition() {
            return "attachment; filename=" + filename;
        }
    }
}
