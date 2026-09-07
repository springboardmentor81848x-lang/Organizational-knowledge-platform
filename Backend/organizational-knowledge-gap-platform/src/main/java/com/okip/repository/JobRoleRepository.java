package com.okip.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.JobRole;

public interface JobRoleRepository
        extends JpaRepository<JobRole, Long> {

    Optional<JobRole> findByJobRoleName(
            String jobRoleName);

    Optional<JobRole> findByJobRoleNameIgnoreCase(
            String jobRoleName);

}