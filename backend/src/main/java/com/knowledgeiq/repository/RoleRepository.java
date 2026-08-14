package com.knowledgeiq.repository;

import com.knowledgeiq.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByTitle(String title);
    java.util.List<Role> findAllByTitle(String title);
}
