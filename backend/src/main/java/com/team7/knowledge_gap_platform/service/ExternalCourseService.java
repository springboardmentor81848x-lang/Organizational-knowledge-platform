package com.team7.knowledge_gap_platform.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.ExternalCourse;
import com.team7.knowledge_gap_platform.repository.ExternalCourseRepository;

@Service
public class ExternalCourseService {

    private final ExternalCourseRepository externalCourseRepository;

    public ExternalCourseService(
            ExternalCourseRepository externalCourseRepository) {

        this.externalCourseRepository = externalCourseRepository;
    }

    public ExternalCourse saveCourse(ExternalCourse course) {
        return externalCourseRepository.save(course);
    }

    public List<ExternalCourse> getAllCourses() {
        return externalCourseRepository.findAll();
    }

    public List<ExternalCourse> getCoursesBySkill(String skillName) {
        return externalCourseRepository
                .findBySkillNameIgnoreCase(skillName);
    }

    public List<ExternalCourse> getCoursesByLevel(String level) {
        return externalCourseRepository
                .findByLevelIgnoreCase(level);
    }

    public List<ExternalCourse> getCoursesByProvider(String provider) {
        return externalCourseRepository
                .findByProviderIgnoreCase(provider);
    }

    public void deleteCourse(Long id) {
        externalCourseRepository.deleteById(id);
    }
}