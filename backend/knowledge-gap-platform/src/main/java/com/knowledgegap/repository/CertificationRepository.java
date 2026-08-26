package com.knowledgegap.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.Certification;
import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;

public interface CertificationRepository
        extends JpaRepository<Certification, Long> {

    // =========================================================
    // GET EMPLOYEE CERTIFICATIONS
    // =========================================================

    List<Certification> findByEmployee(Employee employee);

    // =========================================================
    // GET COURSE CERTIFICATIONS
    // =========================================================

    List<Certification> findByCourse(Course course);

    // =========================================================
    // CHECK EMPLOYEE + COURSE CERTIFICATION
    // =========================================================

    Optional<Certification> findByEmployeeAndCourse(
            Employee employee,
            Course course
    );
}