package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.TrainingEnrollment;

public interface TrainingEnrollmentRepository
        extends JpaRepository<TrainingEnrollment, Long> {

    List<TrainingEnrollment> findByEmployee(Employee employee);

    List<TrainingEnrollment> findByCourse(Course course);

    Optional<TrainingEnrollment> findByEmployeeAndCourse(
            Employee employee,
            Course course
    );

    // =========================================================
    // DEPARTMENT HEAD DASHBOARD
    // =========================================================

    // Find all training enrollments for employees
    // belonging to a particular department
    List<TrainingEnrollment> findByEmployeeDepartmentId(
            Long departmentId
    );
}