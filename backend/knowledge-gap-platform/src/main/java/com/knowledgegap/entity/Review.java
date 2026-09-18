
package com.knowledgegap.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

@Entity
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Employee who is being reviewed.
     */
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee reviewee;

    /*
     * Person who is giving the review.
     *
     * For SELF review:
     * reviewer = reviewee
     */
    @ManyToOne
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    /*
     * SELF / PEER / MANAGER
     */
    @Enumerated(EnumType.STRING)
    private ReviewType reviewType;

    /*
     * SUBMITTED / DRAFT etc.
     */
    private String status;

    /*
     * Overall rating from 1 to 5.
     */
    private Double overallRating;

    /*
     * Overall comments.
     */
    private String comments;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /*
     * Skill-wise ratings are stored in ReviewRating.
     */
    @OneToMany(
            mappedBy = "review",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ReviewRating> ratings = new ArrayList<>();

    public Review() {
    }

    // =========================================================
    // ID
    // =========================================================

    public Long getId() {
        return id;
    }

    // =========================================================
    // REVIEWEE
    // =========================================================

    public Employee getReviewee() {
        return reviewee;
    }

    public void setReviewee(Employee reviewee) {
        this.reviewee = reviewee;
    }

    // =========================================================
    // REVIEWER
    // =========================================================

    public Employee getReviewer() {
        return reviewer;
    }

    public void setReviewer(Employee reviewer) {
        this.reviewer = reviewer;
    }

    // =========================================================
    // REVIEW TYPE
    // =========================================================

    public ReviewType getReviewType() {
        return reviewType;
    }

    public void setReviewType(ReviewType reviewType) {
        this.reviewType = reviewType;
    }

    // =========================================================
    // STATUS
    // =========================================================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // =========================================================
    // OVERALL RATING
    // =========================================================

    public Double getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(Double overallRating) {
        this.overallRating = overallRating;
    }

    // =========================================================
    // COMMENTS
    // =========================================================

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    // =========================================================
    // CREATED AT
    // =========================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // =========================================================
    // UPDATED AT
    // =========================================================

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // =========================================================
    // SKILL RATINGS
    // =========================================================

    public List<ReviewRating> getRatings() {
        return ratings;
    }

    public void setRatings(List<ReviewRating> ratings) {
        this.ratings = ratings;
    }
}

