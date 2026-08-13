package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.dto.AssessmentResultResponse;
import com.team7.knowledge_gap_platform.dto.AssessmentSubmitRequest;
import com.team7.knowledge_gap_platform.entity.Assessment;
import com.team7.knowledge_gap_platform.entity.AssessmentQuestion;
import com.team7.knowledge_gap_platform.service.AssessmentService;

@RestController
@RequestMapping("/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(
            AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping
    public ResponseEntity<Assessment> createAssessment(
            @RequestBody Assessment assessment) {

        return ResponseEntity.ok(
                assessmentService.createAssessment(assessment)
        );
    }

    @PostMapping("/questions")
    public ResponseEntity<AssessmentQuestion> addQuestion(
            @RequestBody AssessmentQuestion question) {

        return ResponseEntity.ok(
                assessmentService.addQuestion(question)
        );
    }

    @GetMapping("/{assessmentId}/questions")
    public ResponseEntity<List<AssessmentQuestion>> getQuestions(
            @PathVariable Long assessmentId) {

        return ResponseEntity.ok(
                assessmentService.getQuestions(assessmentId)
        );
    }

    @PostMapping("/{assessmentId}/submit")
    public ResponseEntity<AssessmentResultResponse> submitAssessment(
            @PathVariable Long assessmentId,
            @RequestBody AssessmentSubmitRequest request) {

        return ResponseEntity.ok(
                assessmentService.submitAssessment(
                        assessmentId,
                        request)
        );
    }
}