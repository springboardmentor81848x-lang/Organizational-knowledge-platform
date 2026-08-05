package com.knowledgegap.controller;

import com.knowledgegap.dto.KnowledgeGapResponse;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.service.EmployeeService;
import com.knowledgegap.service.GapDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gaps")
@CrossOrigin(origins = "*")
public class GapDetectionController {

    private final GapDetectionService gapDetectionService;
    private final EmployeeService employeeService;

    public GapDetectionController(GapDetectionService gapDetectionService, EmployeeService employeeService) {
        this.gapDetectionService = gapDetectionService;
        this.employeeService = employeeService;
    }

    @PostMapping("/detect/{employeeIdentifier}")
    public ResponseEntity<List<KnowledgeGapResponse>> detectKnowledgeGap(@PathVariable String employeeIdentifier) {
        return employeeService.getEmployeeByIdentifier(employeeIdentifier)
                .map(employee -> ResponseEntity.ok(gapDetectionService.detectKnowledgeGap(employee.getId())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{employeeIdentifier}")
    public ResponseEntity<List<KnowledgeGap>> getKnowledgeGaps(@PathVariable String employeeIdentifier) {
        return employeeService.getEmployeeByIdentifier(employeeIdentifier)
                .map(employee -> ResponseEntity.ok(gapDetectionService.getStoredGapsForEmployee(employee.getId())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
