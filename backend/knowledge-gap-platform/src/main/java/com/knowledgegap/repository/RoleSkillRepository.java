package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.knowledgegap.entity.RoleSkill;

@Repository
public interface RoleSkillRepository
        extends JpaRepository<RoleSkill, Long> {

    List<RoleSkill> findByRoleId(Long roleId);
}
