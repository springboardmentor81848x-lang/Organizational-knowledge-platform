package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.MentorProfile;

public interface MentorProfileRepository
        extends JpaRepository<MentorProfile, Long> {

    List<MentorProfile> findByExpertiseContainingIgnoreCase(String expertise);
}