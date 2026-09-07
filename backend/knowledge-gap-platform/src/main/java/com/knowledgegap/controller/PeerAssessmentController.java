package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.dto.AssessmentResultResponse;
import com.knowledgegap.dto.PeerAssessmentSubmitRequest;
import com.knowledgegap.dto.PeerEmployeeResponse;
import com.knowledgegap.dto.PeerEmployeeSkillResponse;
import com.knowledgegap.dto.PeerReviewResponse;
import com.knowledgegap.service.PeerAssessmentService;

@RestController
@RequestMapping("/api/peer-assessment")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class PeerAssessmentController {

    private final PeerAssessmentService peerAssessmentService;

    public PeerAssessmentController(
            PeerAssessmentService peerAssessmentService) {
        this.peerAssessmentService = peerAssessmentService;
    }

    // =========================================================
    // GET EMPLOYEES AVAILABLE FOR PEER ASSESSMENT
    // =========================================================

    @GetMapping("/employees/{evaluatorIdentifier}")
    public ResponseEntity<List<PeerEmployeeResponse>> getPeerEmployees(
            @PathVariable String evaluatorIdentifier) {

        return ResponseEntity.ok(
                peerAssessmentService.getPeerEmployees(
                        evaluatorIdentifier
                )
        );
    }

    // =========================================================
    // GET SKILLS OF EMPLOYEE BEING EVALUATED
    // =========================================================

    @GetMapping("/employees/{employeeIdentifier}/skills")
    public ResponseEntity<List<PeerEmployeeSkillResponse>> getEmployeeSkills(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                peerAssessmentService.getEmployeeSkills(
                        employeeIdentifier
                )
        );
    }

    // =========================================================
    // SUBMIT PEER ASSESSMENT
    // =========================================================

    @PostMapping("/submit/{evaluatorIdentifier}")
    public ResponseEntity<AssessmentResultResponse> submitPeerAssessment(
            @PathVariable String evaluatorIdentifier,
            @RequestBody PeerAssessmentSubmitRequest request) {

        return ResponseEntity.ok(
                peerAssessmentService.submitPeerAssessment(
                        evaluatorIdentifier,
                        request
                )
        );
    }

    // =========================================================
    // GET PEER REVIEWS RECEIVED BY EMPLOYEE
    // =========================================================

    @GetMapping("/reviews/{employeeIdentifier}")
    public ResponseEntity<List<PeerReviewResponse>> getPeerReviews(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                peerAssessmentService.getPeerReviews(
                        employeeIdentifier
                )
        );
    }
}