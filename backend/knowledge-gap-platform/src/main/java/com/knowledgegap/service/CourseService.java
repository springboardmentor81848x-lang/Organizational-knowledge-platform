package com.knowledgegap.service;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // ==================================================
    // GET ALL COURSES
    // ==================================================

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // ==================================================
    // GET COURSE BY ID
    // ==================================================

    public Course getCourseById(Long id) {

        return courseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Course not found with id: " + id
                        )
                );
    }

    // ==================================================
    // GET COURSES BY SKILL
    // ==================================================

    public List<Course> getCoursesBySkill(Skill skill) {
        return courseRepository.findBySkill(skill);
    }

    // ==================================================
    // GET COURSES BY LEVEL
    // ==================================================

    public List<Course> getCoursesByLevel(String level) {
        return courseRepository.findByLevel(level);
    }

    // ==================================================
    // GET COURSES BY PLATFORM
    // ==================================================

    public List<Course> getCoursesByPlatform(String platform) {
        return courseRepository.findByPlatform(platform);
    }

    // ==================================================
    // GET COURSES BY SKILL + LEVEL
    // ==================================================

    public List<Course> getCoursesBySkillAndLevel(
            Skill skill,
            String level) {

        return courseRepository
                .findBySkillAndLevel(skill, level);
    }

    // ==================================================
    // SAVE COURSE
    // ==================================================

    public Course saveCourse(Course course) {
        return courseRepository.save(course);
    }

    // ==================================================
    // DELETE COURSE
    // ==================================================

    public void deleteCourse(Long id) {

        if (!courseRepository.existsById(id)) {
            throw new RuntimeException(
                    "Course not found with id: " + id
            );
        }

        courseRepository.deleteById(id);
    }
}