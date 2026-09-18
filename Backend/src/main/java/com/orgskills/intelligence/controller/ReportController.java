package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.report.ReportFormat;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.AnalyticsReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

/**
 * Downloadable reports. Each is generated from live queries at request time and rendered in the
 * requested format; nothing is written to disk or reused between calls.
 *
 * <p>Access is scoped by the analytics layer these reports are built on, so a report can never
 * disclose more than the dashboard the same caller could already open.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ReportController {

    private final AnalyticsReportService analyticsReportService;

    @GetMapping("/employee/{id}")
    public ResponseEntity<byte[]> employeeLearningReport(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "pdf") String format) throws IOException {
        return download(analyticsReportService.employeeLearningReport(
                getUserId(authentication), id, ReportFormat.from(format)));
    }

    /** {@code id} is the department name: departments are a property of a user, not an entity. */
    @GetMapping("/department/{id}")
    public ResponseEntity<byte[]> departmentTrainingReport(
            Authentication authentication,
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "pdf") String format) throws IOException {
        return download(analyticsReportService.departmentTrainingReport(
                getUserId(authentication), id, ReportFormat.from(format)));
    }

    /**
     * The organization-wide skill gap report. Named for the training-effectiveness question it
     * answers: which skills the workforce is short on, and by how much.
     */
    @GetMapping("/training-effectiveness")
    public ResponseEntity<byte[]> skillGapReport(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "pdf") String format) throws IOException {
        return download(analyticsReportService.skillGapReport(
                getUserId(authentication), ReportFormat.from(format)));
    }

    private ResponseEntity<byte[]> download(AnalyticsReportService.RenderedReport report) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, report.contentDisposition())
                .contentType(MediaType.parseMediaType(report.contentType()))
                .body(report.content());
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        throw new UnauthorizedException("Not authenticated");
    }
}
