package com.okip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.EmployeeProfile;

public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {

}