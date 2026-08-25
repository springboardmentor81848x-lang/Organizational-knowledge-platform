package com.knowledgegap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class ReviewRating {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

/*
 * Review to which this rating belongs.
 */
@ManyToOne
@JoinColumn(name = "review_id", nullable = false)
private Review review;

/*
 * Skill being rated.
 */
@ManyToOne
@JoinColumn(name = "skill_id", nullable = false)
private Skill skill;

/*
 * Rating from 1 to 5.
 */
@Column(nullable = false)
private Integer rating;

/*
 * Optional skill-specific feedback.
 */
@Column(columnDefinition = "TEXT")
private String comments;

public ReviewRating() {
}

public Long getId() {
    return id;
}

public Review getReview() {
    return review;
}

public void setReview(Review review) {
    this.review = review;
}

public Skill getSkill() {
    return skill;
}

public void setSkill(Skill skill) {
    this.skill = skill;
}

public Integer getRating() {
    return rating;
}

public void setRating(Integer rating) {
    this.rating = rating;
}

public String getComments() {
    return comments;
}

public void setComments(String comments) {
    this.comments = comments;
}

}
