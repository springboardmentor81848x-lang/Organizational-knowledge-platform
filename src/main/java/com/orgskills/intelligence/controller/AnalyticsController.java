package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.analytics.DepartmentAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.EmployeeAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.OrganizationAnalyticsResponse;
import com.orgskills.intelligence.dto.analytics.TeamAnalyticsResponse;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only analytics dashboards. Every figure is queried live on each request.
 *
 * <p>Authorization is deliberately not expressed as a role annotation here: what a caller may see
 * depends on their relationship to the subject — a manager sees their own reports, a department
 * head their own department — so {@link AnalyticsService} makes that decision with both parties
 * in hand.
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/employee/{id}")
    public ResponseEntity<EmployeeAnalyticsResponse> getEmployeeAnalytics(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getEmployeeAnalytics(getUserId(authentication), id));
    }

    @GetMapping("/team/{managerId}")
    public ResponseEntity<TeamAnalyticsResponse> getTeamAnalytics(
            Authentication authentication,
            @PathVariable Long managerId) {
        return ResponseEntity.ok(analyticsService.getTeamAnalytics(getUserId(authentication), managerId));
    }

    /** {@code deptId} is the department name: departments are a property of a user, not an entity. */
    @GetMapping("/department/{deptId}")
    public ResponseEntity<DepartmentAnalyticsResponse> getDepartmentAnalytics(
            Authentication authentication,
            @PathVariable String deptId) {
        return ResponseEntity.ok(analyticsService.getDepartmentAnalytics(getUserId(authentication), deptId));
    }

    @GetMapping("/organization")
    public ResponseEntity<OrganizationAnalyticsResponse> getOrganizationAnalytics(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getOrganizationAnalytics(getUserId(authentication)));
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        throw new UnauthorizedException("Not authenticated");
    }
}
