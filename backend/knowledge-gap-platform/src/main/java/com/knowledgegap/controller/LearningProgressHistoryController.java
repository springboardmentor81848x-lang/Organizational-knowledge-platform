package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.entity.LearningProgressHistory;
import com.knowledgegap.service.LearningProgressHistoryService;

@RestController
@RequestMapping("/api/learning-progress-history")
public class LearningProgressHistoryController {

    private final LearningProgressHistoryService historyService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LearningProgressHistoryController(
            LearningProgressHistoryService historyService) {

        this.historyService = historyService;
    }

    // =========================================================
    // GET EMPLOYEE LEARNING HISTORY
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<List<LearningProgressHistory>>
    getEmployeeHistory(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                historyService.getEmployeeHistory(
                        employeeIdentifier
                )
        );
    }

    // =========================================================
    // GET ENROLLMENT LEARNING HISTORY
    // =========================================================

    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<List<LearningProgressHistory>>
    getEnrollmentHistory(
            @PathVariable Long enrollmentId) {

        return ResponseEntity.ok(
                historyService.getEnrollmentHistory(
                        enrollmentId
                )
        );
    }

    // =========================================================
    // GET ALL LEARNING HISTORY
    // =========================================================

    @GetMapping
    public ResponseEntity<List<LearningProgressHistory>>
    getAllHistory() {

        return ResponseEntity.ok(
                historyService.getAllHistory()
        );
    }
}