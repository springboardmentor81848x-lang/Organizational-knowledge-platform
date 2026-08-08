package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.dto.HeatmapResponse;
import com.team7.knowledge_gap_platform.service.HeatmapService;

@RestController
@RequestMapping("/heatmap")
public class HeatmapController {

    private final HeatmapService heatmapService;

    public HeatmapController(HeatmapService heatmapService) {
        this.heatmapService = heatmapService;
    }

    @GetMapping
    public ResponseEntity<List<HeatmapResponse>> getHeatmapData() {
        return ResponseEntity.ok(
                heatmapService.getHeatmapData()
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<HeatmapResponse>> getHeatmapByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                heatmapService.getHeatmapByEmployee(employeeId)
        );
    }
}