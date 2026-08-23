package com.team7.knowledge_gap_platform.controller;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.service.ReportService;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(
            ReportService reportService) {

        this.reportService = reportService;
    }

    // =========================================================
    // EMPLOYEE REPORT
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Map<String, Object>>
    getEmployeeReport(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                reportService
                        .getEmployeeReport(
                                employeeId));
    }

    // =========================================================
    // DEPARTMENT REPORT
    // =========================================================

    @GetMapping("/department/{departmentName}")
    public ResponseEntity<Map<String, Object>>
    getDepartmentReport(
            @PathVariable String departmentName) {

        return ResponseEntity.ok(
                reportService
                        .getDepartmentReport(
                                departmentName));
    }

    // =========================================================
    // ORGANIZATION REPORT
    // =========================================================

    @GetMapping("/organization")
    public ResponseEntity<Map<String, Object>>
    getOrganizationReport() {

        return ResponseEntity.ok(
                reportService
                        .getOrganizationReport());
    }

    // =========================================================
    // EMPLOYEE PDF EXPORT
    // =========================================================

    @GetMapping(
            value = "/employee/{employeeId}/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]>
    exportEmployeePdf(
            @PathVariable Long employeeId) {

        byte[] pdf =
                reportService
                        .generateEmployeePdf(
                                employeeId);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=employee-"
                                + employeeId
                                + "-report.pdf")
                .contentType(
                        MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // =========================================================
    // EMPLOYEE EXCEL EXPORT
    // =========================================================

    @GetMapping(
            value = "/employee/{employeeId}/excel",
            produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]>
    exportEmployeeExcel(
            @PathVariable Long employeeId) {

        byte[] excel =
                reportService
                        .generateEmployeeExcel(
                                employeeId);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=employee-"
                                + employeeId
                                + "-report.xlsx")
                .contentType(
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }
}