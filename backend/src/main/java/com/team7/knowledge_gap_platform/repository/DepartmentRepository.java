package com.team7.knowledge_gap_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
