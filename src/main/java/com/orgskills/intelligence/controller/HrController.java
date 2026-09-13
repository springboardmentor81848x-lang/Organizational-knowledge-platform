package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.auth.UserProfileResponse;
import com.orgskills.intelligence.dto.heatmap.HeatmapMatrixResponse;
import com.orgskills.intelligence.dto.hr.GapTrendPoint;
import com.orgskills.intelligence.dto.hr.SkillInventoryResponse;
import com.orgskills.intelligence.dto.hr.TrainingEffectivenessResponse;
import com.orgskills.intelligence.dto.manager.GapHeatmapResponse;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.HrIntelligenceService;
import com.orgskills.intelligence.service.ReportGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR_SPECIALIST', 'HR_ADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
public class HrController {

    private final HrIntelligenceService hrIntelligenceService;
    private final ReportGenerationService reportGenerationService;

    @GetMapping("/gap-intelligence")
    public ResponseEntity<GapHeatmapResponse> getOrgGapIntelligence(
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(hrIntelligenceService.getOrgGapIntelligence(department));
    }

    /**
     * The person-by-skill matrix for the whole organisation, or for one department within it.
     * The same shape a manager gets for their reports, so the same component renders both and
     * the difference between the two views is only ever the set of people in them.
     */
    @GetMapping("/gap-matrix")
    public ResponseEntity<HeatmapMatrixResponse> getOrgGapMatrix(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(hrIntelligenceService.getOrgGapMatrix(department, category));
    }

    @GetMapping("/skill-inventory")
    public ResponseEntity<List<SkillInventoryResponse>> getSkillInventory() {
        return ResponseEntity.ok(hrIntelligenceService.getWorkforceSkillInventory());
    }

    @GetMapping("/training-effectiveness")
    public ResponseEntity<List<TrainingEffectivenessResponse>> getTrainingEffectiveness() {
        return ResponseEntity.ok(hrIntelligenceService.getTrainingEffectiveness());
    }

    @GetMapping("/gap-trends")
    public ResponseEntity<List<GapTrendPoint>> getGapTrends(
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(hrIntelligenceService.getGapTrends(department));
    }

    @GetMapping("/employees")
    public ResponseEntity<List<UserProfileResponse>> searchEmployees(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Role role) {
        return ResponseEntity.ok(hrIntelligenceService.searchEmployees(query, department, role));
    }

    @PutMapping("/employees/{id}/department")
    public ResponseEntity<UserProfileResponse> updateEmployeeDepartment(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String jobTitle) {
        Long actorId = getUserId(authentication);
        return ResponseEntity.ok(hrIntelligenceService.updateEmployeeDepartment(actorId, id, department, jobTitle));
    }

    // ── Reports Management (PDF & Excel) ────────────────────────────────────────

    @GetMapping("/reports/skill-gap-summary")
    public ResponseEntity<byte[]> downloadSkillGapSummary(
            @RequestParam(required = false, defaultValue = "pdf") String format,
            @RequestParam(required = false) String department) throws IOException {

        if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
            byte[] bytes = reportGenerationService.generateSkillGapSummaryExcel(department);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Skill_Gap_Summary.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(bytes);
        } else {
            byte[] bytes = reportGenerationService.generateSkillGapSummaryPdf(department);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Skill_Gap_Summary.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(bytes);
        }
    }

    @GetMapping("/reports/training-effectiveness")
    public ResponseEntity<byte[]> downloadTrainingEffectiveness(
            @RequestParam(required = false, defaultValue = "pdf") String format) throws IOException {

        if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
            byte[] bytes = reportGenerationService.generateTrainingEffectivenessExcel();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Training_Effectiveness.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(bytes);
        } else {
            byte[] bytes = reportGenerationService.generateTrainingEffectivenessPdf();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Training_Effectiveness.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(bytes);
        }
    }

    @GetMapping("/reports/workforce-planning")
    public ResponseEntity<byte[]> downloadWorkforcePlanning(
            @RequestParam(required = false, defaultValue = "pdf") String format) throws IOException {

        if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
            byte[] bytes = reportGenerationService.generateWorkforcePlanningExcel();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Workforce_Planning.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(bytes);
        } else {
            byte[] bytes = reportGenerationService.generateWorkforcePlanningPdf();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Workforce_Planning.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(bytes);
        }
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        return 1L;
    }
}
