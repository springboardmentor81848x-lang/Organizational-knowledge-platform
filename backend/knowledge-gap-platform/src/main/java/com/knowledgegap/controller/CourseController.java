package com.knowledgegap.controller;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.SkillRepository;
import com.knowledgegap.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private final CourseService courseService;
    private final SkillRepository skillRepository;

    public CourseController(
            CourseService courseService,
            SkillRepository skillRepository) {

        this.courseService = courseService;
        this.skillRepository = skillRepository;
    }

    // ==================================================
    // GET ALL COURSES
    // ==================================================

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {

        return ResponseEntity.ok(
                courseService.getAllCourses()
        );
    }

    // ==================================================
    // GET COURSE BY ID
    // ==================================================

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                courseService.getCourseById(id)
        );
    }

    // ==================================================
    // GET COURSES BY SKILL
    // ==================================================

    @GetMapping("/skill/{skillId}")
    public ResponseEntity<List<Course>> getCoursesBySkill(
            @PathVariable Long skillId) {

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Skill not found with id: " + skillId
                        )
                );

        return ResponseEntity.ok(
                courseService.getCoursesBySkill(skill)
        );
    }

    // ==================================================
    // GET COURSES BY LEVEL
    // ==================================================

    @GetMapping("/level/{level}")
    public ResponseEntity<List<Course>> getCoursesByLevel(
            @PathVariable String level) {

        return ResponseEntity.ok(
                courseService.getCoursesByLevel(level)
        );
    }

    // ==================================================
    // GET COURSES BY PLATFORM
    // ==================================================

    @GetMapping("/platform/{platform}")
    public ResponseEntity<List<Course>> getCoursesByPlatform(
            @PathVariable String platform) {

        return ResponseEntity.ok(
                courseService.getCoursesByPlatform(platform)
        );
    }

    // ==================================================
    // GET COURSES BY SKILL + LEVEL
    // ==================================================

    @GetMapping("/skill/{skillId}/level/{level}")
    public ResponseEntity<List<Course>>
    getCoursesBySkillAndLevel(
            @PathVariable Long skillId,
            @PathVariable String level) {

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Skill not found with id: " + skillId
                        )
                );

        return ResponseEntity.ok(
                courseService.getCoursesBySkillAndLevel(
                        skill,
                        level
                )
        );
    }

    // ==================================================
    // CREATE COURSE
    // ==================================================

    @PostMapping
    public ResponseEntity<Course> createCourse(
            @RequestBody Course course) {

        return ResponseEntity.ok(
                courseService.saveCourse(course)
        );
    }

    // ==================================================
    // UPDATE COURSE
    // ==================================================

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable Long id,
            @RequestBody Course updatedCourse) {

        Course existingCourse =
                courseService.getCourseById(id);

        existingCourse.setTitle(
                updatedCourse.getTitle()
        );

        existingCourse.setDescription(
                updatedCourse.getDescription()
        );

        existingCourse.setPlatform(
                updatedCourse.getPlatform()
        );

        existingCourse.setSkill(
                updatedCourse.getSkill()
        );

        existingCourse.setLevel(
                updatedCourse.getLevel()
        );

        existingCourse.setDuration(
                updatedCourse.getDuration()
        );

        existingCourse.setCourseUrl(
                updatedCourse.getCourseUrl()
        );

        return ResponseEntity.ok(
                courseService.saveCourse(existingCourse)
        );
    }

    // ==================================================
    // DELETE COURSE
    // ==================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable Long id) {

        courseService.deleteCourse(id);

        return ResponseEntity.noContent().build();
    }
}