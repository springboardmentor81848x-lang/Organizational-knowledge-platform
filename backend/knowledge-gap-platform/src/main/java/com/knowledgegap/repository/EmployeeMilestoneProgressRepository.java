package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeMilestoneProgress;
import com.knowledgegap.entity.LearningMilestone;
import com.knowledgegap.entity.Course;

public interface EmployeeMilestoneProgressRepository
        extends JpaRepository<EmployeeMilestoneProgress, Long> {

    Optional<EmployeeMilestoneProgress>
    findByEmployeeAndMilestone(
            Employee employee,
            LearningMilestone milestone
    );

    List<EmployeeMilestoneProgress>
    findByEmployeeAndMilestone_CourseOrderByMilestone_MilestoneOrderAsc(
            Employee employee,
            Course course
    );

    List<EmployeeMilestoneProgress>
    findByEmployee(Employee employee);
}