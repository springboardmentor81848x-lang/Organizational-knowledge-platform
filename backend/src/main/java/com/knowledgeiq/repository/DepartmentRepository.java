package com.knowledgeiq.repository;

import com.knowledgeiq.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    Optional<Department> findByName(String name);
    java.util.List<Department> findAllByName(String name);
    Optional<Department> findByNameAndOrganizationId(String name, UUID organizationId);
    java.util.List<Department> findByOrganizationId(UUID organizationId);
}
