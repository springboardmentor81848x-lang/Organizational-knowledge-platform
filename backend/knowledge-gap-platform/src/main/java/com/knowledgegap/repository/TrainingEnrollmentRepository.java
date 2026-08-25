package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.TrainingEnrollment;

public interface TrainingEnrollmentRepository
        extends JpaRepository<TrainingEnrollment, Long> {

    // =========================================================
    // GET ALL ENROLLMENTS FOR EMPLOYEE
    // =========================================================

    List<TrainingEnrollment> findByEmployee(
            Employee employee
    );

    // =========================================================
    // GET ALL ENROLLMENTS FOR COURSE
    // =========================================================

    List<TrainingEnrollment> findByCourse(
            Course course
    );

    // =========================================================
    // CHECK EMPLOYEE + COURSE ENROLLMENT
    // =========================================================

    Optional<TrainingEnrollment> findByEmployeeAndCourse(
            Employee employee,
            Course course
    );
}