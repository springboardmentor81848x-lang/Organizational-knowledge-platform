package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Review;
import com.knowledgegap.entity.ReviewType;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Check whether a review already exists
    Optional<Review> findByReviewerAndRevieweeAndReviewType(
            Employee reviewer,
            Employee reviewee,
            ReviewType reviewType
    );

    // Get reviews received by employee for a particular type
    List<Review> findByRevieweeAndReviewType(
            Employee reviewee,
            ReviewType reviewType
    );

    // Get all reviews received by employee
    List<Review> findByReviewee(
            Employee reviewee
    );

    // Get reviews given by employee for a particular type
    List<Review> findByReviewerAndReviewType(
            Employee reviewer,
            ReviewType reviewType
    );
}