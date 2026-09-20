package com.okip.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.okip.dto.peerassessment.PeerAnswerRequestDTO;
import com.okip.dto.peerassessment.PeerAssessmentDTO;
import com.okip.dto.peerassessment.PeerAssessmentResultDTO;
import com.okip.dto.peerassessment.PeerDTO;
import com.okip.dto.peerassessment.PeerSkillDTO;
import com.okip.service.peerassessment.PeerAssessmentService;
@RestController
@RequestMapping("/api/peer-assessments")
public class PeerAssessmentController {

    private final PeerAssessmentService service;

    public PeerAssessmentController(
            PeerAssessmentService service
    ) {
        this.service = service;
    }

    /*
     * Get employees who can be selected as peers.
     */
    @GetMapping("/peers")
    public ResponseEntity<List<PeerDTO>> getPeers() {

        return ResponseEntity.ok(
                service.getAvailablePeers()
        );
    }

    /*
     * Get skills belonging to selected peer.
     */
    @GetMapping("/peers/{employeeId}/skills")
    public ResponseEntity<List<PeerSkillDTO>> getPeerSkills(
            @PathVariable Long employeeId
    ) {

        return ResponseEntity.ok(
                service.getPeerSkills(employeeId)
        );
    }

    /*
     * Get peer assessment questions for selected
     * employee + skill.
     */
    @GetMapping("/{employeeId}/{skillId}")
    public ResponseEntity<PeerAssessmentDTO> getAssessment(
            @PathVariable Long employeeId,
            @PathVariable Long skillId
    ) {

        return ResponseEntity.ok(
                service.getPeerAssessment(
                        employeeId,
                        skillId
                )
        );
    }

    /*
     * Start peer assessment.
     */
    @PostMapping("/{employeeId}/{skillId}/start")
    public ResponseEntity<PeerAssessmentResultDTO> start(
            @PathVariable Long employeeId,
            @PathVariable Long skillId
    ) {

        return ResponseEntity.ok(
                service.startAssessment(
                        employeeId,
                        skillId
                )
        );
    }

    /*
     * Submit peer assessment.
     */
    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<PeerAssessmentResultDTO> submit(
            @PathVariable Long attemptId,
            @RequestBody List<PeerAnswerRequestDTO> answers
    ) {

        return ResponseEntity.ok(
                service.submitAssessment(
                        attemptId,
                        answers
                )
        );
    }
}