package com.okip.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.gap.GapAnalysisResponseDTO;
import com.okip.service.gap.GapAnalysisService;

@RestController
@RequestMapping("/api/gap-analysis")
public class GapAnalysisController {

    private final GapAnalysisService gapAnalysisService;

    public GapAnalysisController(
            GapAnalysisService gapAnalysisService) {

        this.gapAnalysisService = gapAnalysisService;
    }

    /**
     * Run Gap Analysis
     */
    @PostMapping("/run/{employeeId}")
    public ResponseEntity<GapAnalysisResponseDTO>
            runGapAnalysis(
                    @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                gapAnalysisService.runGapAnalysis(
                        employeeId));
    }

    /**
     * View Gap Analysis of an Employee
     */
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<GapAnalysisResponseDTO>
            getEmployeeGapAnalysis(
                    @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                gapAnalysisService
                        .getEmployeeGapAnalysis(employeeId));
    }

    /**
     * Logged-in Employee
     */
    @GetMapping("/my")
    public ResponseEntity<GapAnalysisResponseDTO>
            getMyGapAnalysis() {

        return ResponseEntity.ok(
                gapAnalysisService
                        .getMyGapAnalysis());
    }

}