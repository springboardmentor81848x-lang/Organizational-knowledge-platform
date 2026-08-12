package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.ExternalCourse;
import com.team7.knowledge_gap_platform.service.CourseRecommendationService;

@RestController
@RequestMapping("/course-recommendations")
public class CourseRecommendationController {

    private final CourseRecommendationService courseRecommendationService;

    public CourseRecommendationController(
            CourseRecommendationService courseRecommendationService) {

        this.courseRecommendationService = courseRecommendationService;
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ExternalCourse>> recommendCourses(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                courseRecommendationService
                        .recommendCourses(employeeId)
        );
    }
}