package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.LearningMilestone;
import com.knowledgegap.service.LearningMilestoneService;

@RestController
@RequestMapping("/api/learning-milestones")
@CrossOrigin(origins = "http://localhost:5173")
public class LearningMilestoneController {

    private final LearningMilestoneService
            milestoneService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LearningMilestoneController(
            LearningMilestoneService milestoneService) {

        this.milestoneService =
                milestoneService;
    }


    // =========================================================
    // CREATE MILESTONE
    // =========================================================

    @PostMapping("/course/{courseId}")
    public ResponseEntity<LearningMilestone>
    createMilestone(
            @PathVariable Long courseId,
            @RequestBody LearningMilestone milestone) {

        LearningMilestone created =
                milestoneService.createMilestone(
                        courseId,
                        milestone
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }


    // =========================================================
    // GET MILESTONES BY COURSE
    // =========================================================

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<LearningMilestone>>
    getMilestonesByCourse(
            @PathVariable Long courseId) {

        return ResponseEntity.ok(
                milestoneService
                        .getMilestonesByCourse(
                                courseId
                        )
        );
    }


    // =========================================================
    // GET MILESTONE BY ID
    // =========================================================

    @GetMapping("/{milestoneId}")
    public ResponseEntity<LearningMilestone>
    getMilestone(
            @PathVariable Long milestoneId) {

        return ResponseEntity.ok(
                milestoneService
                        .getMilestoneById(
                                milestoneId
                        )
        );
    }


    // =========================================================
    // UPDATE MILESTONE DETAILS
    // =========================================================

    @PutMapping("/{milestoneId}")
    public ResponseEntity<LearningMilestone>
    updateMilestone(
            @PathVariable Long milestoneId,
            @RequestBody LearningMilestone milestone) {

        return ResponseEntity.ok(
                milestoneService.updateMilestone(
                        milestoneId,
                        milestone
                )
        );
    }


    // =========================================================
    // UPDATE MILESTONE PROGRESS
    // =========================================================

    @PutMapping(
            "/{milestoneId}/progress"
    )
    public ResponseEntity<LearningMilestone>
    updateProgress(
            @PathVariable Long milestoneId,
            @RequestParam Integer progressPercentage) {

        return ResponseEntity.ok(
                milestoneService.updateProgress(
                        milestoneId,
                        progressPercentage
                )
        );
    }


    // =========================================================
    // COMPLETE MILESTONE
    // =========================================================

    @PutMapping(
            "/{milestoneId}/complete"
    )
    public ResponseEntity<LearningMilestone>
    completeMilestone(
            @PathVariable Long milestoneId) {

        return ResponseEntity.ok(
                milestoneService.completeMilestone(
                        milestoneId
                )
        );
    }


    // =========================================================
    // DELETE MILESTONE
    // =========================================================

    @DeleteMapping("/{milestoneId}")
    public ResponseEntity<Void>
    deleteMilestone(
            @PathVariable Long milestoneId) {

        milestoneService.deleteMilestone(
                milestoneId
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}