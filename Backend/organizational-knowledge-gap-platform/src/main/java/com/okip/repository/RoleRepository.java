package com.okip.repository;

import java.util.Optional;
import com.okip.enums.RoleType;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {

	Optional<Role> findByRoleName(RoleType roleName);

}