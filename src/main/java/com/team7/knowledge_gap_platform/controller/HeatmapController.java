package com.team7.knowledge_gap_platform.controller;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.dto.HeatmapResponse;
import com.team7.knowledge_gap_platform.service.HeatmapService;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;

@RestController
@RequestMapping("/heatmap")
public class HeatmapController {

    private static final Logger logger = LoggerFactory.getLogger(HeatmapController.class);
    private final HeatmapService heatmapService;
    private final EmployeeRepository employeeRepository;

    public HeatmapController(HeatmapService heatmapService, EmployeeRepository employeeRepository) {
        this.heatmapService = heatmapService;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    public ResponseEntity<List<HeatmapResponse>> getHeatmapData() {
        return ResponseEntity.ok(
                heatmapService.getHeatmapData()
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getHeatmapByEmployee(
            @PathVariable Long employeeId) {

        logger.info("REST request to get heatmap for employee: {}", employeeId);
        if (!hasAccessToEmployee(employeeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You can only view your own heatmap.");
        }

        return ResponseEntity.ok(
                heatmapService.getHeatmapByEmployee(employeeId)
        );
    }

    private boolean hasAccessToEmployee(Long employeeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;

        boolean isManagerOrAbove = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER") || 
                               a.getAuthority().equals("ROLE_HR") || 
                               a.getAuthority().equals("ROLE_ADMIN"));
        
        if (isManagerOrAbove) return true;

        String email = authentication.getName();
        return employeeRepository.findByEmail(email)
                .map(e -> e.getId().equals(employeeId))
                .orElse(false);
    }
}
