package com.okip.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Employee;
import com.okip.entity.master.MentorProfile;

public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {

    Optional<MentorProfile> findByEmployee(Employee employee);

    Optional<MentorProfile> findByEmployeeEmployeeId(Long employeeId);

    boolean existsByEmployeeEmployeeIdAndActiveTrue(Long employeeId);

}