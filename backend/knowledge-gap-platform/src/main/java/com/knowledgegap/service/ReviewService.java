package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.ManagerReviewRequest;
import com.knowledgegap.dto.PeerReviewRequest;
import com.knowledgegap.dto.ReviewRatingRequest;
import com.knowledgegap.dto.ReviewRatingResponse;
import com.knowledgegap.dto.ReviewResponse;
import com.knowledgegap.dto.SelfReviewRequest;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Review;
import com.knowledgegap.entity.ReviewRating;
import com.knowledgegap.entity.ReviewType;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.ReviewRatingRepository;
import com.knowledgegap.repository.ReviewRepository;
import com.knowledgegap.repository.SkillRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewRatingRepository reviewRatingRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            ReviewRatingRepository reviewRatingRepository,
            EmployeeRepository employeeRepository,
            SkillRepository skillRepository) {

        this.reviewRepository = reviewRepository;
        this.reviewRatingRepository = reviewRatingRepository;
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
    }

    // =========================================================
    // SELF REVIEW
    // =========================================================

    @Transactional
    public ReviewResponse submitSelfReview(
            SelfReviewRequest request) {

        if (request == null ||
                request.getEmployeeId() == null) {

            throw new IllegalArgumentException(
                    "Employee ID is required."
            );
        }

        Employee employee =
                getEmployee(request.getEmployeeId());

        validateOverallRating(
                request.getOverallRating()
        );

        if (reviewRepository
                .findByReviewerAndRevieweeAndReviewType(
                        employee,
                        employee,
                        ReviewType.SELF
                )
                .isPresent()) {

            throw new IllegalStateException(
                    "Self review has already been submitted."
            );
        }

        Review review = new Review();

        review.setReviewer(employee);
        review.setReviewee(employee);
        review.setReviewType(ReviewType.SELF);

        review.setOverallRating(
                request.getOverallRating()
        );

        review.setComments(
                request.getComments()
        );

        review.setStatus("SUBMITTED");

        review.setCreatedAt(
                LocalDateTime.now()
        );

        review.setUpdatedAt(
                LocalDateTime.now()
        );

        review =
                reviewRepository.save(review);

        saveRatings(
                review,
                request.getRatings()
        );

        return buildResponse(review);
    }

    // =========================================================
    // PEER REVIEW
    // =========================================================

    @Transactional
    public ReviewResponse submitPeerReview(
            PeerReviewRequest request) {

        if (request == null ||
                request.getReviewerId() == null ||
                request.getRevieweeId() == null) {

            throw new IllegalArgumentException(
                    "Reviewer ID and Reviewee ID are required."
            );
        }

        if (request.getReviewerId()
                .equals(request.getRevieweeId())) {

            throw new IllegalArgumentException(
                    "An employee cannot submit a peer review for themselves."
            );
        }

        Employee reviewer =
                getEmployee(
                        request.getReviewerId()
                );

        Employee reviewee =
                getEmployee(
                        request.getRevieweeId()
                );

        validateOverallRating(
                request.getOverallRating()
        );

        if (reviewRepository
                .findByReviewerAndRevieweeAndReviewType(
                        reviewer,
                        reviewee,
                        ReviewType.PEER
                )
                .isPresent()) {

            throw new IllegalStateException(
                    "Peer review has already been submitted for this employee."
            );
        }

        Review review = new Review();

        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setReviewType(ReviewType.PEER);

        review.setOverallRating(
                request.getOverallRating()
        );

        review.setComments(
                request.getComments()
        );

        review.setStatus("SUBMITTED");

        review.setCreatedAt(
                LocalDateTime.now()
        );

        review.setUpdatedAt(
                LocalDateTime.now()
        );

        review =
                reviewRepository.save(review);

        saveRatings(
                review,
                request.getRatings()
        );

        return buildResponse(review);
    }

    // =========================================================
    // MANAGER REVIEW
    // =========================================================

    @Transactional
    public ReviewResponse submitManagerReview(
            ManagerReviewRequest request) {

        if (request == null ||
                request.getManagerId() == null ||
                request.getEmployeeId() == null) {

            throw new IllegalArgumentException(
                    "Manager ID and Employee ID are required."
            );
        }

        if (request.getManagerId()
                .equals(request.getEmployeeId())) {

            throw new IllegalArgumentException(
                    "A manager cannot review themselves."
            );
        }

        Employee manager =
                getEmployee(
                        request.getManagerId()
                );

        Employee employee =
                getEmployee(
                        request.getEmployeeId()
                );

        // Check manager role
        if (manager.getRole() == null) {

            throw new IllegalStateException(
                    "Reviewer does not have an application role."
            );
        }

        String roleName =
                manager.getRole()
                        .getRoleName();

        if (roleName == null ||
                !roleName.equalsIgnoreCase("MANAGER")) {

            throw new IllegalStateException(
                    "Only managers can submit manager reviews."
            );
        }

        validateOverallRating(
                request.getOverallRating()
        );

        if (reviewRepository
                .findByReviewerAndRevieweeAndReviewType(
                        manager,
                        employee,
                        ReviewType.MANAGER
                )
                .isPresent()) {

            throw new IllegalStateException(
                    "Manager review has already been submitted for this employee."
            );
        }

        Review review = new Review();

        review.setReviewer(manager);
        review.setReviewee(employee);
        review.setReviewType(ReviewType.MANAGER);

        review.setOverallRating(
                request.getOverallRating()
        );

        review.setComments(
                request.getComments()
        );

        review.setStatus("SUBMITTED");

        review.setCreatedAt(
                LocalDateTime.now()
        );

        review.setUpdatedAt(
                LocalDateTime.now()
        );

        review =
                reviewRepository.save(review);

        saveRatings(
                review,
                request.getRatings()
        );

        return buildResponse(review);
    }

    // =========================================================
    // GET SELF REVIEWS
    // =========================================================

    public List<ReviewResponse> getSelfReviews(
            Long employeeId) {

        Employee employee =
                getEmployee(employeeId);

        List<Review> reviews =
                reviewRepository
                        .findByRevieweeAndReviewType(
                                employee,
                                ReviewType.SELF
                        );

        return buildResponses(reviews);
    }

    // =========================================================
    // GET REVIEWS RECEIVED BY EMPLOYEE
    // =========================================================

    public List<ReviewResponse> getReceivedReviews(
            Long employeeId) {

        Employee employee =
                getEmployee(employeeId);

        List<Review> reviews =
                reviewRepository
                        .findByReviewee(employee);

        return buildResponses(reviews);
    }

    // =========================================================
    // GET PEER REVIEWS GIVEN BY EMPLOYEE
    // =========================================================

    public List<ReviewResponse> getPeerReviewsGiven(
            Long employeeId) {

        Employee employee =
                getEmployee(employeeId);

        List<Review> reviews =
                reviewRepository
                        .findByReviewerAndReviewType(
                                employee,
                                ReviewType.PEER
                        );

        return buildResponses(reviews);
    }

    // =========================================================
    // GET MANAGER REVIEWS
    // =========================================================

    public List<ReviewResponse> getManagerReviews(
            Long employeeId) {

        Employee employee =
                getEmployee(employeeId);

        List<Review> reviews =
                reviewRepository
                        .findByRevieweeAndReviewType(
                                employee,
                                ReviewType.MANAGER
                        );

        return buildResponses(reviews);
    }

    // =========================================================
    // GET REVIEW BY ID
    // =========================================================

    public ReviewResponse getReviewById(
            Long reviewId) {

        Review review =
                reviewRepository
                        .findById(reviewId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Review not found with ID: "
                                                + reviewId
                                )
                        );

        return buildResponse(review);
    }

    // =========================================================
    // SAVE SKILL RATINGS
    // =========================================================

    private void saveRatings(
            Review review,
            List<ReviewRatingRequest> ratingRequests) {

        if (ratingRequests == null ||
                ratingRequests.isEmpty()) {

            return;
        }

        for (
                ReviewRatingRequest request :
                ratingRequests
        ) {

            if (request == null) {
                continue;
            }

            if (request.getSkillId() == null) {

                throw new IllegalArgumentException(
                        "Skill ID is required for every rating."
                );
            }

            /*
             * ReviewRating uses Integer rating.
             * ReviewRatingRequest may use Double.
             * Therefore convert Double -> Integer.
             */
            Integer skillRating =
                    request.getRating() == null
                            ? null
                            : request.getRating().intValue();

            validateSkillRating(
                    skillRating
            );

            Skill skill =
                    skillRepository
                            .findById(
                                    request.getSkillId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Skill not found with ID: "
                                                    + request.getSkillId()
                                    )
                            );

            ReviewRating rating =
                    new ReviewRating();

            rating.setReview(review);

            rating.setSkill(skill);

            rating.setRating(
                    skillRating
            );

            rating.setComments(
                    request.getComments()
            );

            reviewRatingRepository.save(rating);
        }
    }

    // =========================================================
    // BUILD RESPONSE
    // =========================================================

    private ReviewResponse buildResponse(
            Review review) {

        ReviewResponse response =
                new ReviewResponse();

        response.setId(
                review.getId()
        );

        Employee reviewer =
                review.getReviewer();

        Employee reviewee =
                review.getReviewee();

        response.setReviewerId(
                reviewer.getId()
        );

        response.setReviewerName(
                getEmployeeName(reviewer)
        );

        response.setRevieweeId(
                reviewee.getId()
        );

        response.setRevieweeName(
                getEmployeeName(reviewee)
        );

        response.setReviewType(
                review.getReviewType()
        );

        response.setOverallRating(
                review.getOverallRating()
        );

        response.setComments(
                review.getComments()
        );

        response.setStatus(
                review.getStatus()
        );

        response.setCreatedAt(
                review.getCreatedAt()
        );

        List<ReviewRating> ratings =
                reviewRatingRepository
                        .findByReview(review);

        List<ReviewRatingResponse>
                ratingResponses =
                new ArrayList<>();

        for (ReviewRating rating : ratings) {

            ReviewRatingResponse ratingResponse =
                    new ReviewRatingResponse();

            ratingResponse.setSkillId(
                    rating.getSkill().getId()
            );

            ratingResponse.setSkillName(
                    rating.getSkill().getSkillName()
            );

            /*
             * ReviewRating stores Integer.
             * ReviewRatingResponse expects Double.
             * Therefore convert Integer -> Double.
             */
            ratingResponse.setRating(
                    rating.getRating() == null
                            ? null
                            : rating.getRating().doubleValue()
            );

            ratingResponse.setComments(
                    rating.getComments()
            );

            ratingResponses.add(
                    ratingResponse
            );
        }

        response.setRatings(
                ratingResponses
        );

        return response;
    }

    // =========================================================
    // BUILD RESPONSE LIST
    // =========================================================

    private List<ReviewResponse> buildResponses(
            List<Review> reviews) {

        List<ReviewResponse> responses =
                new ArrayList<>();

        for (Review review : reviews) {

            responses.add(
                    buildResponse(review)
            );
        }

        return responses;
    }

    // =========================================================
    // GET EMPLOYEE
    // =========================================================

    private Employee getEmployee(
            Long employeeId) {

        return employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with ID: "
                                        + employeeId
                        )
                );
    }

    // =========================================================
    // EMPLOYEE NAME
    // =========================================================

    private String getEmployeeName(
            Employee employee) {

        String firstName =
                employee.getFirstName() == null
                        ? ""
                        : employee.getFirstName().trim();

        String lastName =
                employee.getLastName() == null
                        ? ""
                        : employee.getLastName().trim();

        return (firstName + " " + lastName)
                .trim();
    }

    // =========================================================
    // VALIDATE OVERALL RATING
    // =========================================================

    private void validateOverallRating(
            Double rating) {

        if (rating == null) {

            throw new IllegalArgumentException(
                    "Overall rating is required."
            );
        }

        if (rating < 1 || rating > 5) {

            throw new IllegalArgumentException(
                    "Overall rating must be between 1 and 5."
            );
        }
    }

    // =========================================================
    // VALIDATE SKILL RATING
    // =========================================================

    private void validateSkillRating(
            Integer rating) {

        if (rating == null) {

            throw new IllegalArgumentException(
                    "Skill rating is required."
            );
        }

        if (rating < 1 || rating > 5) {

            throw new IllegalArgumentException(
                    "Skill rating must be between 1 and 5."
            );
        }
    }
}