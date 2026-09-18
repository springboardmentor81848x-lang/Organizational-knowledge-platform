package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.gap.DepartmentGapMetricsResponse;
import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.gap.OrgGapMetricsResponse;
import com.orgskills.intelligence.dto.gap.UserGapSummaryResponse;
import com.orgskills.intelligence.service.GapAnalysisService;
import com.orgskills.intelligence.service.HeatmapVisualizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/gaps")
@RequiredArgsConstructor
public class GapAnalysisController {

    private final GapAnalysisService gapAnalysisService;
    private final HeatmapVisualizationService heatmapVisualizationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GapAnalysisResponse>> getUserGaps(@PathVariable Long userId) {
        return ResponseEntity.ok(gapAnalysisService.calculateAndFetchUserGaps(userId));
    }

    @GetMapping("/user/{userId}/stored")
    public ResponseEntity<List<GapAnalysisResponse>> getStoredUserGaps(@PathVariable Long userId) {
        return ResponseEntity.ok(gapAnalysisService.getStoredUserGaps(userId));
    }

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<UserGapSummaryResponse> getUserGapSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(gapAnalysisService.getUserGapSummary(userId));
    }

    @GetMapping("/user/{userId}/missing")
    public ResponseEntity<List<GapAnalysisResponse>> getMissingSkills(@PathVariable Long userId) {
        return ResponseEntity.ok(gapAnalysisService.getMissingSkills(userId));
    }

    @GetMapping("/user/{userId}/proficiency-gaps")
    public ResponseEntity<List<GapAnalysisResponse>> getProficiencyGaps(@PathVariable Long userId) {
        return ResponseEntity.ok(gapAnalysisService.getProficiencyGaps(userId));
    }

    @PostMapping("/user/{userId}/compare-target")
    public ResponseEntity<List<GapAnalysisResponse>> compareTargetRole(
            @PathVariable Long userId,
            @RequestParam String targetJobTitle,
            @RequestParam String targetDepartment) {
        return ResponseEntity.ok(gapAnalysisService.calculateAndFetchTargetRoleGaps(userId, targetJobTitle, targetDepartment));
    }

    @GetMapping("/department/{departmentName}")
    public ResponseEntity<DepartmentGapMetricsResponse> getDepartmentMetrics(@PathVariable String departmentName) {
        return ResponseEntity.ok(gapAnalysisService.getDepartmentMetrics(departmentName));
    }

    @GetMapping("/org-summary")
    public ResponseEntity<OrgGapMetricsResponse> getOrgGapMetrics() {
        return ResponseEntity.ok(gapAnalysisService.getOrgGapMetrics());
    }

    @GetMapping("/heatmap/matrix")
    public ResponseEntity<com.orgskills.intelligence.dto.heatmap.HeatmapMatrixResponse> getHeatmapMatrix(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(heatmapVisualizationService.getHeatmapMatrix(department, category));
    }
}

