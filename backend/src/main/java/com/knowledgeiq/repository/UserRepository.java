package com.knowledgeiq.repository;

import com.knowledgeiq.model.SystemRole;
import com.knowledgeiq.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    java.util.List<User> findAllByEmailIgnoreCase(String email);
    Boolean existsByEmail(String email);
    java.util.List<User> findByDepartmentId(UUID departmentId);
    java.util.List<User> findByManagerId(UUID managerId);
    java.util.List<User> findByDepartmentIdAndCompanyIgnoreCase(UUID departmentId, String company);
    java.util.List<User> findByDepartmentIdAndCompanyIgnoreCaseAndSystemRole(UUID departmentId, String company, SystemRole systemRole);
    Optional<User> findFirstBySystemRoleAndCompanyIgnoreCaseAndDepartmentId(SystemRole systemRole, String company, UUID departmentId);
    java.util.List<User> findBySystemRoleAndCompanyIgnoreCaseAndDepartmentIdAndManagerIsNull(SystemRole systemRole, String company, UUID departmentId);

    java.util.List<User> findByDepartmentIdAndOrganizationId(UUID departmentId, UUID organizationId);
    java.util.List<User> findByDepartmentIdAndOrganizationIdAndSystemRole(UUID departmentId, UUID organizationId, SystemRole systemRole);
    Optional<User> findFirstBySystemRoleAndOrganizationIdAndDepartmentId(SystemRole systemRole, UUID organizationId, UUID departmentId);
    java.util.List<User> findBySystemRoleAndOrganizationIdAndDepartmentIdAndManagerIsNull(SystemRole systemRole, UUID organizationId, UUID departmentId);
    java.util.List<User> findByOrganizationId(UUID organizationId);
    java.util.List<User> findByOrganizationIdAndSystemRole(UUID organizationId, SystemRole systemRole);

    @Query("SELECT DISTINCT u.organization.name FROM User u WHERE u.systemRole = 'MANAGER' AND u.organization IS NOT NULL")
    java.util.List<String> findDistinctCompaniesForManagers();
}
