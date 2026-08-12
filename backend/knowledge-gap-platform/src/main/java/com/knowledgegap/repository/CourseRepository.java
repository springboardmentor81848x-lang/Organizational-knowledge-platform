package com.knowledgegap.repository;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findBySkill(Skill skill);

    List<Course> findByLevel(String level);

    List<Course> findByPlatform(String platform);

    List<Course> findBySkillAndLevel(Skill skill, String level);
}
