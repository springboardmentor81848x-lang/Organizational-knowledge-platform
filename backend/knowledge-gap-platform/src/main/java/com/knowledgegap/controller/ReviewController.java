package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.dto.ManagerReviewRequest;
import com.knowledgegap.dto.PeerReviewRequest;
import com.knowledgegap.dto.ReviewResponse;
import com.knowledgegap.dto.SelfReviewRequest;
import com.knowledgegap.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // =========================================================
    // SELF REVIEW
    // =========================================================

    @PostMapping("/self")
    public ResponseEntity<ReviewResponse> submitSelfReview(
            @RequestBody SelfReviewRequest request) {

        ReviewResponse response =
                reviewService.submitSelfReview(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // PEER REVIEW
    // =========================================================

    @PostMapping("/peer")
    public ResponseEntity<ReviewResponse> submitPeerReview(
            @RequestBody PeerReviewRequest request) {

        ReviewResponse response =
                reviewService.submitPeerReview(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // MANAGER REVIEW
    // =========================================================

    @PostMapping("/manager")
    public ResponseEntity<ReviewResponse> submitManagerReview(
            @RequestBody ManagerReviewRequest request) {

        ReviewResponse response =
                reviewService.submitManagerReview(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // GET SELF REVIEWS
    // =========================================================

    @GetMapping("/employee/{employeeId}/self")
    public ResponseEntity<List<ReviewResponse>> getSelfReviews(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                reviewService.getSelfReviews(employeeId)
        );
    }

    // =========================================================
    // GET ALL REVIEWS RECEIVED BY EMPLOYEE
    // =========================================================

    @GetMapping("/employee/{employeeId}/received")
    public ResponseEntity<List<ReviewResponse>> getReceivedReviews(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                reviewService.getReceivedReviews(employeeId)
        );
    }

    // =========================================================
    // GET PEER REVIEWS GIVEN BY EMPLOYEE
    // =========================================================

    @GetMapping("/employee/{employeeId}/peer")
    public ResponseEntity<List<ReviewResponse>> getPeerReviewsGiven(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                reviewService.getPeerReviewsGiven(employeeId)
        );
    }

    // =========================================================
    // GET MANAGER REVIEWS
    // =========================================================

    @GetMapping("/employee/{employeeId}/manager")
    public ResponseEntity<List<ReviewResponse>> getManagerReviews(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                reviewService.getManagerReviews(employeeId)
        );
    }

    // =========================================================
    // GET REVIEW BY ID
    // =========================================================

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReviewById(
            @PathVariable Long reviewId) {

        return ResponseEntity.ok(
                reviewService.getReviewById(reviewId)
        );
    }
}