package com.knowledgegap.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.knowledgegap.entity.MentorProfile;

@Repository
public interface MentorProfileRepository
        extends JpaRepository<MentorProfile, Long> {

    Optional<MentorProfile> findByMentorId(Long mentorId);
}