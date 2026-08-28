package com.knowledgegap.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.dto.ReassessmentRequest;
import com.knowledgegap.dto.ReassessmentResponse;
import com.knowledgegap.entity.AssessmentQuestion;
import com.knowledgegap.service.ReassessmentService;

@RestController
@RequestMapping("/api/employee/reassessment")
@CrossOrigin(origins = "http://localhost:5173")
public class ReassessmentController {

    private final ReassessmentService reassessmentService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ReassessmentController(
            ReassessmentService reassessmentService) {

        this.reassessmentService =
                reassessmentService;
    }


    // =========================================================
    // GET REASSESSMENT QUESTIONS
    // =========================================================

    @GetMapping("/{assessmentId}/questions")
    public ResponseEntity<List<AssessmentQuestion>>
    getReassessmentQuestions(
            @PathVariable Long assessmentId) {

        return ResponseEntity.ok(
                reassessmentService
                        .getReassessmentQuestions(
                                assessmentId
                        )
        );
    }


    // =========================================================
    // GET SAVED REASSESSMENT RESULT
    // =========================================================
    //
    // This endpoint is called when the employee opens the
    // reassessment page.
    //
    // If a previous reassessment exists:
    //     returns saved result.
    //
    // If no reassessment exists:
    //     returns 404.
    //
    // =========================================================

    @GetMapping("/{assessmentId}/result/{employeeIdentifier}")
    public ResponseEntity<ReassessmentResponse>
    getLatestReassessmentResult(
            @PathVariable Long assessmentId,
            @PathVariable String employeeIdentifier) {

        Optional<ReassessmentResponse> result =
                reassessmentService
                        .getLatestReassessmentResult(
                                assessmentId,
                                employeeIdentifier
                        );

        if (result.isPresent()) {

            return ResponseEntity.ok(
                    result.get()
            );
        }

        return ResponseEntity.notFound().build();
    }


    // =========================================================
    // SUBMIT REASSESSMENT
    // =========================================================

    @PostMapping("/submit/{employeeIdentifier}")
    public ResponseEntity<ReassessmentResponse>
    submitReassessment(
            @PathVariable String employeeIdentifier,
            @RequestBody ReassessmentRequest request) {

        // Employee identifier comes from URL.
        request.setEmployeeIdentifier(
                employeeIdentifier
        );


        ReassessmentResponse response =
                reassessmentService
                        .submitReassessment(
                                request
                        );


        return ResponseEntity.ok(
                response
        );
    }
}