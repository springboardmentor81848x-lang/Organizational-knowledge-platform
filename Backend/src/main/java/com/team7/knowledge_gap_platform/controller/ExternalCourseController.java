package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.ExternalCourse;
import com.team7.knowledge_gap_platform.service.ExternalCourseService;

@RestController
@RequestMapping("/external-courses")
public class ExternalCourseController {

    private final ExternalCourseService externalCourseService;

    public ExternalCourseController(
            ExternalCourseService externalCourseService) {

        this.externalCourseService = externalCourseService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR', 'ROLE_LEARNING_DEVELOPMENT_ADMIN')")
    public ResponseEntity<ExternalCourse> saveCourse(
            @RequestBody ExternalCourse course) {

        return ResponseEntity.ok(
                externalCourseService.saveCourse(course)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ADMIN', 'ROLE_DEPARTMENT_HEAD', 'ROLE_LEARNING_DEVELOPMENT_ADMIN', 'ROLE_MENTOR')")
    public ResponseEntity<List<ExternalCourse>> getAllCourses() {

        return ResponseEntity.ok(
                externalCourseService.getAllCourses()
        );
    }

    @GetMapping("/skill/{skillName}")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ADMIN', 'ROLE_DEPARTMENT_HEAD', 'ROLE_LEARNING_DEVELOPMENT_ADMIN', 'ROLE_MENTOR')")
    public ResponseEntity<List<ExternalCourse>> getCoursesBySkill(
            @PathVariable String skillName) {

        return ResponseEntity.ok(
                externalCourseService.getCoursesBySkill(skillName)
        );
    }

    @GetMapping("/level/{level}")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ADMIN', 'ROLE_DEPARTMENT_HEAD', 'ROLE_LEARNING_DEVELOPMENT_ADMIN', 'ROLE_MENTOR')")
    public ResponseEntity<List<ExternalCourse>> getCoursesByLevel(
            @PathVariable String level) {

        return ResponseEntity.ok(
                externalCourseService.getCoursesByLevel(level)
        );
    }

    @GetMapping("/provider/{provider}")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ADMIN', 'ROLE_DEPARTMENT_HEAD', 'ROLE_LEARNING_DEVELOPMENT_ADMIN', 'ROLE_MENTOR')")
    public ResponseEntity<List<ExternalCourse>> getCoursesByProvider(
            @PathVariable String provider) {

        return ResponseEntity.ok(
                externalCourseService.getCoursesByProvider(provider)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR', 'ROLE_LEARNING_DEVELOPMENT_ADMIN')")
    public ResponseEntity<String> deleteCourse(
            @PathVariable Long id) {

        externalCourseService.deleteCourse(id);

        return ResponseEntity.ok(
                "External course deleted successfully"
        );
    }
}