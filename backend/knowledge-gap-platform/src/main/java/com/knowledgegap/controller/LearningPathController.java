package com.knowledgegap.controller;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.LearningPath;
import com.knowledgegap.entity.LearningPathCourse;
import com.knowledgegap.service.EmployeeService;
import com.knowledgegap.service.LearningPathService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning-paths")
@CrossOrigin(origins = "*")
public class LearningPathController {

    private final LearningPathService learningPathService;
    private final EmployeeService employeeService;

    public LearningPathController(
            LearningPathService learningPathService,
            EmployeeService employeeService) {

        this.learningPathService = learningPathService;
        this.employeeService = employeeService;
    }

    // =========================================================
    // GENERATE PERSONALIZED LEARNING PATH
    // =========================================================

    @PostMapping("/generate/{employeeIdentifier}")
    public ResponseEntity<LearningPath> generateLearningPath(
            @PathVariable String employeeIdentifier) {

        Optional<Employee> employee =
                employeeService.getEmployeeByIdentifier(
                        employeeIdentifier
                );

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        LearningPath learningPath =
                learningPathService.generateLearningPath(
                        employee.get()
                );

        return ResponseEntity.ok(learningPath);
    }

    // =========================================================
    // GET LEARNING PATHS OF AN EMPLOYEE
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<List<LearningPath>> getLearningPaths(
            @PathVariable String employeeIdentifier) {

        Optional<Employee> employee =
                employeeService.getEmployeeByIdentifier(
                        employeeIdentifier
                );

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<LearningPath> learningPaths =
                learningPathService
                        .getLearningPathsByEmployee(
                                employee.get()
                        );

        return ResponseEntity.ok(learningPaths);
    }

    // =========================================================
    // GET COURSES INSIDE A LEARNING PATH
    // =========================================================

    @GetMapping("/{learningPathId}/courses")
    public ResponseEntity<List<LearningPathCourse>>
    getLearningPathCourses(
            @PathVariable Long learningPathId) {

        try {

            LearningPath learningPath =
                    learningPathService
                            .getLearningPathById(
                                    learningPathId
                            );

            List<LearningPathCourse> courses =
                    learningPathService
                            .getCoursesByLearningPath(
                                    learningPath
                            );

            return ResponseEntity.ok(courses);

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }
}