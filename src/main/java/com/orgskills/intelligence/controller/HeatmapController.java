package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.heatmap.DepartmentHeatmapMatrixResponse;
import com.orgskills.intelligence.dto.heatmap.HeatmapMatrixResponse;
import com.orgskills.intelligence.service.HeatmapVisualizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * The raw heatmap builders.
 *
 * <p>These endpoints are organisation-wide by construction: they read whichever people the
 * parameters name, and nothing about the caller narrows them. That makes them safe only for the
 * roles whose remit is the whole organisation, which is what the annotations below say. The
 * scoped views each audience actually uses live on their own controllers, where the set of
 * people is decided by who is asking rather than by what they ask for: a manager's direct
 * reports at /api/manager/team/gap-matrix, a department at /api/department-head/gap-matrix, the
 * organisation at /api/hr/gap-matrix.
 *
 * <p>Every method here previously admitted the plain employee role, which meant any signed-in
 * employee could read the entire organisation's person-by-skill gap matrix, their own manager's
 * shortfalls included.
 */
@RestController
@RequestMapping("/api/heatmap")
@RequiredArgsConstructor
public class HeatmapController {

    /** Roles whose remit is the organisation as a whole. */
    private static final String ORG_WIDE_ROLES =
            "hasAnyRole('HR_SPECIALIST', 'HR_ADMIN', 'SYSTEM_ADMIN', 'ADMIN')";

    /** Roles that may look at somebody other than themselves. */
    private static final String SCOPED_MANAGER_ROLES =
            "hasAnyRole('MANAGER', 'DEPARTMENT_HEAD', 'HR_SPECIALIST', 'HR_ADMIN', 'LND_ADMIN', "
                    + "'SYSTEM_ADMIN', 'ADMIN')";

    private final HeatmapVisualizationService heatmapVisualizationService;

    @GetMapping("/matrix")
    @PreAuthorize(ORG_WIDE_ROLES)
    public ResponseEntity<HeatmapMatrixResponse> getHeatmapMatrix(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(heatmapVisualizationService.getHeatmapMatrix(department, category));
    }

    /** Department averages rather than individuals, so the management roles may read it. */
    @GetMapping("/department-matrix")
    @PreAuthorize(SCOPED_MANAGER_ROLES)
    public ResponseEntity<DepartmentHeatmapMatrixResponse> getDepartmentHeatmapMatrix() {
        return ResponseEntity.ok(heatmapVisualizationService.getDepartmentHeatmapMatrix());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("#userId == authentication.principal.userId or " + SCOPED_MANAGER_ROLES)
    public ResponseEntity<HeatmapMatrixResponse> getUserHeatmap(@PathVariable Long userId) {
        return ResponseEntity.ok(heatmapVisualizationService.getUserHeatmap(userId));
    }

    /** Counts across the whole organisation, so it carries the same restriction as the matrix. */
    @GetMapping("/summary")
    @PreAuthorize(ORG_WIDE_ROLES)
    public ResponseEntity<Map<String, Object>> getHeatmapSummary() {
        return ResponseEntity.ok(heatmapVisualizationService.getHeatmapSummaryMetrics());
    }
}
