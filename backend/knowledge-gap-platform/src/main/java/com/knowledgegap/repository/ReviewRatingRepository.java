package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.knowledgegap.entity.Review;
import com.knowledgegap.entity.ReviewRating;

@Repository
public interface ReviewRatingRepository
extends JpaRepository<ReviewRating, Long> {

List<ReviewRating> findByReview(Review review);

void deleteByReview(Review review);

}

