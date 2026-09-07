package com.okip.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.JobRole;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.JobRoleCompetency;

public interface JobRoleCompetencyRepository
        extends JpaRepository<JobRoleCompetency, Long> {

    List<JobRoleCompetency> findByJobRole(
            JobRole jobRole);

    Optional<JobRoleCompetency>
        findByJobRoleAndSkill(
                JobRole jobRole,
                Skill skill);

}