package com.okip.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Employee;
import com.okip.entity.transaction.Experience;

public interface ExperienceRepository
        extends JpaRepository<Experience, Long> {

    List<Experience> findByEmployee(Employee employee);

}