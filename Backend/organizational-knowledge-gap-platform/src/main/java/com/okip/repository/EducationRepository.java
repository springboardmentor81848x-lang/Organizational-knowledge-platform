package com.okip.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Employee;
import com.okip.entity.transaction.Education;

public interface EducationRepository
        extends JpaRepository<Education, Long> {

    List<Education> findByEmployee(Employee employee);

}