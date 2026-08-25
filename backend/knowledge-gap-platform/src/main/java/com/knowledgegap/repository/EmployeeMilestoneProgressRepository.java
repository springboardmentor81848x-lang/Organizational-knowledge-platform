package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeMilestoneProgress;
import com.knowledgegap.entity.LearningMilestone;

public interface EmployeeMilestoneProgressRepository
        extends JpaRepository<EmployeeMilestoneProgress, Long> {

    // =========================================================
    // GET ALL EMPLOYEE MILESTONE PROGRESS
    // =========================================================

    List<EmployeeMilestoneProgress> findByEmployee(
            Employee employee
    );

    // =========================================================
    // GET PROGRESS FOR EMPLOYEE + MILESTONE
    // =========================================================

    Optional<EmployeeMilestoneProgress>
    findByEmployeeAndMilestone(
            Employee employee,
            LearningMilestone milestone
    );

    // =========================================================
    // GET ALL PROGRESS FOR EMPLOYEE + COURSE
    // =========================================================

    List<EmployeeMilestoneProgress>
    findByEmployeeAndMilestone_CourseOrderByMilestone_MilestoneOrderAsc(
            Employee employee,
            Course course
    );
}